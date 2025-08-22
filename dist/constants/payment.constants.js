"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_METHOD_VALUES = exports.PAYMENT_METHOD_LABELS = exports.PaymentMethod = void 0;
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["ONLINE"] = "online";
    PaymentMethod["DEBT"] = "debt";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
exports.PAYMENT_METHOD_LABELS = {
    [PaymentMethod.CASH]: 'Tiền mặt',
    [PaymentMethod.ONLINE]: 'Thanh toán online',
    [PaymentMethod.DEBT]: 'Nợ'
};
exports.PAYMENT_METHOD_VALUES = Object.values(PaymentMethod);
//# sourceMappingURL=payment.constants.js.map