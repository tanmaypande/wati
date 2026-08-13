function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  const re = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return re.test(normalized);
}

function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  // Exactly 8 chars, at least 1 lower, 1 upper, 1 digit, 1 special char
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8}$/;
  return re.test(password);
}

module.exports = {
  isValidEmail,
  isValidPassword,
};
