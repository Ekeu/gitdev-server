import { Server, Socket } from "socket.io";

export class IOUser {
  static io: Server;
  static connectedUsers: Map<string, Socket[]> = new Map();

  constructor(io: Server) {
    IOUser.io = io;
  }

  public listen(): void {
    IOUser.io.on("connection", (socket: Socket) => {
      socket.on("connect", (userId: string) => {
        if (IOUser.connectedUsers.has(userId)) {
          IOUser.connectedUsers.get(userId)?.push(socket);
        } else {
          IOUser.connectedUsers.set(userId, [socket]);
        }

        const _connectedUsers = Array.from(IOUser.connectedUsers.keys());

        IOUser.io.emit("online", _connectedUsers);
      });

      socket.on("block", (data) => {
        IOUser.io.emit("block", data);
      });

      socket.on("unblock", (data) => {
        IOUser.io.emit("unblock", data);
      });

      socket.on("disconnect", (userId: string) => {
        const userSockets = IOUser.connectedUsers.get(userId);

        if (userSockets) {
          const index = userSockets.indexOf(socket);

          if (index !== -1) {
            userSockets.splice(index, 1);
          }

          if (userSockets.length === 0) {
            IOUser.connectedUsers.delete(userId);
          }
        }

        const _connectedUsers = Array.from(IOUser.connectedUsers.keys());

        IOUser.io.emit("online", _connectedUsers);
      });
    });
  }
}
