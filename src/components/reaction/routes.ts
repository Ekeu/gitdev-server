import express, { Router } from "express";
import { AuthMiddleware } from "@components/auth/middlewares/auth";
import { ReactionControllers } from "./controllers";

export class ReactionRoutes {
  static getRoutes(): Router {
    const router = express.Router();

    /**
     * @method POST
     * @param {string} path - /reactions/add
     * @description - Add reaction to a post
     */
    router.post("/reactions/add", AuthMiddleware.isAuthtenticated, ReactionControllers.createReaction);

    /**
     * @method DELETE
     * @param {string} path - /reactions/delete
     * @description - Delete reaction from a post
     */
    router.delete(
      "/reactions/delete/post/:postId/type/:type",
      AuthMiddleware.isAuthtenticated,
      ReactionControllers.deleteReaction,
    );

    /**
     * @method GET
     * @param {string}
     * @description - Get all reactions for a post
     */
    router.get("/reactions/post/:postId", ReactionControllers.getPostReactions);

    /**
     * @method GET
     * @param {string}
     * @description - Get all reactions by a user
     */
    router.get("/reactions/user/:userId", ReactionControllers.getReactionsByUser);

    /**
     * @method GET
     * @param {string}
     * @description - Get post reaction by a user
     */
    router.get("/reactions/post/:postId/user/:userId", ReactionControllers.getPostReactionByUser);

    return router;
  }
}
