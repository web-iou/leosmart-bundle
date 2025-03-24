import CryptoJS from 'crypto-js';
/**
 * Encrypts a given plaintext using AES encryption.
 *
 * @param src - The plaintext input that needs to be encrypted.
 * @param keyWord - The secret key used for encryption.
 * @returns The encrypted text as a string.
 */
export const passwordRegex = /^(?=.*[a-z]).{6,}$/;

export const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const mobileReg = /^1[3-9]\d{9}$/;
export function encrypt(src: string, keyWord: string) {
  const iv = CryptoJS.enc.Utf8.parse(keyWord);
  return CryptoJS.AES.encrypt(src, iv, {
    iv,
    mode: CryptoJS.mode.CFB,
    padding: CryptoJS.pad.NoPadding,
  }).toString();
}

export function testAccount(account: string) {
  return emailReg.test(account) || mobileReg.test(account);
}