import { getToken } from "next-auth/jwt";

/**
 * Read the signed-in user's GitHub access token from the encrypted JWT.
 * SERVER-ONLY. The token lives in the JWT (see auth.js jwt callback) and is
 * never on the session object, so this is the only way routes get it.
 *
 * Returns the token string, or null when the request is unauthenticated.
 */
export async function getAccessToken(req) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  return token?.accessToken ?? null;
}
