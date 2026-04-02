const STORAGE_KEY = "tsd-auth-session";

export type AuthSession = {
  email: string;
  at: number;
};

export function setSession(email: string): void {
  if (typeof window === "undefined") return;
  const data: AuthSession = { email, at: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("tsd-auth-change"));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("tsd-auth-change"));
}

/** First letter of the stored account string (e.g. email), uppercased. */
export function getEmailInitial(email: string): string {
  const t = email.trim();
  if (!t) return "?";
  return t[0].toUpperCase();
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}
