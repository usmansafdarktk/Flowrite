// src/lib/api/auth.ts
import Cookies from 'js-cookie';
const TOKEN_KEY = 'token';

/**
 * Login a user
 * @param username User username/email
 * @param password User password
 * @returns Login response with token and user info
 */
export async function signin(username: string, password: string) {
  storeAuthToken('token');
}

/**
 * Register a new user
 * @param username User username/email
 * @param email User password
 * @param password User password
 */
export async function signup(username: string, password: string, email: string) {
  storeAuthToken('token');
}

/**
 * Store authentication token in local storage
 * @param token JWT token from login/signup
 */
export function storeAuthToken(token: string): void {
  Cookies.set(TOKEN_KEY, 'dummy-token', { expires: 1 });
}

/**
 * Remove authentication token from local storage (logout)
 */
export function removeAuthToken(): void {
  Cookies.remove(TOKEN_KEY);
}

/**
 * Logout the current user
 * - Removes the auth token
 */
export function logout(): void {
  removeAuthToken();
}
