// ─────────────────────────────────────────────────────────────────────────────
// dashboardUtils.js
// Shared utility functions used across Patient and Doctor dashboards.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { useAuth } from "../context/AuthContext.jsx";

// ── 1. Greeting based on time of day ─────────────────────────────────────────
// Used in: DoctorDashboard
// Was inline in: PatientDashboard (no greeting, just "Welcome back")
export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

// ── 2. Today's label (e.g. "Monday, Apr 19") ─────────────────────────────────
// Used in: DoctorDashboard (as a module-level const)
// Used in: PatientDashboard (inside useMemo as `today`)
export const todayLabel = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  month: "short",
  day: "numeric",
});

// ── 3. Format any date value to readable string ───────────────────────────────
// Used in: DoctorDashboard (module-level function)
// Used in: PatientDashboard (local function `formatDate`)

// ── 4. Format time slot ───────────────────────────────────────────────────────
// Used in: PatientDashboard (local function `formatTime`)
// Used in: DoctorDashboard (inline as `a.timeSlot || "—"`)

// ── 5. Generate initials from a display name ──────────────────────────────────
// Used in: both dashboards inside useMemo
// e.g. "John Doe" → "JD", "Alice" → "A"

// ── 6. Resolve display name from user object ──────────────────────────────────
// Used in: both dashboards as `user?.username || "Patient"` / `"Doctor"`
export const getDisplayName = (user, fallback = "User") =>
  user?.username || fallback;

// ── 7. Custom hook — combines displayName + initials from AuthContext ──────────
// Replaces the two useMemo blocks repeated in every dashboard:
//   const displayName = useMemo(() => user?.username || "Patient", [...])
//   const initials    = useMemo(() => getInitials(displayName), [...])
//
// Usage:
//   const { displayName, initials } = useDashboardIdentity("Patient");
export const useDashboardIdentity = (fallback = "User") => {
  const { user } = useAuth();

  const displayName = useMemo(
    () => getDisplayName(user, fallback),
    [user?.username, fallback]
  );

  const initials = useMemo(
    () => getInitials(displayName),
    [displayName]
  );

  return { displayName, initials };
};