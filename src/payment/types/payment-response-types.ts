export interface CheckoutSessionResponse {
  data: {
    sessionId: string;
    transactionId: string;
    paymentUrl: string;
    cancelUrl: string;
  };
}
