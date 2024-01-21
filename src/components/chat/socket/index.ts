import { Server, Socket } from "socket.io";
import { IChatUsers } from "../interfaces";
import { IOUser } from "@components/user/socket";

export class IOChat {
  static io: Server;

  constructor(io: Server) {
    IOChat.io = io;
  }

  public listen(): void {
    IOChat.io.on("connection", (socket: Socket) => {
      socket.on("join", (data: IChatUsers) => {
        const { from, to } = data;

        const fromSockets = IOUser.connectedUsers.get(from);
        const toSockets = IOUser.connectedUsers.get(to);

        if (fromSockets) {
          fromSockets.forEach((socket) => {
            socket.join(socket.id);
          });
        }

        if (toSockets) {
          toSockets.forEach((socket) => {
            socket.join(socket.id);
          });
        }
      });
    });
  }
}
