import Joi, { ObjectSchema } from "joi";

export const imageUploadSchema: ObjectSchema = Joi.object({
  img: Joi.string().required().messages({
    "string.base": "Please provide a valid image.",
    "string.empty": "The image field cannot be empty.",
    "any.required": "Image is a required field.",
  }),
  options: Joi.object().optional().default({}),
});

export const imageRemoveTagSchema: ObjectSchema = Joi.object({
  publicIds: Joi.array().items(Joi.string().required()).required().messages({
    "array.base": "Please provide a valid array of public ids.",
    "array.empty": "The public ids array cannot be empty.",
    "any.required": "The public ids array is a required field.",
    "string.base": "Please provide a valid public id.",
    "string.empty": "The public id field cannot be empty.",
  }),
});

export const postSchema: ObjectSchema = Joi.object({
  title: Joi.string().min(15).max(150).required().messages({
    "string.base": "Please enter a valid title.",
    "string.empty": "The title field cannot be empty.",
    "string.min": "The title must be at least 15 characters long.",
    "string.max": "The title cannot be longer than 150 characters.",
    "any.required": "The title is a required field.",
  }),
  content: Joi.string().required(),
  commentsEnabled: Joi.boolean().optional().default(false),
  tags: Joi.array().items(Joi.string().min(1).max(35)).required().messages({
    "array.base": "Please provide a valid array of tags.",
    "array.empty": "The tags array cannot be empty.",
    "any.required": "The tags array is a required field.",
    "string.base": "Please provide a valid tag.",
    "string.empty": "The tag field cannot be empty.",
    "string.min": "A tag must be at least 1 character long.",
    "string.max": "A tag cannot be longer than 35 characters.",
  }),
  privacy: Joi.string().valid("public", "private", "followers").optional().default("public"),
});
