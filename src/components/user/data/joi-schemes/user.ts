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

export const basicInfoUpdateSchema: ObjectSchema = Joi.object({
  website: Joi.string().optional().default("").messages({
    "string.base": "Website must be a string.",
  }),
  company: Joi.string().optional().default("").messages({
    "string.base": "Company must be a string.",
  }),
  location: Joi.string().optional().default("").messages({
    "string.base": "Location must be a string.",
  }),
  bio: Joi.string().optional().default("").messages({
    "string.base": "Bio must be a string.",
  }),
  social: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required().messages({
          "string.base": "Social name must be a string.",
          "string.empty": "Social name cannot be empty.",
          "any.required": "Social name is a required field.",
        }),
        url: Joi.string().required().messages({
          "string.base": "Social URL must be a string.",
          "string.empty": "Social URL cannot be empty.",
          "any.required": "Social URL is a required field.",
        }),
      }),
    )
    .optional()
    .default([])
    .messages({
      "array.base": "Social must be an array.",
    }),
});

export const notificationSettingsSchema: ObjectSchema = Joi.object({
  messages: Joi.boolean().optional().default(true).messages({
    "boolean.base": "Messages must be a boolean.",
  }),
  follows: Joi.boolean().optional().default(true).messages({
    "boolean.base": "Follows must be a boolean.",
  }),
  reactions: Joi.boolean().optional().default(true).messages({
    "boolean.base": "Reactions must be a boolean.",
  }),
  comments: Joi.boolean().optional().default(true).messages({
    "boolean.base": "Comments must be a boolean.",
  }),
});
