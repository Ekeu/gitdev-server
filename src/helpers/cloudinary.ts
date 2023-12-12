import { UploadApiOptions, UploadApiResponse, v2 as cloudinary } from "cloudinary";

export const uploadImage = (file: string, options?: UploadApiOptions): Promise<UploadApiResponse> => {
  return cloudinary.uploader.upload(file, options);
};

export const deleteImagesByTag = (tag: string): Promise<any> => {
  return cloudinary.api.delete_resources_by_tag(tag);
};

export const removeTagFromImages = (publicIds: string[], tag: string): Promise<any> => {
  return cloudinary.uploader.remove_tag(tag, publicIds);
};
