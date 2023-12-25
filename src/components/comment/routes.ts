import express, { Router } from "express";
import { CommentControllers } from "./controllers";
import { AuthMiddleware } from "@components/auth/middlewares/auth";

export class CommentRoutes {
  static getRoutes(): Router {
    const router = express.Router();

    /**
     * @method POST
     * @param {string} path - /comments/posts/:postId/new
     * @description - Creates a new post
     */
    router.post("/comments/posts/:postId/new", AuthMiddleware.isAuthtenticated, CommentControllers.createComment);

    /**
     * @method GET
     * @param {string} path - /comments/posts/:postId/:page
     * @description - Gets all comments by post
     */
    router.get("/comments/posts/:postId/:page", AuthMiddleware.isAuthtenticated, CommentControllers.getComments);

    /**
     * @method DELETE
     * @param {string} path - /comments/:commentId/delete
     * @description - Deletes a comment
     * @query {string} parent - The parent comment id
     */
    router.delete(
      "/comments/posts/:postId/:commentId",
      AuthMiddleware.isAuthtenticated,
      CommentControllers.deleteComment,
    );

    /**
     * @method PATCH
     * @param {string} path - /comments/:commentId/update
     * @description - Updates a comment
     */
    router.patch(
      "/comments/posts/:postId/:commentId",
      AuthMiddleware.isAuthtenticated,
      CommentControllers.updateComment,
    );

    /**
     * @method POST
     * @param {string} path - /comments/:commentId/vote
     * @description - Votes a comment
     */
    router.post(
      "/comments/posts/:postId/:commentId/vote",
      AuthMiddleware.isAuthtenticated,
      CommentControllers.voteComment,
    );

    return router;
  }
}
