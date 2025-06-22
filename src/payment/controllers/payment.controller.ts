import {
  Body,
  Controller,
  Post,
  ValidationPipe,
  Res,
  Get,
  Param,
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ResponseStatusDto } from '../dto/response-status.dto';
import { Response } from 'express';

/**
 * Controller responsible for handling payment creation and status updates.
 */
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get(':userId')
  async getUserPayments(@Param('userId') userId: string, @Res() res: Response) {
    const response = await this.paymentService.getUserPayments(userId);

    return res.status(response.statusCode).json({
      statusCode: response.statusCode,
      message: response.message,
      data: response.data ?? null,
    });
  }

  /**
   * Endpoint to create a new payment session.
   * @param createPaymentDto - Payload for payment initialization.
   */
  @Post()
  async createPayment(
    @Body(ValidationPipe) createPaymentDto: CreatePaymentDto,
  ): Promise<any> {
    return this.paymentService.createPayment(createPaymentDto);
  }

  /**
   * Endpoint to handle incoming transaction status update callbacks.
   * Returns structured response with statusCode and result from service.
   *
   * @param responseStatusDTO - Transaction status payload from payment gateway.
   * @param res - Express response object for custom status code handling.
   */
  @Post('responseStatus')
  async getResponseStatus(
    @Body() responseStatusDTO: ResponseStatusDto,
    @Res() res: Response,
  ) {
    const response =
      await this.paymentService.updatePaymentStatus(responseStatusDTO);

    return res.status(response.statusCode).json({
      statusCode: response.statusCode,
      message: response.message,
      data: response.data ?? null,
    });
  }
}
