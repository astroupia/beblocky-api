import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from '../service/stripe.service';
import { CreatePaymentDto } from '../../payment/dto/create-payment.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}
  @Post('stripe-checkout')
  async stripeCheckOut(@Body() body: Partial<CreatePaymentDto>) {
    const { items, successUrl, cancelUrl, userId } = body;

    if (!items || !successUrl || !cancelUrl || !userId) {
      throw new Error(
        'Missing required fields: items, successUrl, cancelUrl, userId',
      );
    }

    const formattedItems = Array.isArray(items) ? items : [items];

    // Transform items to match Stripe service expectations
    const stripeItems = formattedItems.map((item) => ({
      price: item.price, // This should be a Stripe price ID
      quantity: item.quantity || 1,
    }));

    return this.stripeService.stripeCheckOut(
      stripeItems,
      'payment', // Default mode, will be auto-detected based on price types
      successUrl,
      cancelUrl,
      userId,
    );
  }
}
