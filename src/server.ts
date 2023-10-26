import { App } from "./app";
import { env } from "./env";
import { middlewares } from "./middleware";

env.validateEnvs();

const app = new App(env.GITDEV_SERVER_PORT, middlewares);

app.connectToDatabase();

app.listen();
