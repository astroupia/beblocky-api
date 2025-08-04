import { Module } from '@nestjs/common';
import { StripeController } from './controller/stripe.controller';
import { StripeService } from './service/stripe.service';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  controllers: [StripeController],
  providers: [StripeService],
  imports: [PaymentModule]
})
export class StripeModule {}
