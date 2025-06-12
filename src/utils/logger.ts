// src/utils/logger.ts
import { createLogger, transports, format } from 'winston';
import * as path from 'path';

export const paymentLogger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({ filename: path.resolve('logs/payment.log') }),
  ],
});
