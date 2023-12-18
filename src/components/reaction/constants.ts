export const GITDEV_REACTION_ENUM = [
  "upvote",
  "downvote",
  "smile",
  "celebrate",
  "insightful",
  "love",
  "rocket",
  "eyes",
];
export const GITDEV_REACTION_CACHE = "reaction-cache";
export const GITDEV_REACTION_CREATE_QUEUE = "reaction-mq-create";
export const GITDEV_REACTION_DELETE_QUEUE = "reaction-mq-delete";
export const GITDEV_REACTION_CREATE_JOB = "job-reaction-mq-create";
export const GITDEV_REACTION_DELETE_JOB = "job-reaction-mq-delete";
export const GITDEV_ERRORS = {
  REACTION_NOT_FOUND: {
    name: "ReactionNotFound",
    message: "Reaction not found for this post",
  },
  REACTION_TYPE_NOT_FOUND: {
    name: "ReactionTypeNotFound",
    message: "Reaction type not found for this post",
  },
  REACTION_TYPE_MISMATCH: {
    name: "ReactionTypeMismatch",
    message: "Reaction type mismatch for this post",
  },
};
