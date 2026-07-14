export function getAuth() {
 if (typeof window === 'undefined') return null;
  const stored = JSON.stringify({ token: localStorage.getItem('token'), user: JSON.parse(localStorage.getItem('user')) });
  return stored ? JSON.parse(stored) : null;
}