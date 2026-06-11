import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(base64Image: string, folder = "tabanni"): Promise<string> {
  const result = await cloudinary.uploader.upload(base64Image, {
    folder,
    resource_type: "auto",
  });
  return result.secure_url;
}

export async function uploadImageBuffer(buffer: Buffer, folder = "tabanni"): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error || !result) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export { cloudinary };