import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import type { StoredUser, User } from '@/types/user';

/** AsyncStorage key for the local users "table". */
const USERS_KEY = 'movieapp_users_db';

/** Session keys for the currently logged-in user. */
export const SESSION_USER_KEY = 'movieapp_session_user';
export const SESSION_TOKEN_KEY = 'movieapp_session_token';

/** Pepper mixed into password hashes (app-level, not a secret vault). */
const HASH_PEPPER = 'movieapp_local_auth_v1';

function delay(ms = 650) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Strip sensitive fields before exposing a user to the UI / session. */
export function toPublicUser(stored: StoredUser): User {
  const { passwordHash: _omit, ...user } = stored;
  return user;
}

/** SHA-256 hash of password + pepper. */
export async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${HASH_PEPPER}:${password}`
  );
}

async function readUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Local auth database helpers backed by AsyncStorage.
 * Simulates a users table for Sign Up / Log In in Expo Go.
 */
export const localAuthDb = {
  /** Simulated network latency for loading UX. */
  delay,

  async getAllUsers(): Promise<StoredUser[]> {
    return readUsers();
  },

  async findByUsername(username: string): Promise<StoredUser | undefined> {
    const needle = username.trim().toLowerCase();
    const users = await readUsers();
    return users.find((u) => u.username.toLowerCase() === needle);
  },

  async findByEmail(email: string): Promise<StoredUser | undefined> {
    const needle = email.trim().toLowerCase();
    const users = await readUsers();
    return users.find((u) => u.email.toLowerCase() === needle);
  },

  /** Find by username OR email (login identifier). */
  async findByIdentifier(identifier: string): Promise<StoredUser | undefined> {
    const needle = identifier.trim().toLowerCase();
    const users = await readUsers();
    return users.find(
      (u) =>
        u.username.toLowerCase() === needle || u.email.toLowerCase() === needle
    );
  },

  async createUser(input: {
    username: string;
    email: string;
    password: string;
  }): Promise<StoredUser> {
    const users = await readUsers();
    const username = input.username.trim();
    const email = input.email.trim().toLowerCase();

    const usernameTaken = users.some(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    if (usernameTaken) {
      throw new Error('That username is already taken.');
    }

    const emailTaken = users.some((u) => u.email.toLowerCase() === email);
    if (emailTaken) {
      throw new Error('An account with that email already exists.');
    }

    const passwordHash = await hashPassword(input.password);
    const user: StoredUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      username,
      displayName: username,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    await writeUsers(users);
    return user;
  },

  async saveSession(user: User, accessToken: string): Promise<void> {
    await AsyncStorage.multiSet([
      [SESSION_USER_KEY, JSON.stringify(user)],
      [SESSION_TOKEN_KEY, accessToken],
    ]);
  },

  async clearSession(): Promise<void> {
    await AsyncStorage.multiRemove([SESSION_USER_KEY, SESSION_TOKEN_KEY]);
  },

  async getSessionUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem(SESSION_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },
};
