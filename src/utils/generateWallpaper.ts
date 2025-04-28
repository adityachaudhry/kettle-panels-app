import {
  getGeneratedImagePath,
  saveGeneratedImage,
  upsertGeneratedMapping,
} from "./fileIO";
import axios from "axios";

export const DEFAULT_STYLE = "default";
const isDev = process.env.NODE_ENV === "development";
const API_URL =
  process.env.API_URL ||
  (isDev ? "http://localhost:8000" : "https://your-production-api.com");

/**
 * Fetches and stores a generated image for a given photo guid and style.
 * Returns the file path to the generated image.
 */
export async function fetchAndStoreGeneratedImage(
  userData: string,
  guid: string,
  style: string = DEFAULT_STYLE
): Promise<string> {
  // Example: call your image generation API
  const photoDataUrl = getGeneratedImagePath(userData, guid, style);
  if (photoDataUrl) return photoDataUrl;

  // Replace with actual API endpoint and payload
  const response = await axios.post(`${API_URL}/image-gen`, {
    guid,
    style,
    // ...other payload as needed
  });
  const { base64, fileName } = response.data;
  const filePath = saveGeneratedImage(userData, guid, style, base64);
  upsertGeneratedMapping(userData, { [guid]: { [style]: fileName } });
  return filePath;
}
