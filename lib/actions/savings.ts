"use server";

import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { newId } from "@/lib/ids";
import { requireStaff } from "@/lib/auth/guard";
import { revalidatePath } from "next/cache";
import { round2 } from "@/lib/loan-calc";

export type ActionResult = { success: boolean; error?: string };

export async function recordSavingsTransactionAction(
  accountId: string,
  memberId: string,
  type: "DEPOSIT" | "WITHDRAWAL",
  amountRaw: string,
  description: string
): Promise<ActionResult> {
  const session = await requireStaff();

  const amount = round2(parseFloat(amountRaw));
  if (!amount || amount <= 0 || Number.isNaN(amount)) {
    return { success: false, error: "Enter a valid amount greater than 0." };
  }

  const account = await db.query.savingsAccounts.findFirst({
    where: eq(schema.savingsAccounts.id, accountId),
  });
  if (!account) return { success: false, error: "Account not found." };

  if (type === "WITHDRAWAL" && account.balance < amount) {
    return {
      success: false,
      error: `Insufficient balance. Available: ${account.balance.toFixed(2)}`,
    };
  }

  const newBalance = round2(
    type === "DEPOSIT" ? account.balance + amount : account.balance - amount
  );

  await db.transaction(async (tx) => {
    await tx
      .update(schema.savingsAccounts)
      .set({ balance: newBalance })
      .where(eq(schema.savingsAccounts.id, accountId));

    await tx.insert(schema.savingsTransactions).values({
      id: newId(),
      accountId,
      type,
      amount,
      balanceAfter: newBalance,
      description: description || null,
      recordedByUserId: session.userId,
    });
  });

  revalidatePath(`/dashboard/members/${memberId}`);
  revalidatePath("/portal/savings");
  return { success: true };
}
