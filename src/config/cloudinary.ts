import { env } from "@/env";
import { v2 as cloudinary } from "cloudinary";

export const initCloudinary = () => {
  cloudinary.config({
    cloud_name: env.GITDEV_CLOUDINARY_CLOUD_NAME,
    api_key: env.GITDEV_CLOUDINARY_API_KEY,
    api_secret: env.GITDEV_CLOUDINARY_API_SECRET,
  });
};
