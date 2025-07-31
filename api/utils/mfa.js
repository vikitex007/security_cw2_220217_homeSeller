import crypto from "crypto";
import QRCode from "qrcode";
import speakeasy from "speakeasy";

export const generateMFASecret = () => {
  return speakeasy.generateSecret({
    name: "HomeSell Pro",
    issuer: "HomeSell Pro",
    length: 20,
  });
};

export const generateMFAToken = (secret) => {
  return speakeasy.totp({
    secret: secret,
    encoding: "base32",
    window: 2, // Allow 2 time steps (60 seconds) for clock skew
  });
};
export const verifyMFAToken = (token, secret) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: token,
    window: 2,
  });
};
export const generateBackupCodes = (count = 8) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString("hex").toUpperCase());
  }
  return codes;
};
export const verifyBackupCode = (code, backupCodes) => {
  return backupCodes.includes(code.toUpperCase());
};
export const generateQRCode = async (secret, email) => {
  const otpauth = speakeasy.otpauthURL({
    secret: secret,
    label: email,
    issuer: "HomeSell Pro",
    algorithm: "sha1",
  });

  return await QRCode.toDataURL(otpauth);
};
