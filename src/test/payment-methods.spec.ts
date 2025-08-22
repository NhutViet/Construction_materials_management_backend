import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from '../services/invoice.service';
import { PaymentMethod } from '../constants/payment.constants';

describe('Payment Methods', () => {
  let service: InvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: InvoiceService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should have three payment methods', () => {
    expect(PaymentMethod.CASH).toBe('cash');
    expect(PaymentMethod.ONLINE).toBe('online');
    expect(PaymentMethod.DEBT).toBe('debt');
  });

  it('should validate payment method enum values', () => {
    const validMethods = Object.values(PaymentMethod);
    expect(validMethods).toContain('cash');
    expect(validMethods).toContain('online');
    expect(validMethods).toContain('debt');
    expect(validMethods).toHaveLength(3);
  });

  it('should have correct payment method labels', () => {
    const { PAYMENT_METHOD_LABELS } = require('../constants/payment.constants');
    
    expect(PAYMENT_METHOD_LABELS[PaymentMethod.CASH]).toBe('Tiền mặt');
    expect(PAYMENT_METHOD_LABELS[PaymentMethod.ONLINE]).toBe('Thanh toán online');
    expect(PAYMENT_METHOD_LABELS[PaymentMethod.DEBT]).toBe('Nợ');
  });
});
