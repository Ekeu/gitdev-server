import { App } from "@/app";
import { env } from "@/env";
import { middlewares } from "@middlewares/index.ts";
import { AuthRoutes } from "@components/auth/routes";
import { UserRoutes } from "@components/user/routes";
import { errorMiddlewares } from "@utils/errors/error-middlewares";
import { PostRoutes } from "@components/post/routes";

// Validate environment variables
env.validateEnvs();

//Initializing the express app
const app = new App(
  env.GITDEV_SERVER_PORT,
  middlewares,
  [AuthRoutes.getRoutes(), UserRoutes.getRoutes(), PostRoutes.getRoutes()],
  errorMiddlewares,
);

// Initialize cloudinary
app.initCloudinary();

// Connect to database
app.connectToDatabase();

// Listen to the server
app.listen();
