"use server";

import { db, schema } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { newId, newLoanNumber } from "@/lib/ids";
import { requireStaff, requireUser } from "@/lib/auth/guard";
import { revalidatePath } from "next/cache";
import { calculateLoanTotals, round2 } from "@/lib/loan-calc";

export type ActionResult = { success: boolean; error?: string };

export async function applyLoanAction(
  memberId: string,
  principalRaw: string,
  termMonthsRaw: string,
  purpose: string
): Promise<ActionResult> {
  const session = await requireUser();

  if (session.role === "MEMBER" && session.memberId !== memberId) {
    return { success: false, error: "You can only apply for a loan on your own account." };
  }

  const principal = round2(parseFloat(principalRaw));
  const termMonths = parseInt(termMonthsRaw, 10);

  if (!principal || principal <= 0) {
    return { success: false, error: "Enter a valid loan amount." };
  }
  if (!termMonths || termMonths <= 0 || termMonths > 120) {
    return { success: false, error: "Enter a valid term in months (1-120)." };
  }

  const countRow = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.loans);
  const loanNumber = newLoanNumber((countRow[0]?.count ?? 0) + 1);

  await db.insert(schema.loans).values({
    id: newId(),
    loanNumber,
    memberId,
    principal,
    interestRate: 0,
    termMonths,
    purpose: purpose || null,
    status: "PENDING",
    outstandingBalance: 0,
  });

  revalidatePath("/dashboard/loans");
  revalidatePath("/portal/loans");
  return { success: true };
}

export async function decideLoanAction(
  loanId: string,
  memberId: string,
  decision: "APPROVED" | "REJECTED",
  interestRateRaw: string,
  rejectionReason: string
): Promise<ActionResult> {
  const session = await requireStaff();

  const loan = await db.query.loans.findFirst({
    where: eq(schema.loans.id, loanId),
  });
  if (!loan) return { success: false, error: "Loan not found." };
  if (loan.status !== "PENDING") {
    return { success: false, error: "This loan has already been decided." };
  }

  if (decision === "REJECTED") {
    await db
      .update(schema.loans)
      .set({
        status: "REJECTED",
        decidedAt: new Date().toISOString(),
        decidedByUserId: session.userId,
        rejectionReason: rejectionReason || "Not specified",
      })
      .where(eq(schema.loans.id, loanId));
  } else {
    const rate = parseFloat(interestRateRaw);
    if (!rate || rate <= 0) {
      return { success: false, error: "Enter a valid interest rate." };
    }
    const { totalPayable } = calculateLoanTotals(
      loan.principal,
      rate,
      loan.termMonths
    );
    await db
      .update(schema.loans)
      .set({
        status: "ACTIVE",
        interestRate: rate,
        outstandingBalance: totalPayable,
        decidedAt: new Date().toISOString(),
        decidedByUserId: session.userId,
        disbursedAt: new Date().toISOString(),
      })
      .where(eq(schema.loans.id, loanId));
  }

  revalidatePath("/dashboard/loans");
  revalidatePath(`/dashboard/members/${memberId}`);
  revalidatePath("/portal/loans");
  return { success: true };
}

export async function recordRepaymentAction(
  loanId: string,
  memberId: string,
  amountRaw: string
): Promise<ActionResult> {
  const session = await requireStaff();

  const amount = round2(parseFloat(amountRaw));
  if (!amount || amount <= 0) {
    return { success: false, error: "Enter a valid repayment amount." };
  }

  const loan = await db.query.loans.findFirst({
    where: eq(schema.loans.id, loanId),
  });
  if (!loan) return { success: false, error: "Loan not found." };
  if (loan.status !== "ACTIVE") {
    return { success: false, error: "This loan is not active." };
  }

  const newBalance = round2(Math.max(0, loan.outstandingBalance - amount));
  const newStatus = newBalance === 0 ? "CLOSED" : "ACTIVE";

  await db.transaction(async (tx) => {
    await tx.insert(schema.loanRepayments).values({
      id: newId(),
      loanId,
      amount,
      balanceAfter: newBalance,
      recordedByUserId: session.userId,
    });
    await tx
      .update(schema.loans)
      .set({ outstandingBalance: newBalance, status: newStatus })
      .where(eq(schema.loans.id, loanId));
  });

  revalidatePath("/dashboard/loans");
  revalidatePath(`/dashboard/members/${memberId}`);
  revalidatePath("/portal/loans");
  return { success: true };
}
