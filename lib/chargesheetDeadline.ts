export type ChargesheetAlert = {
  daysRemaining: number;
  deadlineDate: string;
  deadlineType: string;
  isOverdue: boolean;
};

/** 60/90-day chargesheet window counted from FIR / case date. */
export function getChargesheetAlertFromFir(row: {
  finalChargesheetSubmitted?: boolean;
  chargesheetDeadlineType?: string;
  caseDate?: string;
}): ChargesheetAlert | null {
  if (row.finalChargesheetSubmitted) return null;
  if (!row.caseDate) return null;

  const deadlineType = row.chargesheetDeadlineType || "60";
  const deadlineDays = parseInt(deadlineType, 10) || 60;

  const firDate = new Date(row.caseDate);
  if (isNaN(firDate.getTime())) return null;

  const deadlineDate = new Date(firDate);
  deadlineDate.setDate(deadlineDate.getDate() + deadlineDays);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    daysRemaining,
    deadlineDate: deadlineDate.toISOString().split("T")[0],
    deadlineType,
    isOverdue: daysRemaining < 0,
  };
}
