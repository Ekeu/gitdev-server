import Joi, { ObjectSchema } from "joi";

export const updateUserBlockListSchema: ObjectSchema = Joi.object({
  blockedUserId: Joi.string().required().messages({
    "string.base": "Blocked User ID must be a string. Please check your input.",
    "string.empty": "Blocked User ID cannot be empty. Please provide the Blocked User ID.",
    "any.required": "Blocked User ID is a required field. Please include the Blocked User ID.",
  }),
  action: Joi.string().valid("block", "unblock").required().messages({
    "string.base": "Action must be a string. Please check your input.",
    "string.empty": "Action cannot be empty. Please provide the Action.",
    "any.required": "Action is a required field. Please include the Action.",
    "any.only": "Action must be either block or unblock. Please check your input.",
  }),
});

export const avatarUpdateSchema: ObjectSchema = Joi.object({
  img: Joi.string().optional().default("").messages({
    "string.base": "Image must be a string.",
  }),
});
