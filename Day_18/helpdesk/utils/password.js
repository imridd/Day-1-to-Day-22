
import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual
} from 'node:crypto';

import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

const KEY_LENGTH = 64;

export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must contain at least 8 characters');
  }

  const salt = randomBytes(16).toString('hex');

  const derivedKey = await scrypt(
    password,
    salt,
    KEY_LENGTH
  );

  return {
    password_hash: derivedKey.toString('hex'),
    password_salt: salt
  };
}

export async function verifyPassword(password, storedHash, storedSalt) {
  if (
    typeof password !== 'string' ||
    typeof storedHash !== 'string' ||
    typeof storedSalt !== 'string' ||
    !/^[a-f0-9]{128}$/i.test(storedHash) ||
    !/^[a-f0-9]{32}$/i.test(storedSalt)
  ) {
    return false;
  }

  const derivedKey = await scrypt(
    password,
    storedSalt,
    KEY_LENGTH
  );

  const originalHash = Buffer.from(storedHash, 'hex');

  return timingSafeEqual(derivedKey, originalHash);
}
