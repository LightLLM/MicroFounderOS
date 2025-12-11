import Stripe from 'stripe';

export class StripeBilling {
  private stripe: Stripe;
  private priceId: string;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY || '';
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });
    this.priceId = process.env.STRIPE_PRICE_ID || '';
  }

  async createCheckoutSession(
    userId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; url: string }> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: this.priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: userId,
        metadata: {
          userId,
        },
      });

      return {
        sessionId: session.id,
        url: session.url || '',
      };
    } catch (error) {
      console.error('Stripe checkout error:', error);
      throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createPortalSession(userId: string, returnUrl: string): Promise<{ url: string }> {
    try {
      // First, find the customer by metadata
      const customers = await this.stripe.customers.list({
        limit: 100,
      });
      
      const customer = customers.data.find(c => c.metadata?.userId === userId);
      
      if (!customer) {
        throw new Error('Customer not found');
      }

      const session = await this.stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: returnUrl,
      });

      return { url: session.url };
    } catch (error) {
      console.error('Stripe portal error:', error);
      throw new Error(`Failed to create portal session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSubscriptionStatus(userId: string): Promise<'active' | 'inactive' | 'trialing'> {
    try {
      const customers = await this.stripe.customers.list({
        limit: 100,
      });
      
      const customer = customers.data.find(c => c.metadata?.userId === userId);
      
      if (!customer) {
        return 'inactive';
      }

      const subscriptions = await this.stripe.subscriptions.list({
        customer: customer.id,
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return 'inactive';
      }

      const subscription = subscriptions.data[0];
      
      if (subscription.status === 'active') {
        return 'active';
      } else if (subscription.status === 'trialing') {
        return 'trialing';
      }

      return 'inactive';
    } catch (error) {
      console.error('Stripe subscription status error:', error);
      return 'inactive';
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      
      switch (event.type) {
        case 'checkout.session.completed':
          // Handle successful checkout
          console.log('Checkout completed:', event.data.object);
          break;
        case 'customer.subscription.updated':
          // Handle subscription update
          console.log('Subscription updated:', event.data.object);
          break;
        case 'customer.subscription.deleted':
          // Handle subscription cancellation
          console.log('Subscription deleted:', event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Stripe webhook error:', error);
      throw new Error(`Webhook verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

