
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email || "").trim()
  );
}

export function validatePassword(password) {
  return typeof password === "string" && password.length >= 8;
}

export function validateLogin(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(values.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  }

  return errors;
}

export function validateRegistration(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Full name is required";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(values.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (!validatePassword(values.password)) {
    errors.password = "Password must contain at least 8 characters";
  }

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}
