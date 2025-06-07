import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ValidationPipe } from '@nestjs/common';
import { ResponseStatusDto } from '../dto/response-status.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post()
  createPayment(
    @Body(ValidationPipe)
    createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Post('responseStatus')
  async getResponseStatus(@Body() responseStatusDTO: ResponseStatusDto) {
    const response = await this.paymentService.getResponseStatus(responseStatusDTO);
    console.log(response);
    
  }
}
