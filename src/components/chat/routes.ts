import express, { Router } from "express";
import { ChatControllers } from "./controllers";
import { AuthMiddleware } from "@components/auth/middlewares/auth";

export class ChatRoutes {
  static getRoutes(): Router {
    const router = express.Router();

    /**
     * @method POST
     * @param {string} path - /chat/me/dm/:to
     * @description - Sends a message
     */
    router.post("/chat/me/dm/:to", AuthMiddleware.isAuthtenticated, ChatControllers.sendMessage);

    /**
     * @method POST
     * @param {string} path - /chat/users/add
     * @description - Adds a user to the chat list
     */
    router.post("/chat/users/add", AuthMiddleware.isAuthtenticated, ChatControllers.addChatUsers);

    /**
     * @method POST
     * @param {string} path - /chat/users/remove
     * @description - Removes a user from the chat list
     */
    router.post("/chat/users/remove", AuthMiddleware.isAuthtenticated, ChatControllers.removeChatUsers);

    /**
     * @method GET
     * @param {string} path - /chat/me/dms
     * @description - Fetches the current user's direct messages
     */
    router.get("/chat/me/dms", AuthMiddleware.isAuthtenticated, ChatControllers.getUserDMs);

    /**
     * @method GET
     * @param {string} path - /chat/me/dm/:to
     * @description - Fetches the current user's direct messages with a user
     */
    router.get("/chat/me/dm/:to", AuthMiddleware.isAuthtenticated, ChatControllers.getMessages);

    /**
     * @method PATCH
     * @param {string} path - /chat/me/dm/:to/:messageId/delete/:deletionType
     * @description - Deletes a message either for the current user or for both users
     * @example - /chat/me/dm/60f7a9b9e6b3a4b6f0b0a4a1/60f7a9b9e6b3a4b6f0b0a4a1/delete/forMe
     */
    router.patch(
      "/chat/me/dm/:to/:messageId/delete/:deletionType",
      AuthMiddleware.isAuthtenticated,
      ChatControllers.deleteMessage,
    );

    /**
     * @method PATCH
     * @param {string} path - /chat/me/dm/:to/read
     * @description - Marks a message as read
     * @example - /chat/me/dm/60f7a9b9e6b3a4b6f0b0a4a1/read
     */
    router.patch("/chat/me/dm/:to/read", AuthMiddleware.isAuthtenticated, ChatControllers.readMessages);

    /**
     * @method POST
     * @param {string} path - /chat/me/dm/:to/reaction
     * @description - Adds a reaction to a message
     * @example - /chat/me/dm/60f7a9b9e6b3a4b6f0b0a4a1/reaction
     */
    router.post("/chat/me/dm/:to/reaction", AuthMiddleware.isAuthtenticated, ChatControllers.addReaction);

    return router;
  }
}
