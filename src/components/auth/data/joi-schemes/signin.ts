import Joi, { ObjectSchema } from "joi";

export const signinSchema: ObjectSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Please enter a valid email address.",
    "string.empty": "Email field cannot be empty. Please enter your email.",
    "string.email": "The email address format seems incorrect. Please check and try again.",
    "any.required": "Email address is required for signing in. Please enter it.",
  }),
  password: Joi.string().required().messages({
    "string.base": "Please enter a valid password.",
    "string.empty": "Password field cannot be empty. Please enter your password.",
    "any.required": "Password is required for signing in. Please enter it.",
  }),
});
