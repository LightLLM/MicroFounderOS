import { StripeBilling } from '../stripe-billing.js';
import Stripe from 'stripe';

jest.mock('stripe');

describe('StripeBilling', () => {
  let stripeBilling: StripeBilling;
  let mockStripe: jest.Mocked<Stripe>;

  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_key';
    process.env.STRIPE_PRICE_ID = 'price_test_id';

    mockStripe = {
      checkout: {
        sessions: {
          create: jest.fn(),
        },
      },
      billingPortal: {
        sessions: {
          create: jest.fn(),
        },
      },
      customers: {
        list: jest.fn(),
      },
      subscriptions: {
        list: jest.fn(),
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
    } as any;

    (Stripe as jest.Mock).mockImplementation(() => mockStripe);
    stripeBilling = new StripeBilling();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create checkout session', async () => {
      const mockSession = {
        id: 'session-123',
        url: 'https://checkout.stripe.com/session-123',
      };
      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession as any);

      const result = await stripeBilling.createCheckoutSession(
        'user-123',
        'https://success.com',
        'https://cancel.com'
      );

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: 'price_test_id', quantity: 1 }],
        success_url: 'https://success.com',
        cancel_url: 'https://cancel.com',
        client_reference_id: 'user-123',
        metadata: { userId: 'user-123' },
      });
      expect(result.sessionId).toBe('session-123');
      expect(result.url).toBe('https://checkout.stripe.com/session-123');
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return active for active subscription', async () => {
      mockStripe.customers.list.mockResolvedValue({
        data: [{ id: 'customer-123', metadata: { userId: 'user-123' } }],
      } as any);
      mockStripe.subscriptions.list.mockResolvedValue({
        data: [{ status: 'active' }],
      } as any);

      const status = await stripeBilling.getSubscriptionStatus('user-123');

      expect(status).toBe('active');
    });

    it('should return inactive when no customer found', async () => {
      mockStripe.customers.list.mockResolvedValue({ data: [] } as any);

      const status = await stripeBilling.getSubscriptionStatus('user-123');

      expect(status).toBe('inactive');
    });

    it('should return trialing for trialing subscription', async () => {
      mockStripe.customers.list.mockResolvedValue({
        data: [{ id: 'customer-123', metadata: { userId: 'user-123' } }],
      } as any);
      mockStripe.subscriptions.list.mockResolvedValue({
        data: [{ status: 'trialing' }],
      } as any);

      const status = await stripeBilling.getSubscriptionStatus('user-123');

      expect(status).toBe('trialing');
    });
  });

  describe('handleWebhook', () => {
    it('should handle webhook events', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: { object: { id: 'session-123' } },
      };
      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as any);

      await stripeBilling.handleWebhook('payload', 'signature');

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalled();
    });

    it('should throw error on invalid signature', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(
        stripeBilling.handleWebhook('payload', 'invalid-signature')
      ).rejects.toThrow('Webhook verification failed');
    });
  });
});

