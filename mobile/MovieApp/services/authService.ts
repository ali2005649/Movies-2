import {
  hashPassword,
  localAuthDb,
  toPublicUser,
} from '@/services/localAuthDb';
import type {
  AuthCredentials,
  AuthResponse,
  SignUpPayload,
  User,
} from '@/types/user';

const MIN_PASSWORD_LENGTH = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(password: string) {
  if (!password) {
    throw new Error('Password is required.');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
}

function validateSignUp(payload: SignUpPayload) {
  const username = payload.username.trim();
  const email = payload.email.trim().toLowerCase();
  const { password } = payload;

  if (!username) throw new Error('Username is required.');
  if (username.length < 3) {
    throw new Error('Username must be at least 3 characters.');
  }
  if (!email) throw new Error('Email is required.');
  if (!EMAIL_RE.test(email)) throw new Error('Please enter a valid email address.');
  validatePassword(password);
}

/**
 * Auth service — Sign Up / Log In against the local AsyncStorage user DB.
 */
export const authService = {
  minPasswordLength: MIN_PASSWORD_LENGTH,

  async signUp(payload: SignUpPayload): Promise<AuthResponse> {
    validateSignUp(payload);
    await localAuthDb.delay();

    const stored = await localAuthDb.createUser({
      username: payload.username.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });

    const user = toPublicUser(stored);
    const accessToken = `local_token_${stored.id}_${Date.now()}`;
    await localAuthDb.saveSession(user, accessToken);

    return { user, accessToken };
  },

  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const identifier = credentials.identifier.trim();
    const { password } = credentials;

    if (!identifier) {
      throw new Error('Username or email is required.');
    }
    if (!password) {
      throw new Error('Password is required.');
    }

    await localAuthDb.delay();

    const stored = await localAuthDb.findByIdentifier(identifier);
    if (!stored) {
      throw new Error('No account found with that username or email.');
    }

    const incomingHash = await hashPassword(password);
    if (incomingHash !== stored.passwordHash) {
      throw new Error('Incorrect password. Please try again.');
    }

    const user = toPublicUser(stored);
    const accessToken = `local_token_${stored.id}_${Date.now()}`;
    await localAuthDb.saveSession(user, accessToken);

    return { user, accessToken };
  },

  async restoreSession(): Promise<User | null> {
    return localAuthDb.getSessionUser();
  },

  async logout(): Promise<void> {
    await localAuthDb.delay(250);
    await localAuthDb.clearSession();
  },
};
