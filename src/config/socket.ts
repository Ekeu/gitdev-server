import { createAdapter } from "@socket.io/redis-adapter";
import { Server as HTTPServer } from "http";
import { createClient } from "redis";
import { Server } from "socket.io";
import { env } from "@/env";
import { IOPost } from "@components/post/socket";
import { IOFollow } from "@components/follow/socket";
import { IOUser } from "@components/user/socket";
import { IONotification } from "@components/notification/socket";

export const createSocketIOServer = async (server: HTTPServer): Promise<Server> => {
  const io = new Server(server, {
    cors: {
      origin: env.GITDEV_CLIENT_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    },
  });

  const pubClient = createClient({ url: env.GITDEV_REDIS_HOST });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  io.adapter(createAdapter(pubClient, subClient));

  return io;
};

export const socketIOConnections = (io: Server): void => {
  new IONotification(io);
  const iopost = new IOPost(io);
  const iofollow = new IOFollow(io);
  const iouser = new IOUser(io);

  iopost.listen();
  iofollow.listen();
  iouser.listen();
};
