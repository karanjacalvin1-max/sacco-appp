import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ---------- Users (login accounts) ----------
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["ADMIN", "STAFF", "MEMBER"] })
    .notNull()
    .default("MEMBER"),
  memberId: text("member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ---------- Members ----------
export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  memberNumber: text("member_number").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  nationalId: text("national_id").notNull(),
  address: text("address"),
  nextOfKinName: text("next_of_kin_name"),
  nextOfKinPhone: text("next_of_kin_phone"),
  status: text("status", { enum: ["ACTIVE", "INACTIVE", "SUSPENDED"] })
    .notNull()
    .default("ACTIVE"),
  dateJoined: text("date_joined")
    .notNull()
    .default(sql`(current_timestamp)`),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ---------- Savings accounts ----------
// Each member can have multiple accounts by type (Shares / Savings / Deposits)
export const savingsAccounts = sqliteTable("savings_accounts", {
  id: text("id").primaryKey(),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  accountType: text("account_type", {
    enum: ["SHARES", "SAVINGS", "DEPOSITS"],
  }).notNull(),
  balance: real("balance").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const savingsTransactions = sqliteTable("savings_transactions", {
  id: text("id").primaryKey(),
  accountId: text("account_id")
    .notNull()
    .references(() => savingsAccounts.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["DEPOSIT", "WITHDRAWAL"] }).notNull(),
  amount: real("amount").notNull(),
  balanceAfter: real("balance_after").notNull(),
  description: text("description"),
  recordedByUserId: text("recorded_by_user_id").references(() => users.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ---------- Loans ----------
export const loans = sqliteTable("loans", {
  id: text("id").primaryKey(),
  loanNumber: text("loan_number").notNull().unique(),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  principal: real("principal").notNull(),
  interestRate: real("interest_rate").notNull(), // annual %, flat rate
  termMonths: integer("term_months").notNull(),
  purpose: text("purpose"),
  status: text("status", {
    enum: [
      "PENDING",
      "APPROVED",
      "REJECTED",
      "ACTIVE",
      "CLOSED",
    ],
  })
    .notNull()
    .default("PENDING"),
  outstandingBalance: real("outstanding_balance").notNull().default(0),
  appliedAt: text("applied_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  decidedAt: text("decided_at"),
  decidedByUserId: text("decided_by_user_id").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  disbursedAt: text("disbursed_at"),
});

export const loanRepayments = sqliteTable("loan_repayments", {
  id: text("id").primaryKey(),
  loanId: text("loan_id")
    .notNull()
    .references(() => loans.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  balanceAfter: real("balance_after").notNull(),
  recordedByUserId: text("recorded_by_user_id").references(() => users.id),
  paidAt: text("paid_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ---------- Relations ----------
export const membersRelations = relations(members, ({ many, one }) => ({
  savingsAccounts: many(savingsAccounts),
  loans: many(loans),
  user: one(users, { fields: [members.id], references: [users.memberId] }),
}));

export const savingsAccountsRelations = relations(
  savingsAccounts,
  ({ one, many }) => ({
    member: one(members, {
      fields: [savingsAccounts.memberId],
      references: [members.id],
    }),
    transactions: many(savingsTransactions),
  })
);

export const savingsTransactionsRelations = relations(
  savingsTransactions,
  ({ one }) => ({
    account: one(savingsAccounts, {
      fields: [savingsTransactions.accountId],
      references: [savingsAccounts.id],
    }),
  })
);

export const loansRelations = relations(loans, ({ one, many }) => ({
  member: one(members, {
    fields: [loans.memberId],
    references: [members.id],
  }),
  repayments: many(loanRepayments),
}));

export const loanRepaymentsRelations = relations(
  loanRepayments,
  ({ one }) => ({
    loan: one(loans, {
      fields: [loanRepayments.loanId],
      references: [loans.id],
    }),
  })
);

export const usersRelations = relations(users, ({ one }) => ({
  member: one(members, {
    fields: [users.memberId],
    references: [members.id],
  }),
}));
