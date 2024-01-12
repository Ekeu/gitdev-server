import Joi, { ObjectSchema } from "joi";

export const messageSchema: ObjectSchema = Joi.object({
  chatId: Joi.string().optional().allow(null, "").default(""),
  isRead: Joi.boolean().optional().default(false),
  message: Joi.object({
    type: Joi.string().valid("text", "image", "file", "gif").required().messages({
      "string.base": "Message type must be a string. Please check your input.",
      "string.empty": "Message type cannot be empty. Please provide the Message type.",
      "any.required": "Message type is a required field. Please include the Message type.",
      "any.only": "Message type must be either text, image, file or gif. Please check your input.",
    }),
    content: Joi.string().required().messages({
      "string.base": "Message content must be a string. Please check your input.",
      "string.empty": "Message content cannot be empty. Please provide the Message content.",
      "any.required": "Message content is a required field. Please include the Message content.",
    }),
  })
    .required()
    .messages({
      "object.base": "Message must be an object. Please check your input.",
      "object.empty": "Message cannot be empty. Please provide the Message.",
      "any.required": "Message is a required field. Please include the Message.",
    }),
});

export const messageSchemaParams: ObjectSchema = Joi.object({
  to: Joi.string().required().messages({
    "string.base": "Message recipient must be a string. Please check your input.",
    "string.empty": "Message recipient cannot be empty. Please provide the Message recipient.",
    "any.required": "Message recipient is a required field. Please include the Message recipient.",
  }),
});
