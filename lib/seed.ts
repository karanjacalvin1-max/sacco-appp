import { db, schema } from "../lib/db";
import { hashPassword } from "../lib/auth/password";
import { newId, newMemberNumber, newLoanNumber } from "../lib/ids";

async function main() {
  console.log("Seeding database…");

  // Staff users
  const adminId = newId();
  const staffId = newId();
  await db.insert(schema.users).values([
    {
      id: adminId,
      email: "admin@sacco.coop",
      passwordHash: await hashPassword("admin123"),
      role: "ADMIN",
    },
    {
      id: staffId,
      email: "staff@sacco.coop",
      passwordHash: await hashPassword("staff123"),
      role: "STAFF",
    },
  ]);

  // Demo members
  const membersData = [
    {
      firstName: "Jane",
      lastName: "Wanjiru",
      phone: "+254712345678",
      nationalId: "23456789",
      email: "jane@example.com",
      savings: 42000,
      shares: 5000,
    },
    {
      firstName: "Peter",
      lastName: "Otieno",
      phone: "+254723456789",
      nationalId: "24567890",
      email: "peter@example.com",
      savings: 18500,
      shares: 5000,
    },
    {
      firstName: "Grace",
      lastName: "Achieng",
      phone: "+254734567890",
      nationalId: "25678901",
      email: null,
      savings: 67000,
      shares: 10000,
    },
  ];

  let seq = 1;
  const memberIds: string[] = [];

  for (const m of membersData) {
    const memberId = newId();
    memberIds.push(memberId);
    await db.insert(schema.members).values({
      id: memberId,
      memberNumber: newMemberNumber(seq++),
      firstName: m.firstName,
      lastName: m.lastName,
      phone: m.phone,
      nationalId: m.nationalId,
      email: m.email,
      status: "ACTIVE",
    });

    const sharesAccId = newId();
    const savingsAccId = newId();
    await db.insert(schema.savingsAccounts).values([
      { id: sharesAccId, memberId, accountType: "SHARES", balance: m.shares },
      { id: savingsAccId, memberId, accountType: "SAVINGS", balance: m.savings },
    ]);

    await db.insert(schema.savingsTransactions).values([
      {
        id: newId(),
        accountId: sharesAccId,
        type: "DEPOSIT",
        amount: m.shares,
        balanceAfter: m.shares,
        description: "Initial share capital",
        recordedByUserId: staffId,
      },
      {
        id: newId(),
        accountId: savingsAccId,
        type: "DEPOSIT",
        amount: m.savings,
        balanceAfter: m.savings,
        description: "Opening deposit",
        recordedByUserId: staffId,
      },
    ]);

    // Give Jane a member login
    if (m.email === "jane@example.com") {
      await db.insert(schema.users).values({
        id: newId(),
        email: m.email,
        passwordHash: await hashPassword("member123"),
        role: "MEMBER",
        memberId,
      });
    }
  }

  // A pending loan for Peter, an active loan for Grace
  await db.insert(schema.loans).values({
    id: newId(),
    loanNumber: newLoanNumber(1),
    memberId: memberIds[1],
    principal: 30000,
    interestRate: 0,
    termMonths: 12,
    purpose: "School fees",
    status: "PENDING",
    outstandingBalance: 0,
  });

  await db.insert(schema.loans).values({
    id: newId(),
    loanNumber: newLoanNumber(2),
    memberId: memberIds[2],
    principal: 50000,
    interestRate: 12,
    termMonths: 10,
    purpose: "Business stock",
    status: "ACTIVE",
    outstandingBalance: 44000,
    decidedAt: new Date().toISOString(),
    decidedByUserId: staffId,
    disbursedAt: new Date().toISOString(),
  });

  console.log("Seed complete.");
  console.log("Login as staff: admin@sacco.coop / admin123");
  console.log("Login as member: jane@example.com / member123");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
