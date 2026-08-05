import { Alert, Badge, Button, Card, EmptyState } from '@claimradar/design-system';
import { CreditCard, Lock } from 'lucide-react';
import { requireAppAuth } from '@/lib/app-auth';
import {
  getBillingProvider,
  isBillingEnabled,
  type BillingPlan,
} from '@/lib/billing/mock-provider';

export const dynamic = 'force-dynamic';

function PlanCard({ plan, enabled }: { plan: BillingPlan; enabled: boolean }) {
  return (
    <Card className="flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">{plan.name}</h2>
        {plan.tier === 'free' ? (
          <Badge variant="success">Current</Badge>
        ) : (
          <Badge variant="secondary">Mock preview</Badge>
        )}
      </div>
      <p className="mb-4 text-2xl font-bold text-text-primary">
        ₹{plan.priceMonthlyInr}
        <span className="text-sm font-normal text-text-muted">/month</span>
      </p>
      <ul className="mb-6 space-y-2 text-sm text-text-secondary">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-trust-primary" aria-hidden />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <Button variant={plan.tier === 'free' ? 'outline' : 'default'} disabled className="w-full">
          <Lock className="mr-2 h-4 w-4" aria-hidden />
          {enabled ? 'Checkout coming soon' : 'Billing not enabled'}
        </Button>
      </div>
    </Card>
  );
}

export default async function BillingPage() {
  await requireAppAuth();

  const billingEnabled = isBillingEnabled();
  const plans = await getBillingProvider().listPlans();

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-2">
        <CreditCard className="mt-1 h-6 w-6 text-trust-primary" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Billing</h1>
          <p className="mt-1 text-sm text-text-secondary">
            You are on the free plan. Paid plans are not live yet.
          </p>
        </div>
      </div>

      {!billingEnabled ? (
        <Card>
          <EmptyState
            icon={<Lock className="h-8 w-8" aria-hidden />}
            title="Billing is not enabled"
            description="Paid plans are switched off for now (NEXT_PUBLIC_ENABLE_BILLING is false). Everything you use today is free, and no payment details are ever collected."
          />
        </Card>
      ) : (
        <Alert variant="info" title="Preview mode">
          Billing is flagged on in this environment, but only a mock provider is wired — no real
          payments are processed.
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} enabled={billingEnabled} />
        ))}
      </div>

      <p className="text-xs text-text-muted">
        When billing launches it will be clearly labelled, priced in INR, and cancellable at any
        time from this page.
      </p>
    </div>
  );
}
