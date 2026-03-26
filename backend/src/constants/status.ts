export const REPAIR_STATUS = {
  PENDING_DROP_OFF: "Pending Drop-off",
  DIAGNOSING: "Diagnosing",
  WAITING_FOR_PARTS: "Waiting for Parts",
  IN_PROGRESS: "In Progress",
  READY_FOR_PICKUP: "Ready for Pickup",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as const;

export type RepairStatusType =
  (typeof REPAIR_STATUS)[keyof typeof REPAIR_STATUS];
