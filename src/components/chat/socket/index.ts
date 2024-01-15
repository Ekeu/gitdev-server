import { Server, Socket } from "socket.io";

export class IOChat {
  static io: Server;

  constructor(io: Server) {
    IOChat.io = io;
  }

  public listen(): void {
    IOChat.io.on("connection", (socket: Socket) => {
      socket.on("join", (data) => {
        console.log("join", data);
      });
    });
  }
}
