import bcrypt from "bcryptjs";

/**
 * Work factor for bcrypt. 12 is the current sensible default: roughly ~250ms
 * per hash on typical server hardware, which is slow enough to make offline
 * cracking expensive without noticeably delaying sign-in.
 */
const SALT_ROUNDS = 12;

/**
 * A pre-computed hash of a throwaway value, used to spend the same CPU time on
 * a login attempt for an unknown email as for a known one. Without it, response
 * timing reveals which addresses are registered.
 */
const DUMMY_HASH = bcrypt.hashSync("wallettrack::timing-equalizer", SALT_ROUNDS);

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Burns an equivalent amount of time when no user matched, to avoid user enumeration. */
export async function fakePasswordCheck(password: string): Promise<void> {
  await bcrypt.compare(password, DUMMY_HASH);
}
