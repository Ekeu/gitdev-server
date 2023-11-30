import Joi, { ObjectSchema } from "joi";

export const emailVerificationTokenSchema: ObjectSchema = Joi.object({
  emailToken: Joi.string().required().messages({
    "string.base": "The verification token provided is invalid.",
    "string.empty": "Please provide a verification token. This field cannot be empty.",
    "any.required": "A verification token is required to proceed.",
  }),
});
