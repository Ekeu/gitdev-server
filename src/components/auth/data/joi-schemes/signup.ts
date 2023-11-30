import {
  GITDEV_ERRORS,
  GITDEV_PASSWORD_MAX_LENGTH,
  GITDEV_PASSWORD_MIN_LENGTH,
  GITDEV_PASSWORD_REGEX,
  GITDEV_USERNAME_MAX_LENGTH,
  GITDEV_USERNAME_MIN_LENGTH,
} from "@components/auth/constants";
import { AuthUserServices } from "@components/auth/services";
import Joi, { ObjectSchema } from "joi";

export const signupSchema: ObjectSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(GITDEV_USERNAME_MIN_LENGTH)
    .max(GITDEV_USERNAME_MAX_LENGTH)
    .required()
    .external(async (value: string, helpers) => {
      const usernameExists = await AuthUserServices.findUserByUsername(value);
      if (usernameExists) {
        return helpers.message({
          external: GITDEV_ERRORS.USERNAME_ALREADY_EXISTS.message,
        });
      }
      return value;
    })
    .messages({
      "string.base": "Oops! Usernames should only contain letters and numbers",
      "string.empty": "Hey there! We need a username to get you started.",
      "string.min": "Just a bit short! Usernames should be at least {#limit} characters long.",
      "string.max": "Woah, that's long! Usernames should be up to {#limit} characters.",
      "any.required": "Hey there! We need a username to get you started.",
    }),
  password: Joi.string()
    .min(GITDEV_PASSWORD_MIN_LENGTH)
    .max(GITDEV_PASSWORD_MAX_LENGTH)
    .required()
    .pattern(GITDEV_PASSWORD_REGEX)
    .messages({
      "string.base": "Hmm, that doesn't look like a valid password.",
      "string.empty": "A password is needed for security. Can't skip that!",
      "string.min": "Let's beef up that password! Make sure it's at least 8 characters.",
      "string.max": "That's an epic password, but it's too long. Keep it under {#limit} characters.",
      "any.required": "A password is needed for security. Can't skip that!",
      "string.pattern.base":
        "Make sure it's at least 15 characters OR at least 8 characters including a number and a lowercase letter.",
    }),
  email: Joi.string()
    .email()
    .required()
    .external(async (value: string, helpers) => {
      const emailExists = await AuthUserServices.findUserByEmail(value);
      if (emailExists) {
        return helpers.message({
          external: GITDEV_ERRORS.ACCOUNT_ALREADY_EXISTS.message,
        });
      }
      return value;
    })
    .messages({
      "string.base": "That doesn't look like an email address.",
      "string.empty": "We'd love to keep in touch. Please provide your email.",
      "string.email": "That email seems a bit off. Can you check it?",
      "any.required": "We'd love to keep in touch. Please provide your email.",
    }),
});
