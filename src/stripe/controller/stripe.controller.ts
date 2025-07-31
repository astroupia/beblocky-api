import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from '../service/stripe.service';
import { CreatePaymentDto } from '../../payment/dto/create-payment.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService

  ) {}
  @Post('stripe-checkout')
  async stripeCheckOut(@Body() body: Partial<CreatePaymentDto>) {
    const { items, successUrl, cancelUrl, userId } = body;
    if (!items || !successUrl || !cancelUrl || !userId) {
      throw new Error('Missing required fields: items, successUrl, cancelUrl, userId');
    }
    return this.stripeService.stripeCheckOut(
     items,
      'payment',
      successUrl,
      cancelUrl,
      userId
    );
  }
}


