import { UploadApiOptions, UploadApiResponse, v2 as cloudinary } from "cloudinary";

export const uploadImage = (file: string, options?: UploadApiOptions): Promise<UploadApiResponse> => {
  return cloudinary.uploader.upload(file, options);
};
