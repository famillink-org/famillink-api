import { Injectable } from '@nestjs/common';
import * as process from 'node:process';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomFill,
  scrypt,
} from 'crypto';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class CryptoService {
  hash(text: string): Promise<string> {
    return bcrypt.hash(text, SALT_ROUNDS);
  }

  compare(text: string, hash: string): Promise<boolean> {
    return bcrypt.compare(text, hash);
  }

  async encrypt(text: string): Promise<string> {
    const encrypted = await this._encrypt(text);
    console.log(encrypted);
    const hashed = await this.hash(text);
    return `${hashed}|${encrypted}`;
  }

  async decrypt(cryptedText: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, ...rest] = cryptedText.split('|');
    const encrypted = rest.join('|');

    return await this._decrypt(encrypted);
  }

  private async _encrypt(text: string): Promise<string> {
    const algorithm = 'aes-192-cbc';
    const salt = randomBytes(8).toString('hex');

    return new Promise((resolve, reject) => {
      scrypt(process.env.ENCRYPT_PASSWORD as string, salt, 24, (err, key) => {
        if (err) reject(err);
        randomFill(new Uint8Array(16), (err, iv) => {
          const ivHex = Buffer.from(iv).toString('hex');
          if (err) reject(err);
          const cipher = createCipheriv(algorithm, key, iv);
          let encrypted = cipher.update(text, 'utf8', 'hex');
          encrypted += cipher.final('hex');
          const result = `${salt}|${ivHex}|${encrypted}`;
          resolve(result);
        });
      });
    });
  }

  private async _decrypt(text: string): Promise<string> {
    const algorithm = 'aes-192-cbc';

    return new Promise((resolve, reject) => {
      const [salt, ivHex, encrypted] = text.split('|');
      if (!salt || !ivHex || !encrypted) reject(new Error('Invalid data'));
      const iv = Buffer.from(ivHex, 'hex');
      scrypt(process.env.ENCRYPT_PASSWORD as string, salt, 24, (err, key) => {
        if (err) reject(err);
        const decipher = createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        resolve(decrypted);
      });
    });
  }
}
