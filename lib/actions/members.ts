"use server";

import { db, schema } from "@/lib/db";
import { eq, desc, sql, like, or } from "drizzle-orm";
import { newId, newMemberNumber } from "@/lib/ids";
import { hashPassword } from "@/lib/auth/password";
import { requireStaff } from "@/lib/auth/guard";
import { revalidatePath } from "next/cache";

export type ActionResult = { success: boolean; error?: string; id?: string };

export async function createMemberAction(
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const nationalId = String(formData.get("nationalId") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const address = String(formData.get("address") || "").trim();
  const nextOfKinName = String(formData.get("nextOfKinName") || "").trim();
  const nextOfKinPhone = String(formData.get("nextOfKinPhone") || "").trim();
  const createLogin = formData.get("createLogin") === "on";
  const password = String(formData.get("password") || "");

  if (!firstName || !lastName || !phone || !nationalId) {
    return {
      success: false,
      error: "First name, last name, phone, and national ID are required.",
    };
  }

  if (createLogin && (!email || password.length < 6)) {
    return {
      success: false,
      error:
        "A valid email and a password of at least 6 characters are required to create a member login.",
    };
  }

  // Determine next member number
  const countRow = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.members);
  const nextSeq = (countRow[0]?.count ?? 0) + 1;
  const memberNumber = newMemberNumber(nextSeq);

  const memberId = newId();

  try {
    await db.transaction(async (tx) => {
      await tx.insert(schema.members).values({
        id: memberId,
        memberNumber,
        firstName,
        lastName,
        email: email || null,
        phone,
        nationalId,
        address: address || null,
        nextOfKinName: nextOfKinName || null,
        nextOfKinPhone: nextOfKinPhone || null,
      });

      // Auto-create default Shares and Savings accounts
      await tx.insert(schema.savingsAccounts).values([
        { id: newId(), memberId, accountType: "SHARES", balance: 0 },
        { id: newId(), memberId, accountType: "SAVINGS", balance: 0 },
      ]);

      if (createLogin) {
        const passwordHash = await hashPassword(password);
        await tx.insert(schema.users).values({
          id: newId(),
          email,
          passwordHash,
          role: "MEMBER",
          memberId,
        });
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("UNIQUE")) {
      return {
        success: false,
        error:
          "A member or user with this email/national ID already exists.",
      };
    }
    return { success: false, error: "Failed to create member." };
  }

  revalidatePath("/dashboard/members");
  return { success: true, id: memberId };
}

export async function updateMemberStatusAction(
  memberId: string,
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
): Promise<ActionResult> {
  await requireStaff();
  await db
    .update(schema.members)
    .set({ status })
    .where(eq(schema.members.id, memberId));
  revalidatePath(`/dashboard/members/${memberId}`);
  revalidatePath("/dashboard/members");
  return { success: true };
}

export async function listMembers(searchTerm?: string) {
  await requireStaff();
  if (searchTerm && searchTerm.trim()) {
    const term = `%${searchTerm.trim()}%`;
    return db
      .select()
      .from(schema.members)
      .where(
        or(
          like(schema.members.firstName, term),
          like(schema.members.lastName, term),
          like(schema.members.memberNumber, term),
          like(schema.members.phone, term),
          like(schema.members.nationalId, term)
        )
      )
      .orderBy(desc(schema.members.createdAt));
  }
  return db
    .select()
    .from(schema.members)
    .orderBy(desc(schema.members.createdAt));
}

export async function getMemberFull(memberId: string) {
  const member = await db.query.members.findFirst({
    where: eq(schema.members.id, memberId),
    with: {
      savingsAccounts: {
        with: { transactions: { orderBy: desc(schema.savingsTransactions.createdAt) } },
      },
      loans: {
        with: { repayments: { orderBy: desc(schema.loanRepayments.paidAt) } },
        orderBy: desc(schema.loans.appliedAt),
      },
    },
  });
  return member ?? null;
}
