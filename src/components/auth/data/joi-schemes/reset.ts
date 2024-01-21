import { GITDEV_PASSWORD_REGEX } from "@components/auth/constants";
import Joi, { ObjectSchema } from "joi";

export const emailSchema: ObjectSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Please enter a valid email address.",
    "string.empty": "Don't forget to enter your email address!",
    "string.email": "Oops! That doesn't look like a valid email format.",
    "any.required": "We need your email address to proceed.",
  }),
});

export const passwordSchema: ObjectSchema = Joi.object({
  password: Joi.string().required().pattern(GITDEV_PASSWORD_REGEX).messages({
    "string.base": "Invalid password.",
    "string.empty": "Please enter a new password.",
    "any.required": "A new password is required.",
    "string.pattern.base":
      "Make sure it's at least 15 characters OR at least 8 characters including a number and a lowercase letter.",
  }),
  confirmPassword: Joi.string().required().equal(Joi.ref("password")).messages({
    "string.base": "Invalid confirmation password.",
    "string.empty": "Please confirm your password.",
    "any.required": "Password confirmation is required.",
    "any.only": "Passwords do not match.",
  }),
});

export const resetTokenSchema: ObjectSchema = Joi.object({
  resetToken: Joi.string().required().messages({
    "string.base": "The reset token provided is invalid.",
    "string.empty": "Please provide a reset token. This field cannot be empty.",
    "any.required": "A reset token is required to proceed.",
  }),
});
