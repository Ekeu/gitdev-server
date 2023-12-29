import express, { Router } from "express";
import { FollowControllers } from "./controllers";
import { AuthMiddleware } from "@components/auth/middlewares/auth";

export class FollowRoutes {
  static getRoutes(): Router {
    const router = express.Router();

    /**
     * @method POST
     * @param {string} path - "/follow/:followingId"
     * @description - Follow a user
     */
    router.post("/follow/:followingId", AuthMiddleware.isAuthtenticated, FollowControllers.follow);

    /**
     * @method POST
     * @param {string} path - "/unfollow/:followingId"
     * @description - Unfollow a user
     */
    router.post("/unfollow/:followingId", AuthMiddleware.isAuthtenticated, FollowControllers.unfollow);

    /**
     * @method GET
     * @param {string} path - "/follows/:type/:userId/:page"
     * @description - Get followers or following of a user
     * @example - /follows/followers/60f7a9b9e6b3a4b6f0b0a4a1/1
     * @example - /follows/following/60f7a9b9e6b3a4b6f0b0a4a1/1
     */
    router.get("/follows/:type/:userId/:page", AuthMiddleware.isAuthtenticated, FollowControllers.getFollows);

    return router;
  }
}
