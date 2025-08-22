export enum PaymentMethod {
  CASH = 'cash',      // Tiền mặt
  ONLINE = 'online',  // Thanh toán online
  DEBT = 'debt'       // Nợ
}

export const PAYMENT_METHOD_LABELS = {
  [PaymentMethod.CASH]: 'Tiền mặt',
  [PaymentMethod.ONLINE]: 'Thanh toán online',
  [PaymentMethod.DEBT]: 'Nợ'
};

export const PAYMENT_METHOD_VALUES = Object.values(PaymentMethod);
