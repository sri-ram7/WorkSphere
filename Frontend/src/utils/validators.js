/**
 * Frontend input validators
 * Ensures client-side validation matches backend requirements
 */

export const validators = {
  email: (email) => {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(email);
  },

  password: (password) => {
    // Must match backend regex
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    return password.length >= 8 && password.length <= 128 && regex.test(password);
  },

  name: (name) => {
    return name && name.length >= 2 && name.length <= 50;
  },

  amount: (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num >= 0 && num <= 10000000;
  },

  date: (date) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  },

  time: (time) => {
    return /^\d{2}:\d{2}$/.test(time);
  },
};

/**
 * Get password validation error message
 */
export const getPasswordError = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password cannot exceed 128 characters';
  if (!/[a-z]/.test(password)) return 'Password must contain lowercase letters';
  if (!/[A-Z]/.test(password)) return 'Password must contain uppercase letters';
  if (!/\d/.test(password)) return 'Password must contain numbers';
  if (!/[@$!%*?&]/.test(password)) return 'Password must contain special characters (@$!%*?&)';
  return null;
};

/**
 * Get email validation error message
 */
export const getEmailError = (email) => {
  if (!email) return 'Email is required';
  if (!validators.email(email)) return 'Please provide a valid email';
  return null;
};

/**
 * Get name validation error message
 */
export const getNameError = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (name.length > 50) return 'Name cannot exceed 50 characters';
  if (!/^[a-zA-Z\s'-]+$/.test(name)) return 'Name contains invalid characters';
  return null;
};

/**
 * Get amount validation error message
 */
export const getAmountError = (amount) => {
  if (!amount) return 'Amount is required';
  const num = parseFloat(amount);
  if (isNaN(num)) return 'Amount must be a number';
  if (num < 0) return 'Amount cannot be negative';
  if (num > 10000000) return 'Amount exceeds maximum limit';
  return null;
};

/**
 * Get date validation error message
 */
export const getDateError = (date) => {
  if (!date) return 'Date is required';
  if (!validators.date(date)) return 'Date must be in YYYY-MM-DD format';
  // Check if date is valid
  const dateObj = new Date(date);
  if (isNaN(dateObj)) return 'Invalid date';
  return null;
};

/**
 * Get time validation error message
 */
export const getTimeError = (time) => {
  if (!time) return 'Time is required';
  if (!validators.time(time)) return 'Time must be in HH:MM format';
  const [hours, minutes] = time.split(':');
  if (parseInt(hours) > 23 || parseInt(minutes) > 59) return 'Invalid time';
  return null;
};
