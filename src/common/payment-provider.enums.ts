export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  UNAUTHORIZED = 'unauthorized',
}

export enum PaymentMethod {
  TELEBIRR = 'TELEBIRR',
  AWASH = 'AWASH',
  AWASH_WALLET = 'AWASH_WALLET',
  PSS = 'PSS',
  CBE = 'CBE',
  AMOLE = 'AMOLE',
  BOA = 'BOA',
  KACHA = 'KACHA',
  TELEBIRR_USSD = 'TELEBIRR_USSD',
  HELLOCASH = 'HELLOCASH',
  MPESSA = 'MPESSA',
}