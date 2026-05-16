export const AUTH_SESSION_COOKIE = "auth_session";
export const USER_EMAIL_COOKIE = "user_email";

function getCookieValue(request, cookieName) {
  return request.cookies.get(cookieName)?.value;
}

export function getSessionCookieFromRequest(request) {
  const cookieValue = getCookieValue(request, AUTH_SESSION_COOKIE);
  if (!cookieValue) {
    return null;
  }
  const normalized = cookieValue.trim();
  return normalized || null;
}

export function getUserEmailFromRequest(request) {
  const cookieValue = getCookieValue(request, USER_EMAIL_COOKIE);
  if (!cookieValue) {
    return null;
  }
  return cookieValue.trim().toLowerCase();
}
