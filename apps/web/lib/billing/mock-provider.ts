/**
 * Mock billing provider scaffolding.
 *
 * Billing is behind NEXT_PUBLIC_ENABLE_BILLING (currently false). This module
 * defines the provider interface and a mock implementation so the product area
 * can be wired without any real payment integration. No real payments are ever
 * processed by this code.
 */

export interface BillingPlan {
  id: string;
  name: string;
  tier: 'free' | 'pro';
  priceMonthlyInr: number;
  features: string[];
}

export interface BillingSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'pending';
  currentPeriodEnd: string | null;
}

export interface CheckoutSession {
  id: string;
  redirectUrl: string;
}

/** Provider contract a real integration (e.g. Razorpay) would implement. */
export interface BillingProvider {
  readonly name: string;
  listPlans(): Promise<BillingPlan[]>;
  getSubscription(userId: string): Promise<BillingSubscription | null>;
  createCheckoutSession(userId: string, planId: string): Promise<CheckoutSession>;
  cancelSubscription(subscriptionId: string): Promise<{ ok: boolean }>;
}

const MOCK_PLANS: BillingPlan[] = [
  {
    id: 'plan_free',
    name: 'Free',
    tier: 'free',
    priceMonthlyInr: 0,
    features: [
      'Up to 5 watched companies',
      'Up to 3 watched sectors',
      'Up to 10 tracked claims',
      'Deterministic match alerts',
    ],
  },
  {
    id: 'plan_pro_mock',
    name: 'Pro (mock)',
    tier: 'pro',
    priceMonthlyInr: 299,
    features: [
      'Unlimited watchlists',
      'Unlimited tracked claims',
      'Priority deadline alerts',
      'Digest customisation',
    ],
  },
];

/**
 * In-memory mock provider. Clearly labelled as a mock everywhere it surfaces
 * in the UI; swap for a real provider when billing is enabled.
 */
export const mockBillingProvider: BillingProvider = {
  name: 'mock',

  async listPlans() {
    return MOCK_PLANS;
  },

  async getSubscription(_userId: string) {
    return null;
  },

  async createCheckoutSession(userId: string, planId: string) {
    return {
      id: `mock_session_${userId.slice(0, 8)}_${planId}`,
      redirectUrl: '/app/billing?mock_checkout=1',
    };
  },

  async cancelSubscription(_subscriptionId: string) {
    return { ok: true };
  },
};

export function getBillingProvider(): BillingProvider {
  return mockBillingProvider;
}

export function isBillingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_BILLING === 'true';
}
