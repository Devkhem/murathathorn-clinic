/**
 * Age is never stored (see docs/PRODUCT_SPEC.md) — always compute it from
 * birth_date at read time with this helper.
 */
export function calculateAge(birthDateIso: string | null, today: Date = new Date()): number | null {
  if (!birthDateIso) return null;

  const birthDate = new Date(birthDateIso);
  if (Number.isNaN(birthDate.getTime())) return null;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}
