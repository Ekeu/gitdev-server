import { GITDEV_EMAIL_REGEX, GITDEV_PASSWORD_REGEX } from "@components/auth/constants";
import Joi, { ObjectSchema } from "joi";

export const emailSchema: ObjectSchema = Joi.object({
  email: Joi.string().email().required().pattern(GITDEV_EMAIL_REGEX).messages({
    "string.base": "Invalid email address.",
    "string.empty": "Email is required.",
    "string.pattern.base": "Invalid email format.",
    "any.required": "Email is required.",
  }),
});

export const passwordSchema: ObjectSchema = Joi.object({
  password: Joi.string().required().pattern(GITDEV_PASSWORD_REGEX).messages({
    "string.base": "Invalid password.",
    "string.empty": "Please enter a new password.",
    "any.required": "A new password is required.",
    "string.pattern.base":
      "Your password should include uppercase & lowercase letters, numbers, and special characters.",
  }),
  confirm_password: Joi.string().required().valid(Joi.ref("password")).messages({
    "string.base": "Invalid confirmation password.",
    "string.empty": "Please confirm your password.",
    "any.required": "Password confirmation is required.",
    "any.only": "Passwords do not match.",
  }),
});
