// Password policy: min 8, max 32, must include upper, lower, number, special char
export function validatePasswordPolicy(password) {
  const minLength = 8;
  const maxLength = 32;
  if (typeof password !== "string") return false;
  if (password.length < minLength || password.length > maxLength) return false;
  if (!/[A-Z]/.test(password)) return false; // Uppercase
  if (!/[a-z]/.test(password)) return false; // Lowercase
  if (!/[0-9]/.test(password)) return false; // Number
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return false; // Special char
  return true;
}

export function passwordPolicyMessage() {
  return "Password must be 8-32 characters and include uppercase, lowercase, number, and special character.";
}
