import { GITDEV_REACTION_ENUM } from "@components/reaction/constants";
import Joi, { ObjectSchema } from "joi";

export const reactionSchema: ObjectSchema = Joi.object({
  postId: Joi.string().required().messages({
    "string.base": "Please provide a valid post id.",
    "string.empty": "The post id field cannot be empty.",
    "any.required": "The post id is a required field.",
  }),
  type: Joi.string()
    .valid(...GITDEV_REACTION_ENUM)
    .required()
    .messages({
      "string.base": "Please provide a valid reaction type.",
      "string.empty": "The reaction type field cannot be empty.",
      "any.required": "The reaction type is a required field.",
      "any.valid": "Please provide a valid reaction type.",
    }),
});
