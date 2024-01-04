import Joi, { ObjectSchema } from "joi";

export const notificationSchema: ObjectSchema = Joi.object({
  notificationId: Joi.string().required().messages({
    "string.base": "Notification ID must be a string.",
    "string.empty": "Notification ID cannot be empty.",
    "any.required": "Notification ID is required.",
  }),
});

export const notificationPaginationSchema: ObjectSchema = Joi.object({
  page: Joi.number().integer().min(1).required().options({ convert: true }).messages({
    "number.base": "Page must be a number.",
    "number.integer": "Page must be an integer.",
    "number.min": "Page must be greater than or equal to 1.",
    "any.required": "Page is required.",
  }),
});
