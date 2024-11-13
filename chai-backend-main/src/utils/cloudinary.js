import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_SECRET } from "../../env.js";


// Configuration
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      secure: true
    });
    console.log("File uploaded", response.url);
    // once uploaded remove file from server
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("Cloudinary Error", error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log("Deleted from Cloudinary. Public Id", publicId);
  } catch (error) {
    console.log("Error deleting from cloudinary", error?.message);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
