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

export async function checkPendingPayments(
  onPaymentConfirmed?: () => Promise<void>
) {
  try {
    const pending = await AsyncStorage.getItem("pendingPayments");
    if (!pending) return;

    const pendingPayments = JSON.parse(pending);
    const gateway = MtnGateway.getInstance();
    for (const payment of pendingPayments) {
      const result = await gateway.confirmPayment(payment.referenceId);

      if (result.success) {
        console.log(`Payment ${payment.referenceId} successful!`);

        await removePendingPayment(payment.referenceId);

        // 🛎️ NEW: Activate subscription when payment is successful
        if (onPaymentConfirmed) {
          await onPaymentConfirmed();
        }
      } else {
        const message = result.error.message;
        if (message === "Requested resource was not found.") {
          removePendingPayment(payment.referenceId);
        }
        console.log(`Payment ${payment.referenceId} still pending or failed.`);
      }
    }
  } catch (error) {
    console.error("Failed to check pending payments", error);
  }
}

// 🆕 Utility: check if any pending payments exist
export async function hasPendingPayments(): Promise<boolean> {
  try {
    const pending = await AsyncStorage.getItem("pendingPayments");
    if (!pending) return false;

    const pendingPayments = JSON.parse(pending);
    return pendingPayments.length > 0;
  } catch (error) {
    console.error("Failed to check if there are pending payments", error);
    return false;
  }
}
