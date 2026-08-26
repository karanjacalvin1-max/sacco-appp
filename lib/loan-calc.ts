// % per annum, flat rate — used as the default suggested rate at loan approval
export const DEFAULT_INTEREST_RATE = 12;

/**
 * Flat-rate loan calculation, common in SACCO practice:
 * Total interest = principal * (annualRate/100) * (termMonths/12)
 * Monthly installment = (principal + totalInterest) / termMonths
 */
export function calculateLoanTotals(
  principal: number,
  annualRatePercent: number,
  termMonths: number
) {
  const totalInterest =
    principal * (annualRatePercent / 100) * (termMonths / 12);
  const totalPayable = principal + totalInterest;
  const monthlyInstallment = totalPayable / termMonths;
  return {
    totalInterest: round2(totalInterest),
    totalPayable: round2(totalPayable),
    monthlyInstallment: round2(monthlyInstallment),
  };
}

export type ScheduleRow = {
  period: number;
  dueAmount: number;
  cumulativeDue: number;
};

export function buildSchedule(
  principal: number,
  annualRatePercent: number,
  termMonths: number
): ScheduleRow[] {
  const { monthlyInstallment } = calculateLoanTotals(
    principal,
    annualRatePercent,
    termMonths
  );
  const rows: ScheduleRow[] = [];
  let cumulative = 0;
  for (let i = 1; i <= termMonths; i++) {
    cumulative += monthlyInstallment;
    rows.push({
      period: i,
      dueAmount: round2(monthlyInstallment),
      cumulativeDue: round2(cumulative),
    });
  }
  return rows;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
