export abstract class PaymentGateway {
  abstract processPayment(
    referenceId: string,
    accountNumber: string,
    amount: number
  ): Promise<any>;
}
