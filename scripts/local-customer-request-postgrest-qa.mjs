// LOCAL-ONLY PostgREST acceptance. Requires "supabase start"; never targets hosted DB.
// No real users/records, no outbound email, no production credentials, no spending.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const output = execFileSync('supabase', ['status', '-o', 'env'], { encoding: 'utf8' });
const env = {};
for (const line of output.split(/\r?\n/)) {
  const pair = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (pair) env[pair[1]] = pair[2].replace(/^"|"$/g, '');
}
const origin = new URL(env.API_URL || '');
assert.equal(origin.protocol, 'http:');
assert.ok(['localhost', '127.0.0.1'].includes(origin.hostname));
assert.equal(origin.port, '54321', 'Refusing any target other than local Supabase');
const anon = env.ANON_KEY;
const service = env.SERVICE_ROLE_KEY;
assert.ok(anon && service, 'Only local CLI-provided credentials are accepted');

let checks = 0;
function verify(condition, description) {
  assert.ok(condition, description);
  checks += 1;
}
async function call(path, key, method = 'GET', data, jwt = key) {
  const headers = { apikey: key, authorization: 'Bearer ' + jwt,
    prefer: 'return=representation' };
  if (data !== undefined) headers['content-type'] = 'application/json';
  const response = await fetch(new URL(path, origin), {
    method, headers,
    body: data === undefined ? undefined : JSON.stringify(data),
    signal: AbortSignal.timeout(12000),
  });
  const text = await response.text();
  let json = null;
  if (text) {
    try { json = JSON.parse(text); }
    catch { json = { malformed: true }; }
  }
  return { status: response.status, data: json };
}
function mustPass(response, description) {
  verify(response.status >= 200 && response.status < 300,
    description + ': HTTP ' + response.status);
  return response.data;
}
function noRows(response, description) {
  verify([401,403].includes(response.status) ||
    (response.status >= 200 && response.status < 300 &&
      (response.data === null || (Array.isArray(response.data) && response.data.length === 0))),
    description + ': unauthorized response HTTP ' + response.status);
}
const suffix = randomUUID().slice(0, 8);
const password = 'Local!Rls9Safe-' + suffix;
async function identity(label, role) {
  const email = 'local-rls-' + suffix + '-' + label + '@example.invalid';
  const created = mustPass(await call('/auth/v1/admin/users', service, 'POST',
    { email, password, email_confirm: true }), 'local create ' + label);
  const id = created.id || created.user?.id;
  verify(typeof id === 'string' && /^[a-f0-9-]{36}$/i.test(id), 'identity ' + label);
  if (role !== 'user') {
    const changed = mustPass(await call('/rest/v1/profiles?id=eq.' + id +
      '&select=id,role', service, 'PATCH', { role }), 'role ' + label);
    verify(Array.isArray(changed) && changed.length === 1 &&
      changed[0].role === role, 'role assigned ' + label);
  }
  const login = mustPass(await call('/auth/v1/token?grant_type=password',
    anon, 'POST', { email, password }), 'local login ' + label);
  verify(typeof login.access_token === 'string', 'JWT ' + label);
  return { id, jwt: login.access_token, label };
}
const a = await identity('owner-a', 'user');
const b = await identity('owner-b', 'user');
const researcher = await identity('researcher', 'researcher');
const editor = await identity('editor', 'editor');
const legal = await identity('legal', 'legal_reviewer');
const admin = await identity('admin', 'admin');

const cases = [
  { name: 'user_correction_requests',
    payload: id => ({ user_id:id, target:'account', description:'local test only' }),
    update: { status:'in_review' } },
  { name: 'grievance_contacts',
    payload: id => ({ user_id:id, subject:'local test only',
      message:'local only', contact_email:'local-qa@example.invalid' }),
    update: { status:'acknowledged' } },
];
for (const item of cases) {
  const endpoint = '/rest/v1/' + item.name;
  const rowA = mustPass(await call(endpoint, anon, 'POST',
    item.payload(a.id), a.jwt), item.name + ' create A');
  const rowB = mustPass(await call(endpoint, anon, 'POST',
    item.payload(b.id), b.jwt), item.name + ' create B');
  verify(Array.isArray(rowA) && rowA.length === 1 && rowA[0].user_id === a.id,
    item.name + ' own A insert');
  verify(Array.isArray(rowB) && rowB.length === 1 && rowB[0].user_id === b.id,
    item.name + ' own B insert');
  const ids = [rowA[0].id,rowB[0].id];
  const selection = endpoint + '?id=in.(' + ids.join(',') + ')&select=id,user_id';
  for (const owner of [a,b]) {
    const found = mustPass(await call(selection, anon, 'GET', undefined,
      owner.jwt), item.name + ' read ' + owner.label);
    verify(Array.isArray(found) && found.length === 1 &&
      found[0].user_id === owner.id, item.name + ' own read only: ' + owner.label);
  }
  const fake = await call(endpoint, anon, 'POST', item.payload(b.id), a.jwt);
  verify([401,403].includes(fake.status), item.name + ' cross-user insert blocked');
  noRows(await call(endpoint + '?id=eq.' + ids[1] + '&select=id',
    anon, 'PATCH', item.update, a.jwt), item.name + ' cross-user update blocked');
  noRows(await call(endpoint + '?id=eq.' + ids[1] + '&select=id',
    anon, 'DELETE', undefined, a.jwt), item.name + ' cross-user delete blocked');
  for (const staff of [researcher, editor, legal]) {
    noRows(await call(selection, anon, 'GET', undefined, staff.jwt),
      item.name + ' staff read denied: ' + staff.label);
    noRows(await call(endpoint + '?id=eq.' + ids[0] + '&select=id',
      anon, 'PATCH', item.update, staff.jwt),
      item.name + ' staff update denied: ' + staff.label);
    noRows(await call(endpoint + '?id=eq.' + ids[0] + '&select=id',
      anon, 'DELETE', undefined, staff.jwt),
      item.name + ' staff delete denied: ' + staff.label);
    const denied = await call(endpoint, anon, 'POST',
      item.payload(a.id), staff.jwt);
    verify([401,403].includes(denied.status),
      item.name + ' staff spoofed insert denied: ' + staff.label);
  }
  noRows(await call(selection, anon), item.name + ' anonymous read denied');
  const adminRows = mustPass(await call(selection, anon, 'GET', undefined,
    admin.jwt), item.name + ' admin read');
  verify(Array.isArray(adminRows) && adminRows.length === 2,
    item.name + ' admin can see both customers');
  const triaged = mustPass(await call(endpoint + '?id=eq.' + ids[0] +
    '&select=id,status', anon, 'PATCH', item.update, admin.jwt),
    item.name + ' admin update');
  verify(Array.isArray(triaged) && triaged.length === 1 &&
    triaged[0].id === ids[0], item.name + ' admin can triage');
  const after = mustPass(await call(selection, anon, 'GET', undefined,
    admin.jwt), item.name + ' final');
  verify(Array.isArray(after) && after.length === 2,
    item.name + ' denied requests did not mutate the rows');
}
console.log('Local-only PostgREST Auth/RLS checks PASS: ' + checks + ' assertions');
