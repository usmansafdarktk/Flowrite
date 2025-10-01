export const validateTextField = (
  value: string,
  fieldName: string,
  options: { maxLength?: number; minLength?: number; required?: boolean },
): { validated: boolean; msg?: string } => {
  const { required, maxLength, minLength } = options;

  if (required && !value?.trim()) {
    return { validated: false, msg: `${fieldName} is required.` };
  }

  if (maxLength && value.length > maxLength) {
    return { validated: false, msg: `${fieldName} must be under ${maxLength} characters.` };
  }

  if (minLength && value.length < minLength) {
    return { validated: false, msg: `${fieldName} must be at least ${minLength} characters.` };
  }

  return { validated: true };
};

export const validateMinMaxRelation = (
  min: number | string,
  max: number | string,
  fieldName = 'Value',
): { validated: boolean; msg?: string } => {
  const minValue = Number(min);
  const maxValue = Number(max);

  if (!minValue || !maxValue || maxValue <= minValue) {
    return {
      validated: false,
      msg: `${fieldName} max value must be greater than min value.`,
    };
  }

  return { validated: true };
};

export const validateEmail = (
  email: string,
  fieldName = 'Email',
  required = true,
): { validated: boolean; msg?: string } => {
  if (required && !email?.trim()) {
    return { validated: false, msg: `${fieldName} is required.` };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return { validated: false, msg: `${fieldName} is not a valid email address.` };
  }

  return { validated: true };
};

export const validatePassword = (
  password: string,
  fieldName = 'Password',
  options: { required?: boolean; minLength?: number } = {},
): { validated: boolean; msg?: string } => {
  const { required = true, minLength = 8 } = options;

  if (required && !password?.trim()) {
    return { validated: false, msg: `${fieldName} is required.` };
  }

  if (password && password.length < minLength) {
    return { validated: false, msg: `${fieldName} must be at least ${minLength} characters.` };
  }

  const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
  if (password && !complexityRegex.test(password)) {
    return {
      validated: false,
      msg: `${fieldName} must include uppercase, lowercase, and a number.`,
    };
  }

  return { validated: true };
};
