import { type CallableRequest, HttpsError } from 'firebase-functions/v2/https';

/**
 * Verifies the caller is authenticated and returns their UID.
 * Throws HttpsError('unauthenticated') if not authenticated.
 */
export function authenticate(request: CallableRequest): string {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }
  return request.auth.uid;
}
