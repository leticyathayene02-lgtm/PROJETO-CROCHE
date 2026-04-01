/**
 * Trial duration and status computation — single source of truth.
 *
 * The status shown in admin panels and the access check both call
 * `computeTrialStatus()` which always computes from timestamps,
 * never from the persisted `accessStatus` field alone.
 */

/** Trial lasts exactly 7 calendar days. */
export const TRIAL_DURATION_DAYS = 7;
export const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

type SubscriptionInput = {
  status: string;
  accessStatus: string;
  plan: string;
  trialStartAt: Date | null;
  trialEndAt: Date | null;
};

export type TrialStatus =
  | { label: string; variant: "success" | "info" | "warning" | "danger" | "neutral" | "premium"; expired: boolean; daysLeft?: number }

/**
 * Compute the real display status for a subscription based on timestamps.
 * This is deterministic — same input always produces same output.
 * Never depends on `accessStatus` persisted field for trial logic.
 */
export function computeTrialStatus(sub: SubscriptionInput | null | undefined): TrialStatus {
  if (!sub) {
    return { label: "Inativo", variant: "danger", expired: true };
  }

  // Paid and active
  if (sub.plan === "PREMIUM" && sub.status === "ACTIVE" && sub.accessStatus === "ACTIVE") {
    return { label: "Ativo", variant: "success", expired: false };
  }

  // Canceled
  if (sub.status === "CANCELED") {
    return { label: "Cancelado", variant: "danger", expired: true };
  }

  // Past due (payment overdue via webhook)
  if (sub.status === "PAST_DUE") {
    return { label: "Vencido", variant: "warning", expired: true };
  }

  // Trial period — compute from trialStartAt + 7 days (source of truth)
  const trialEnd = sub.trialStartAt
    ? new Date(sub.trialStartAt.getTime() + TRIAL_DURATION_MS)
    : sub.trialEndAt;

  if (trialEnd) {
    const now = new Date();
    if (now < trialEnd) {
      const msLeft = trialEnd.getTime() - now.getTime();
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      return { label: `Trial (${daysLeft}d)`, variant: "info", expired: false, daysLeft };
    }
    // Trial expired
    return { label: "Vencido", variant: "warning", expired: true };
  }

  // No trial dates at all — blocked
  return { label: "Vencido", variant: "warning", expired: true };
}
