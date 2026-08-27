/** Public user profile (never includes password hash). */
export type User = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
};

/** Record persisted in the local AsyncStorage "users" table. */
export type StoredUser = User & {
  /** SHA-256 digest of password + salt (never store plain text). */
  passwordHash: string;
};

export type AuthCredentials = {
  /** Username or email accepted at login. */
  identifier: string;
  password: string;
};

export type SignUpPayload = {
  username: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};
