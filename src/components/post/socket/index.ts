import { Server, Socket } from "socket.io";

export class IOPost {
  static io: Server;

  constructor(io: Server) {
    IOPost.io = io;
  }

  public listen(): void {
    IOPost.io.on("connection", (_socket: Socket) => {
      console.log("A user connected to the post socket.");
    });
  }
}
