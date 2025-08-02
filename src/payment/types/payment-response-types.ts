export interface CheckoutSessionResponse {
  data: {
    sessionId: string;
    transactionId: string;
    paymentUrl: string;
    cancelUrl: string;
  };
}

export interface PaymentErrorResponse {
  message: string;
  error: {
    details: string;
    code: string;
    userId: string;
  };
}

export interface PaymentDebugInfo {
  requestPayload: any;
  beneficiaries: any;
  attempts: number;
  lastError?: any;
}
