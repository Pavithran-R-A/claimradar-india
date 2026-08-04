import Link from 'next/link';
import { FaqAccordion, HeroCard } from '@/components/landing/interactive';
import {
  ShieldCheck,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Database,
  Scale,
  CalendarClock,
  FileText,
  Building2,
  Landmark,
  Newspaper,
  ArrowRight,
  Search,
  Users,
  Zap,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Demo seed data                                                             */
/* -------------------------------------------------------------------------- */

const demoClaims = [
  {
    id: '1',
    company: 'MetroRide Demo',
    title: 'Refund for overcharged monthly metro passes',
    status: 'Verified',
    who: 'Commuters who purchased monthly passes between Jan–Mar 2025',
    deadline: '30 days left',
    verified: '2 days ago',
  },
  {
    id: '2',
    company: 'SampleLearn Demo',
    title: 'Compensation for platform downtime affecting paid users',
    status: 'Under Review',
    who: 'Paid subscribers affected during March outage',
    deadline: null,
    verified: '5 days ago',
  },
  {
    id: '3',
    company: 'ShopSquare Demo',
    title: 'Price-match guarantee on electronics purchases',
    status: 'Open',
    who: 'Customers who bought electronics at full price within 30 days of a sale',
    deadline: '14 days left',
    verified: '1 day ago',
  },
  {
    id: '4',
    company: 'MetroRide Demo',
    title: 'Delay compensation for suburban rail commuters',
    status: 'Verified',
    who: 'Season ticket holders on the western corridor',
    deadline: '7 days left',
    verified: '3 hours ago',
  },
  {
    id: '5',
    company: 'SampleLearn Demo',
    title: 'Refund for cancelled certification exams',
    status: 'Open',
    who: 'Candidates who registered for Q1 exams that were cancelled',
    deadline: null,
    verified: '1 week ago',
  },
  {
    id: '6',
    company: 'ShopSquare Demo',
    title: 'Extended warranty claims on home appliances',
    status: 'Verified',
    who: 'Buyers of select home appliances purchased in 2024',
    deadline: '72 hours left',
    verified: '6 hours ago',
  },
];

const closingSoon = [
  {
    company: 'ShopSquare Demo',
    title: 'Extended warranty claims',
    hoursLeft: 72,
    urgency: 'critical',
  },
  { company: 'MetroRide Demo', title: 'Delay compensation', hoursLeft: 168, urgency: 'high' },
  { company: 'ShopSquare Demo', title: 'Price-match guarantee', hoursLeft: 336, urgency: 'medium' },
  { company: 'MetroRide Demo', title: 'Metro pass refund', hoursLeft: 720, urgency: 'normal' },
];

const faqItems = [
  {
    question: 'What is ClaimRadar?',
    answer:
      'ClaimRadar is an independent information platform that aggregates publicly available refund, compensation and claim opportunities from official sources in India. We do not file claims on your behalf.',
  },
  {
    question: 'Is ClaimRadar a government website?',
    answer:
      'No. ClaimRadar is an independent platform. We are not affiliated with the Government of India, any court, regulator or listed company. We link to official sources so you can verify information yourself.',
  },
  {
    question: 'Does ClaimRadar guarantee I will receive money?',
    answer:
      'No. We surface potential opportunities based on publicly available information. Whether you qualify or receive a refund depends on the specific scheme, your circumstances and the official process.',
  },
  {
    question: 'How does ClaimRadar find opportunities?',
    answer:
      'We monitor consumer courts, financial regulators, government press releases, company public notices and other official sources. Our systems extract structured data and our editorial team reviews it before publication.',
  },
  {
    question: 'Is my personal data safe?',
    answer:
      'Yes. We collect minimal data required to operate the platform. We do not sell your data to third parties. See our Privacy Policy for details on what we collect and how it is used.',
  },
  {
    question: 'What does the free plan include?',
    answer:
      'The free plan gives you access to browse all published claimables, search by company or sector, and view deadlines and source links. You can also set up a basic watchlist for one company.',
  },
  {
    question: 'What does ClaimRadar Plus include?',
    answer:
      'Plus subscribers get unlimited watchlists, email and push alerts for new opportunities matching their watchlist, priority access to closing-soon alerts, and detailed source breakdowns. Plus costs ₹149 per month or ₹999 per year.',
  },
  {
    question: 'How do I report an error or outdated information?',
    answer:
      'Visit our Corrections page and submit a report. Our editorial team reviews all correction requests and updates published content when verified. We aim to process corrections within 48 hours.',
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer:
      'Yes. You can cancel your ClaimRadar Plus subscription at any time from your account settings. You will retain access until the end of your current billing period. See our Refund Policy for details on prorated refunds.',
  },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  return (
    <>
      {/* Trust Strip */}
      <div className="border-b border-border bg-background-elevated py-2 text-center text-xs text-text-muted">
        Independent legal-information platform · Official sources linked · No guaranteed payouts
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-screen-xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mx-auto max-w-4xl text-3xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            Find company refunds and compensation opportunities{' '}
            <span className="font-serif italic text-trust-primary">you may be missing.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
            ClaimRadar monitors official sources — consumer courts, regulators, company notices —
            and surfaces verified refund and compensation opportunities so you never miss a
            deadline.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-lg bg-trust-primary px-8 text-base font-semibold text-white shadow-lg shadow-trust-primary/20 transition-all hover:bg-trust-primary-hover hover:shadow-xl"
            >
              Check My Matches — Free
            </Link>
            <Link
              href="/claimables"
              className="inline-flex h-12 items-center rounded-lg border border-border bg-transparent px-8 text-base font-semibold text-text-primary transition-colors hover:bg-surface"
            >
              Browse Latest Claimables
            </Link>
          </div>
          <p className="mt-4 text-xs text-text-muted">
            No Aadhaar upload required · Official sources shown · Cancel alerts anytime
          </p>
          <HeroCard />
        </div>
      </section>

      {/* Activity Strip */}
      <section className="border-y border-border bg-surface py-8">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { label: 'Sources monitored', value: '42+' },
              { label: 'Updates this week', value: '18' },
              { label: 'Active opportunities', value: '156' },
              { label: 'Closing within 30 days', value: '23' },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-2xl font-bold text-text-primary sm:text-3xl">{m.value}</p>
                <p className="mt-1 text-xs text-text-muted sm:text-sm">{m.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] text-text-muted">
            Based on current demo data. Live metrics will vary.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            How it works
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: '01',
                icon: Search,
                title: 'Select companies and services you use',
                desc: 'Add companies, products or services to your watchlist. We match you to relevant opportunities.',
              },
              {
                step: '02',
                icon: Bell,
                title: 'Receive potential matches from verified public information',
                desc: 'Our systems scan official sources and notify you when a match is found for your profile.',
              },
              {
                step: '03',
                icon: FileText,
                title: 'Follow the official claim or complaint route',
                desc: 'Each listing links to the official process. You file directly with the relevant authority.',
              },
            ].map((s) => (
              <div key={s.step} className="relative rounded-lg border border-border bg-surface p-6">
                <span className="text-xs font-bold text-trust-primary">{s.step}</span>
                <s.icon className="mt-3 h-8 w-8 text-text-muted" />
                <h3 className="mt-4 text-base font-semibold text-text-primary">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-text-muted">
            ClaimRadar does not approve or file claims. We provide information only.
          </p>
        </div>
      </section>

      {/* Top Claimables */}
      <section className="border-t border-border bg-background-elevated py-16 sm:py-24">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Latest Verified Opportunities
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {demoClaims.map((claim) => (
              <div
                key={claim.id}
                className="relative rounded-lg border border-border bg-surface p-5"
              >
                <span className="absolute -top-2 right-3 rounded-full bg-deadline-background px-2 py-0.5 text-[10px] font-semibold text-deadline">
                  DEMO
                </span>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{claim.company}</p>
                    <p className="mt-1 text-sm text-text-secondary">{claim.title}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      claim.status === 'Verified'
                        ? 'bg-verified-background text-success'
                        : claim.status === 'Under Review'
                          ? 'bg-info/10 text-info'
                          : 'bg-trust-primary/10 text-trust-primary'
                    }`}
                  >
                    {claim.status}
                  </span>
                </div>
                <p className="mt-3 text-xs text-text-muted">Who may qualify: {claim.who}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
                  {claim.deadline ? (
                    <span
                      className={
                        claim.deadline === '72 hours left'
                          ? 'font-medium text-danger'
                          : 'text-deadline'
                      }
                    >
                      <Clock className="mr-1 inline h-3 w-3" />
                      {claim.deadline}
                    </span>
                  ) : (
                    <span>—</span>
                  )}
                  <span>Verified {claim.verified}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Soon */}
      <section className="border-t border-border py-16 sm:py-24">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Closing Soon
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Real deadlines — do not miss your window.
          </p>
          <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
            {closingSoon.map((item, i) => (
              <div
                key={i}
                className="relative w-64 shrink-0 rounded-lg border border-border bg-surface p-4"
              >
                <span className="absolute -top-2 right-3 rounded-full bg-deadline-background px-2 py-0.5 text-[10px] font-semibold text-deadline">
                  DEMO
                </span>
                <p className="text-sm font-medium text-text-primary">{item.company}</p>
                <p className="mt-1 text-xs text-text-secondary">{item.title}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <CalendarClock
                    className={`h-4 w-4 ${item.urgency === 'critical' ? 'text-danger' : item.urgency === 'high' ? 'text-deadline' : 'text-text-muted'}`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      item.urgency === 'critical'
                        ? 'text-danger'
                        : item.urgency === 'high'
                          ? 'text-deadline'
                          : 'text-text-muted'
                    }`}
                  >
                    {item.hoursLeft < 24
                      ? `${item.hoursLeft}h left`
                      : `${Math.floor(item.hoursLeft / 24)} days left`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Watchlist Section */}
      <section className="border-t border-border bg-background-elevated py-16 sm:py-24">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Watch companies you already use
              </h2>
              <p className="mt-4 text-base leading-relaxed text-text-secondary">
                Create a watchlist of companies whose products or services you use. Get email and
                push alerts the moment a new refund, compensation or claim opportunity is published.
              </p>
              <Link
                href="/signup"
                className="mt-6 inline-flex h-10 items-center rounded-md bg-trust-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-trust-primary-hover"
              >
                Create Free Watchlist
              </Link>
            </div>
            {/* Watchlist mockup */}
            <div className="rounded-lg border border-border bg-surface p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Your watchlist
              </p>
              {['MetroRide Demo', 'SampleLearn Demo', 'ShopSquare Demo'].map((c) => (
                <div
                  key={c}
                  className="flex items-center justify-between border-b border-border py-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-strong text-xs font-bold text-text-muted">
                      {c[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{c}</p>
                      <p className="text-xs text-text-muted">2 active opportunities</p>
                    </div>
                  </div>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                  </span>
                </div>
              ))}
              <p className="mt-2 text-right text-[10px] text-text-muted">DEMO</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why ClaimRadar */}
      <section className="border-t border-border py-16 sm:py-24">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Why ClaimRadar
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Database,
                title: 'Primary sources first',
                desc: 'Every claim links back to an official source — court orders, regulator notices, company announcements.',
              },
              {
                icon: ShieldCheck,
                title: 'Clear status classifications',
                desc: 'Verified, Under Review, Open, Closed — every listing has a transparent status based on our editorial criteria.',
              },
              {
                icon: AlertTriangle,
                title: 'No fake estimated payouts',
                desc: 'We never invent payout figures. If an amount is stated, it comes from the official source.',
              },
              {
                icon: CalendarClock,
                title: 'Dates and evidence shown',
                desc: 'Publication dates, last-verified timestamps and deadline countdowns are visible on every listing.',
              },
              {
                icon: CheckCircle2,
                title: 'Corrections accepted',
                desc: 'Spotted an error? Submit a correction through our Corrections page and our team reviews it within 48 hours.',
              },
              {
                icon: Zap,
                title: 'Automated monitoring with editorial safeguards',
                desc: 'AI-powered discovery combined with human editorial review before anything is published.',
              },
            ].map((f) => (
              <div key={f.title} className="rounded-lg border border-border bg-surface p-5">
                <f.icon className="h-6 w-6 text-trust-primary" />
                <h3 className="mt-3 text-sm font-semibold text-text-primary">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Source Methodology */}
      <section className="border-t border-border bg-background-elevated py-16 sm:py-24">
        <div className="mx-auto max-w-screen-xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Source methodology
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-text-secondary">
            We monitor five categories of official sources to discover and verify claimable
            opportunities.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Users, label: 'Consumer authorities' },
              { icon: Scale, label: 'Courts and tribunals' },
              { icon: Landmark, label: 'Financial regulators' },
              { icon: Building2, label: 'Company public notices' },
              { icon: Newspaper, label: 'Government press releases' },
            ].map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-secondary"
              >
                <s.icon className="h-4 w-4 text-text-muted" />
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Personalized Match CTA (visual only) */}
      <section className="border-t border-border py-16 sm:py-24">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-surface p-8 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                  Find your personalized matches
                </h2>
                <p className="mt-3 text-sm text-text-secondary">
                  Answer a few quick questions and we will show you opportunities that match your
                  profile.
                </p>
              </div>
              {/* Visual questionnaire mockup */}
              <div className="space-y-4 rounded-lg bg-background-elevated p-5">
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-muted">
                    Company or service
                  </label>
                  <div className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-text-muted flex items-center">
                    Select a company…
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-muted">
                      Category
                    </label>
                    <div className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-text-muted flex items-center">
                      All categories
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-muted">Period</label>
                    <div className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-text-muted flex items-center">
                      Last 12 months
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-muted">State</label>
                    <div className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-text-muted flex items-center">
                      All states
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-muted">
                      Proof available?
                    </label>
                    <div className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-text-muted flex items-center">
                      Optional
                    </div>
                  </div>
                </div>
                <button
                  className="inline-flex h-10 w-full items-center justify-center rounded-md bg-trust-primary text-sm font-semibold text-white opacity-50 cursor-not-allowed"
                  disabled
                >
                  Check Matches
                </button>
                <p className="text-center text-[11px] text-text-muted">
                  Interactive version coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="border-t border-border bg-background-elevated py-16 sm:py-24">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Simple, transparent pricing
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mx-auto lg:max-w-3xl">
            {/* Free */}
            <div className="rounded-lg border border-border bg-surface p-6">
              <p className="text-sm font-semibold text-text-muted">Free</p>
              <p className="mt-2 text-3xl font-bold text-text-primary">₹0</p>
              <p className="text-sm text-text-muted">Forever free</p>
              <ul className="mt-6 space-y-3 text-sm text-text-secondary">
                {[
                  'Browse all published claimables',
                  'Search by company or sector',
                  'View deadlines and sources',
                  'Basic watchlist (1 company)',
                  'Email digest (weekly)',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 inline-flex h-10 w-full items-center justify-center rounded-md border border-border text-sm font-medium text-text-primary transition-colors hover:bg-surface-strong"
              >
                Get Started
              </Link>
            </div>
            {/* Plus */}
            <div className="relative rounded-lg border border-trust-primary bg-surface p-6">
              <span className="absolute -top-3 left-6 rounded-full bg-trust-primary px-3 py-0.5 text-xs font-semibold text-white">
                Popular
              </span>
              <p className="text-sm font-semibold text-trust-primary">Plus</p>
              <p className="mt-2 text-3xl font-bold text-text-primary">
                ₹149<span className="text-base font-normal text-text-muted">/mo</span>
              </p>
              <p className="text-sm text-text-muted">or ₹999/year (save 44%)</p>
              <ul className="mt-6 space-y-3 text-sm text-text-secondary">
                {[
                  'Everything in Free',
                  'Unlimited watchlists',
                  'Real-time email & push alerts',
                  'Priority closing-soon alerts',
                  'Detailed source breakdowns',
                  'Cancel anytime',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 inline-flex h-10 w-full items-center justify-center rounded-md bg-trust-primary text-sm font-semibold text-white transition-colors hover:bg-trust-primary-hover"
              >
                Upgrade to Plus
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="text-sm text-trust-primary hover:text-trust-primary-hover transition-colors"
            >
              View full feature comparison <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border py-16 sm:py-24">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-10">
            <FaqAccordion items={faqItems} />
          </div>
          <p className="mt-8 text-center text-sm text-text-secondary">
            Still have questions?{' '}
            <Link href="/contact" className="text-trust-primary hover:text-trust-primary-hover">
              Contact us
            </Link>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative border-t border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-trust-primary/10 via-transparent to-success/5" />
        <div className="relative mx-auto max-w-screen-xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Do not discover a deadline after it has already passed.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
            Create a free watchlist and receive updates when new refund, compensation or claim
            opportunities are published for companies you care about.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex h-12 items-center rounded-lg bg-trust-primary px-8 text-base font-semibold text-white shadow-lg shadow-trust-primary/20 transition-all hover:bg-trust-primary-hover hover:shadow-xl"
          >
            Create Free Watchlist
          </Link>
        </div>
      </section>
    </>
  );
}
