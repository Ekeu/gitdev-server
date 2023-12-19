import Joi, { ObjectSchema } from "joi";

export const commentSchema: ObjectSchema = Joi.object({
  content: Joi.string().required().messages({
    "string.base": "Content must be a string.",
    "string.empty": "Content cannot be empty.",
    "any.required": "Content is required.",
  }),
  parentCommentId: Joi.string().optional().allow("").messages({
    "string.base": "Parent comment ID must be a string.",
  }),
});

export const commentSchemaParams: ObjectSchema = Joi.object({
  postId: Joi.string().required().messages({
    "string.base": "Post ID must be a string.",
    "string.empty": "Post ID cannot be empty.",
    "any.required": "Post ID is required.",
  }),
});

export const updateCommentSchema: ObjectSchema = Joi.object({
  content: Joi.string().required().messages({
    "string.base": "Content must be a string.",
    "string.empty": "Content cannot be empty.",
    "any.required": "Content is required.",
  }),
});

export const updateCommentSchemaParams: ObjectSchema = Joi.object({
  postId: Joi.string().required().messages({
    "string.base": "Post ID must be a string.",
    "string.empty": "Post ID cannot be empty.",
    "any.required": "Post ID is required.",
  }),
  commentId: Joi.string().required().messages({
    "string.base": "Comment ID must be a string.",
    "string.empty": "Comment ID cannot be empty.",
    "any.required": "Comment ID is required.",
  }),
});

export const voteCommentSchema: ObjectSchema = Joi.object({
  commentId: Joi.string().required().messages({
    "string.base": "Comment ID must be a string.",
    "string.empty": "Comment ID cannot be empty.",
    "any.required": "Comment ID is required.",
  }),
  value: Joi.number().integer().valid(-1, 1).required().messages({
    "number.base": "Vote value must be a number.",
    "number.integer": "Vote value must be an integer.",
    "any.required": "Vote value is required.",
    "any.only": "Vote value must be either -1 (downvote) or 1 (upvote).",
  }),
});

export const deleteCommentSchemaQuery: ObjectSchema = Joi.object({
  parentCommentId: Joi.string().optional().allow("").messages({
    "string.base": "Parent comment ID must be a string.",
  }),
});

export const deleteCommentSchemaParams: ObjectSchema = Joi.object({
  commentId: Joi.string().required().messages({
    "string.base": "Comment ID must be a string.",
    "string.empty": "Comment ID cannot be empty.",
    "any.required": "Comment ID is required.",
  }),
  postId: Joi.string().required().messages({
    "string.base": "Post ID must be a string.",
    "string.empty": "Post ID cannot be empty.",
    "any.required": "Post ID is required.",
  }),
});

export const getCommentsSchema: ObjectSchema = Joi.object({
  postId: Joi.string().required().messages({
    "string.base": "Post ID must be a string.",
    "string.empty": "Post ID cannot be empty.",
    "any.required": "Post ID is required.",
  }),
  page: Joi.number().integer().min(1).required().options({ convert: true }).messages({
    "number.base": "Page must be a number.",
    "number.integer": "Page must be an integer.",
    "number.min": "Page must be greater than or equal to 1.",
    "any.required": "Page is required.",
  }),
});
