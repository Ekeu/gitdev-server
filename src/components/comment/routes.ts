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

    return router;
  }
}
