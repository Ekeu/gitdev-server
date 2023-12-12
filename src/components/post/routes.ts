import express, { Router } from "express";
import { PostControllers } from "./controllers";
import { AuthMiddleware } from "@components/auth/middlewares/auth";

export class PostRoutes {
  static getRoutes(): Router {
    const router = express.Router();

    /**
     * @method GET
     * @param {string} path - /posts/:page
     * @description - Gets all posts by page
     */
    router.get("/posts/all/:page", AuthMiddleware.isAuthtenticated, PostControllers.getPosts);

    /**
     * @method GET
     * @param {string} path - /posts/:postId
     * @description - Gets a post by id
     */

    router.get("/posts/:postId", AuthMiddleware.isAuthtenticated, PostControllers.getPost);

    /**
     * @method DELETE
     * @param {string} path - /posts/:postId
     * @description - Deletes a post
     */
    router.delete("/posts/:postId", AuthMiddleware.isAuthtenticated, PostControllers.deletePost);

    /**
     * @method PATCH
     * @param {string} path - /posts/:postId
     * @description - Updates a post
     */
    router.patch("/posts/:postId", AuthMiddleware.isAuthtenticated, PostControllers.updatePost);

    /**
     * @method POST
     * @param {string} path - /posts/new
     * @description - Creates a new post
     */
    router.post("/posts/new", AuthMiddleware.isAuthtenticated, PostControllers.createPost);

    return router;
  }
}
