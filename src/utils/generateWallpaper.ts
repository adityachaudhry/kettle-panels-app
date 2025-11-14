import {
  getGeneratedImagePath,
  saveGeneratedImage,
  upsertGeneratedMapping,
  getPhotosDir,
} from "./fileIO";
import OpenAI, { toFile } from "openai";
import fs from "fs";
import path from "path";

export const DEFAULT_STYLE = "default";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Fetches and stores a generated image for a given photo guid and style.
 * Returns the file path to the generated image.
 */
export async function fetchAndStoreGeneratedImage(
  userData: string,
  guid: string,
  style: string = DEFAULT_STYLE
): Promise<string> {
  const photoDataUrl = getGeneratedImagePath(userData, guid, style);
  if (photoDataUrl) return photoDataUrl;

  // Get the original photo file path
  const photosDir = getPhotosDir(userData);
  const photoPath = path.join(photosDir, guid);
  if (!fs.existsSync(photoPath)) {
    throw new Error(`Photo file not found: ${photoPath}`);
  }

  const prompt =
    "Recreate this image in animated style with elements from ghibli studio but keeping the original color grading. Pay special attention to not breaking the physics of the environment, or of hands, and really try to preserve the essence of the subject(s) of the photo. Please do not laterally flip or rotate the image.";
  const imageFile = await toFile(fs.createReadStream(photoPath), null, {
    type: "image/png",
  });

  const result = await openai.images.edit({
    model: "gpt-image-1",
    image: imageFile,
    prompt,
    // @ts-expect-error: The 'size' property is not in the type definition but is required by the OpenAI API.
    size: "1536x1024",
    quality: "high",
  });
  const generatedBase64 = result.data[0].b64_json;
  const filePath = saveGeneratedImage(userData, guid, style, generatedBase64);
  upsertGeneratedMapping(userData, {
    [guid]: { [style]: path.basename(filePath) },
  });
  return filePath;
}
