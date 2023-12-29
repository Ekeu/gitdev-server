import Joi, { ObjectSchema } from "joi";

export const followSchema: ObjectSchema = Joi.object({
  followingId: Joi.string().required().messages({
    "string.base": "Following ID must be a string. Please check your input.",
    "string.empty": "Following ID cannot be empty. Please provide the Following ID.",
    "any.required": "Following ID is a required field. Please include the Following ID.",
  }),
});

export const unfollowSchema: ObjectSchema = Joi.object({
  followingId: Joi.string().required().messages({
    "string.base": "Following ID must be a string. Please check your input.",
    "string.empty": "Following ID cannot be empty. Please provide the Following ID.",
    "any.required": "Following ID is a required field. Please include the Following ID.",
  }),
});

export const getFollowsSchema: ObjectSchema = Joi.object({
  type: Joi.string().valid("followers", "following").required().messages({
    "string.base": "Type must be a string. Please check your input.",
    "string.empty": "Type cannot be empty. Please provide the Type.",
    "any.required": "Type is a required field. Please include the Type.",
    "any.only": "Type must be either followers or following. Please check your input.",
  }),
  userId: Joi.string().optional().allow("").messages({
    "string.base": "User ID must be a string. Please check your input.",
  }),
  page: Joi.string().required().messages({
    "string.base": "Page must be a string. Please check your input.",
    "string.empty": "Page cannot be empty. Please provide the Page.",
    "any.required": "Page is a required field. Please include the Page.",
  }),
});
