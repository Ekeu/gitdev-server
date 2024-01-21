import express, { Router } from "express";
import { UserControllers } from "./controllers";
import { AuthMiddleware } from "@components/auth/middlewares/auth";

export class UserRoutes {
  static getRoutes(): Router {
    const router = express.Router();

    /**
     * @method GET
     * @param {string} path - /users/:me
     * @description - Fetches a user's profile
     */
    router.get("/users/:me", AuthMiddleware.isAuthtenticated, UserControllers.fetchUserProfile);

    /**
     * @method GET
     * @param {string} path - /users/posts/:me/:redisId/:page
     * @description - Fetches a user's posts
     */
    router.get("/users/posts/:me/:redisId/:page", AuthMiddleware.isAuthtenticated, UserControllers.fetchUserPosts);

    /**
     * @method PATCH
     * @param {string} path - /users/me/:action/:blockedUserId
     * @description - Block or unblock a user
     * @example - /users/me/block/60f7a9b9e6b3a4b6f0b0a4a1
     * @example - /users/me/unblock/60f7a9b9e6b3a4b6f0b0a4a1
     */
    router.patch(
      "/users/me/:action/:blockedUserId",
      AuthMiddleware.isAuthtenticated,
      UserControllers.updateUserBlockList,
    );

    /**
     * @method PATCH
     * @param {string} path - /users/me/avatar
     * @description - Update the current user's avatar
     */
    router.patch("/users/me/avatar", AuthMiddleware.isAuthtenticated, UserControllers.updateUserAvatar);

    /**
     * @method GET
     * @param {string} path - /users/me/suggestions
     * @description - Fetches a user's suggestions
     * @example - /users/me/suggestions?limit=3
     */
    router.get("/users/me/suggestions", AuthMiddleware.isAuthtenticated, UserControllers.fetchUserSuggestions);

    /**
     * @method GET
     * @param {string} path - /users/me/search/autocomplete
     * @description - Search for a user
     * @example - /users/me/search/autocomplete?query=john
     */
    router.get(
      "/users/me/search/autocomplete",
      AuthMiddleware.isAuthtenticated,
      UserControllers.searchAutoCompleteUsers,
    );

    /**
     * @method GET
     * @param {string} path - /users/me/search
     * @description - Search for a user
     * @example - /users/me/search?query=john
     */
    router.get("/users/me/search", AuthMiddleware.isAuthtenticated, UserControllers.searchUsers);

    /**
     * @method PATCH
     * @param {string} path - /users/me/update
     * @description - Update the current user's basic info
     * @example - /users/me/update
     */
    router.patch("/users/me/update", AuthMiddleware.isAuthtenticated, UserControllers.updateUserBasicInfo);

    /**
     * @method PATCH
     * @param {string} path - /users/me/notifications/settings
     * @description - Update the current user's notification settings
     * @example - /users/me/notifications/settings
     */
    router.patch(
      "/users/me/notifications/settings",
      AuthMiddleware.isAuthtenticated,
      UserControllers.updateNotificationSettings,
    );

    return router;
  }
}
