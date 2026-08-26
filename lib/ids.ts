import { randomUUID } from "crypto";

export function newId(): string {
  return randomUUID();
}

export function newMemberNumber(sequence: number): string {
  return `M-${String(sequence).padStart(5, "0")}`;
}

export function newLoanNumber(sequence: number): string {
  return `L-${String(sequence).padStart(5, "0")}`;
}
