export const USER_EMAIL_COOKIE = "user_email";

export function getUserEmailFromRequest(request) {
  const cookieValue = request.cookies.get(USER_EMAIL_COOKIE)?.value;
  if (!cookieValue) {
    return null;
  }
  return cookieValue.trim().toLowerCase();
}
