import express, { Router } from "express";
import { AuthUserControllers } from "./controllers";

export class AuthRoutes {
  static getRoutes(): Router {
    const router = express.Router();

    /**
     * @method POST
     * @param {string} path - /auth/signup
     * @description - Registers a new user
     */
    router.post("/auth/signup", AuthUserControllers.signUp);

    /**
     * @method POST
     * @param {string} path - /auth/signin
     * @description - Signs in a user
     */
    router.post("/auth/signin", AuthUserControllers.signIn);

    /**
     * @method POST
     * @param {string} path - /auth/signout
     * @description - Signs out a user
     */
    router.post("/auth/signout", AuthUserControllers.signOut);

    return router;
  }
}
