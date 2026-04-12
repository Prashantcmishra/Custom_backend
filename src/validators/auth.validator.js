// ─────────────────────────────────────────────────────────────────────────────
//  Auth Validators
//  Pure functions — return an array of error strings (empty = valid).
// ─────────────────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate registration payload.
 * @param {object} body - req.body
 * @returns {string[]} array of error messages
 */
export const validateRegister = (body) => {
  const { firstName, lastName, email, password, confirmPassword } = body;
  const errors = [];

  if (!firstName || firstName.trim().length < 2)
    errors.push("First name must be at least 2 characters.");

  if (!lastName || lastName.trim().length < 2)
    errors.push("Last name must be at least 2 characters.");

  if (!email || !EMAIL_REGEX.test(email))
    errors.push("Please provide a valid email address.");

  if (!password || password.length < 6)
    errors.push("Password must be at least 6 characters.");

  if (!confirmPassword)
    errors.push("Confirm password is required.");
  else if (password !== confirmPassword)
    errors.push("Passwords do not match.");

  return errors;
};

/**
 * Validate login payload.
 */
export const validateLogin = (body) => {
  const { email, password } = body;
  const errors = [];

  if (!email || !EMAIL_REGEX.test(email))
    errors.push("Please provide a valid email address.");

  if (!password)
    errors.push("Password is required.");

  return errors;
};