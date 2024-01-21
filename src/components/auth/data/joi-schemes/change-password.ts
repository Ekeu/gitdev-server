import Joi, { ObjectSchema } from "joi";
import {
  GITDEV_PASSWORD_MAX_LENGTH,
  GITDEV_PASSWORD_MIN_LENGTH,
  GITDEV_PASSWORD_REGEX,
} from "@components/auth/constants";

export const changePasswordSchema: ObjectSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.base": "Current Password must be a string.",
    "string.empty": "Current Password is required.",
    "any.required": "Current Password cannot be empty.",
  }),
  newPassword: Joi.string()
    .min(GITDEV_PASSWORD_MIN_LENGTH)
    .max(GITDEV_PASSWORD_MAX_LENGTH)
    .required()
    .pattern(GITDEV_PASSWORD_REGEX)
    .messages({
      "string.base": "New Password must be a string.",
      "string.empty": "New Password is required.",
      "string.min": `New Password must be at least ${GITDEV_PASSWORD_MIN_LENGTH} characters long.`,
      "string.max": `New Password must be no more than ${GITDEV_PASSWORD_MAX_LENGTH} characters long.`,
      "string.pattern.base": "New Password does not meet the required format.",
      "any.required": "New Password cannot be empty.",
    }),
  confirmPassword: Joi.string().required().equal(Joi.ref("newPassword")).messages({
    "string.base": "Confirm Password must be a string.",
    "string.empty": "Confirm Password is required.",
    "any.required": "Confirm Password cannot be empty.",
    "any.only": "Confirm Password must match New Password.",
  }),
});
