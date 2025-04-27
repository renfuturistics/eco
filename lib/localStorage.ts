import AsyncStorage from "@react-native-async-storage/async-storage";
import { MtnGateway } from "../mobile-money/mtn/payment.service";

export async function savePendingPayment(referenceId: string) {
  try {
    const pending = await AsyncStorage.getItem("pendingPayments");
    let pendingPayments = pending ? JSON.parse(pending) : [];

    pendingPayments.push({ referenceId, status: "PENDING" });

    await AsyncStorage.setItem(
      "pendingPayments",
      JSON.stringify(pendingPayments)
    );
  } catch (error) {
    console.error("Failed to save pending payment", error);
  }
}
export async function removePendingPayment(referenceId: string) {
  try {
    const pending = await AsyncStorage.getItem("pendingPayments");
    if (!pending) return;

    let pendingPayments = JSON.parse(pending);
    pendingPayments = pendingPayments.filter(
      (p: any) => p.referenceId !== referenceId
    );

    await AsyncStorage.setItem(
      "pendingPayments",
      JSON.stringify(pendingPayments)
    );
  } catch (error) {
    console.error("Failed to remove pending payment", error);
  }
}
export async function checkPendingPayments() {
  try {
    const pending = await AsyncStorage.getItem("pendingPayments");
    if (!pending) return;

    const pendingPayments = JSON.parse(pending);
    const gateway = MtnGateway.getInstance();
    for (const payment of pendingPayments) {
      const result = await gateway.confirmPayment(payment.referenceId);

      if (result.success) {
        console.log(`Payment ${payment.referenceId} successful!`);
        // remove this payment from storage
        await removePendingPayment(payment.referenceId);
      } else {
        const message = result.error.message;
        if (message === "Requested resource was not found.") {
          removePendingPayment(payment.referenceId);
        }
        console.log(`Payment ${payment.referenceId} still pending or failed.`);
        // maybe retry later or notify user
      }
    }
  } catch (error) {
    console.error("Failed to check pending payments", error);
  }
}
