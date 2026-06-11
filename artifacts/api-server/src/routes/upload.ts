import { Router, type IRouter } from "express";
import { uploadImage } from "../lib/cloudinary";

const router: IRouter = Router();

router.post("/upload/image", async (req, res) => {
  try {
    const { image } = req.body as { image?: string };
    if (!image) {
      return res.status(400).json({ error: "validation_error", message: "image is required" });
    }
    const url = await uploadImage(image, "tabanni");
    res.json({ url });
  } catch (err) {
    req.log.error({ err }, "Error uploading image");
    res.status(500).json({ error: "upload_error", message: "Failed to upload image" });
  }
});

export default router;