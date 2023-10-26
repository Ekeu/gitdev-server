import { createAdapter } from "@socket.io/redis-adapter";
import { Server as HTTPServer } from "http";
import { createClient } from "redis";
import { Server } from "socket.io";
import { env } from "src/env";

export const createSocketIOServer = async (
  server: HTTPServer,
): Promise<Server> => {
  const io = new Server(server, {
    cors: {
      origin: env.GITDEV_CLIENT_URL,
      methods: ["GET", "POST", "PUT", "DELETE", " "],
    },
  });

  const pubClient = createClient({ url: env.GITDEV_REDIS_HOST });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  io.adapter(createAdapter(pubClient, subClient));

  return io;
};
