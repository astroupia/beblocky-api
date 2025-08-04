import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { paymentLogger } from 'src/utils/logger';
import { CreatePaymentDto } from 'src/payment/dto/create-payment.dto';
import { PaymentRepository } from 'src/payment/repositories/payment.repository';
import { Type } from 'class-transformer';
import { PaymentStatus } from 'src/common/payment-provider.enums';
@Injectable()
export class StripeService {
  constructor(
    private readonly configService: ConfigService,
    private readonly PaymentRepository: PaymentRepository,
  ) {}

  async tryWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs),
      ),
    ]);
  }
  // async stripeCheckOut(
  //   items,
  //   mode: 'payment' | 'subscription',
  //   success_url: string | undefined,
  //   cancel_url,
  //   userId,
  // ) {
  //   const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
  //   if (!stripeSecretKey) {
  //     throw new Error('Stripe secret key is not configured');
  //   }

  //   const stripe = new Stripe(stripeSecretKey);

  //   const line_items = [{ price: items.price, quantity: items.quantity }];
  //   let lastError: any;

  //   for (let attempt = 1; attempt <= 3; attempt++) {
  //     try {
  //       const result: Stripe.Checkout.Session = await this.tryWithTimeout(
  //         () =>
  //           stripe.checkout.sessions.create({
  //             line_items,
  //             mode,
  //             success_url: success_url,
  //             cancel_url: cancel_url,
  //           }),
  //         5000,
  //       );
  //       const paymentToSave = {
  //         userId: userId,
  //         sessionId: result.id,
  //         amount: line_items[0].price * line_items[0].quantity,
  //         cancelUrl: cancel_url,
  //         successUrl: success_url,
  //         transactionStatus: PaymentStatus.PENDING,
  //         items: items,
  //       };

  //       await this.PaymentRepository.create(paymentToSave);

  //       paymentLogger.info({
  //         message: 'Stripe checkout session created successfully',
  //         userId: userId,
  //         sessionId: result.id,
  //         url: result.url,
  //       });
  //       return {
  //         sessionId: result.id,
  //         url: result.url,
  //       };
  //     } catch (error) {
  //       lastError = error;
  //       paymentLogger.error({
  //         message: `Attempt ${attempt} failed to create Stripe checkout session`,
  //         userId: userId,
  //         error: error instanceof Error ? error.message : String(error),
  //       });
  //       if (attempt === 3) {
  //         throw new Error(
  //           `Failed to create Stripe checkout session after 3 attempts: ${error}`,
  //         );
  //       }
  //       await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
  //     }
  //   }
  // }
  async stripeCheckOut(
    items: { price: any; quantity: number }[],
    mode: 'payment' | 'subscription',
    success_url: string,
    cancel_url: string,
    userId: string,
  ): Promise<any> {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey)
      throw new Error('Stripe secret key is not configured');

    const stripe = new Stripe(stripeSecretKey);
    if (!Array.isArray(items)) {
      throw new Error('Items must be an array');
    }

    const line_items = items.map((item) => ({
      price: item.price,
      quantity: item.quantity,
    }));

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await this.tryWithTimeout(
          () =>
            stripe.checkout.sessions.create({
              line_items,
              mode,
              success_url,
              cancel_url,
            }),
          5000,
        );

        const paymentToSave = {
          userId,
          sessionId: result.id,
          transactionStatus: PaymentStatus.PENDING,
          items: items.map((item) => ({
            stripePriceId: item.price,
            quantity: item.quantity,
          })),
          cancelUrl: cancel_url,
          successUrl: success_url,
          expireDate: new Date(Date.now() + 10 * 60 * 1000),
          notifyUrl: 'https://yourapp.com/stripe/webhook',
          errorUrl: 'https://yourapp.com/payment/failed',
        };

        // await this.PaymentRepository.create(paymentToSave);

        paymentLogger.info({
          event: 'Stripe Checkout Session Created',
          userId,
          sessionId: result.id,
          url: result.url,
        });

        return {
          sessionId: result.id,
          url: result.url,
        };
      } catch (error) {
        paymentLogger.error({
          event: `Attempt ${attempt} Failed`,
          userId,
          reason: error instanceof Error ? error.message : String(error),
        });

        if (attempt === 3) {
          throw new Error(
            `Failed to create Stripe checkout session after 3 attempts: ${error}`,
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
}
