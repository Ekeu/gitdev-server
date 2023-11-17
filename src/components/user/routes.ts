import express, { Router } from "express";
import { UserControllers } from "./controllers";
import { AuthMiddleware } from "@components/auth/middlewares/auth";

export class UserRoutes {
  static getRoutes(): Router {
    const router = express.Router();

    /**
     * @method GET
     * @param {string} path - /users/me
     * @description - Fetches the current user's profile
     */
    router.get("/users/me", AuthMiddleware.isAuthtenticated, UserControllers.fetchUserProfile);
    return router;
  }
}
