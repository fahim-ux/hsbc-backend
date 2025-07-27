import Joi from 'joi';

export const loginSchema = Joi.object({
  username: Joi.string().required().min(3).max(50),
  password: Joi.string().required().min(6),
});

export const registerSchema = Joi.object({
  username: Joi.string().required().min(3).max(50),
  password: Joi.string().required().min(6),
  email: Joi.string().email().required(),
  fullName: Joi.string().required().min(2).max(100),
  phoneNumber: Joi.string().required().pattern(/^[0-9]{10}$/),
});

export const transferSchema = Joi.object({
  toAccountNumber: Joi.string().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().optional().max(255),
});

export const cardActionSchema = Joi.object({
  cardId: Joi.string().required(),
});

export const newCardSchema = Joi.object({
  cardType: Joi.string().valid('debit', 'credit').required(),
});

export const loanApplicationSchema = Joi.object({
  loanType: Joi.string().valid('personal', 'home', 'car', 'education').required(),
  amount: Joi.number().positive().required(),
  tenure: Joi.number().integer().min(1).max(360).required(), // months
});

export const complaintSchema = Joi.object({
  subject: Joi.string().required().min(5).max(200),
  description: Joi.string().required().min(10).max(1000),
  category: Joi.string().valid('transaction', 'card', 'loan', 'account', 'general').required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional().default('medium'),
});

export const cancelTransactionSchema = Joi.object({
  transactionId: Joi.string().required(),
});
