import * as fs from "fs";
import * as path from "path";

export function getUserDataPath(appInstance: {
  getPath: (name: string) => string;
}) {
  return appInstance.getPath("userData");
}

export function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

export function readJSON(filePath: string, fallback: any = {}) {
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      return fallback;
    }
  }
  return fallback;
}

export function writeJSON(filePath: string, data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function getPhotosDir(userData: string) {
  return path.join(userData, "kettle-panels", "photos");
}

export function getPhotosMetadataPath(userData: string) {
  return path.join(getPhotosDir(userData), "metadata.json");
}

export function getPrefsDir(userData: string) {
  return path.join(userData, "kettle-panels");
}

export function getPrefsPath(userData: string) {
  return path.join(getPrefsDir(userData), "preferences.json");
}

export function getGeneratedDir(userData: string) {
  return path.join(userData, "kettle-panels", "generated");
}

export function getGeneratedMappingPath(userData: string) {
  return path.join(getGeneratedDir(userData), "mapping.json");
}

export function getThumbnailsPath(userData: string) {
  return path.join(getPrefsDir(userData), "thumbnails.json");
}

// --- High-level abstractions ---

// Photos Metadata
export function getAllPhotosMetadata(userData: string) {
  return readJSON(getPhotosMetadataPath(userData), {});
}
export function saveAllPhotosMetadata(userData: string, metadata: any) {
  writeJSON(getPhotosMetadataPath(userData), metadata);
}

// Thumbnails
export function getAllThumbnails(userData: string) {
  return readJSON(getThumbnailsPath(userData), {});
}
export function saveAllThumbnails(
  userData: string,
  mapping: Record<string, string | null>
) {
  writeJSON(getThumbnailsPath(userData), mapping);
}

// Preferences
export function getAllPreferences(userData: string) {
  return readJSON(getPrefsPath(userData), { autoRotateInterval: 0 });
}
export function saveAllPreferences(userData: string, prefs: any) {
  ensureDir(getPrefsDir(userData));
  writeJSON(getPrefsPath(userData), prefs);
}

// Generated Mapping
export function getAllGeneratedMapping(userData: string) {
  return readJSON(getGeneratedMappingPath(userData), {});
}
export function saveAllGeneratedMapping(userData: string, mapping: any) {
  writeJSON(getGeneratedMappingPath(userData), mapping);
}

// Photo file operations
export function savePhotoFile(userData: string, guid: string, dataUrl: string) {
  const photosDir = getPhotosDir(userData);
  ensureDir(photosDir);
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid data URL");
  const buffer = Buffer.from(matches[2], "base64");
  const filePath = path.join(photosDir, guid);
  fs.writeFileSync(filePath, buffer);
}

export function deletePhotoFile(userData: string, guid: string) {
  const photosDir = getPhotosDir(userData);
  const filePath = path.join(photosDir, guid);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export function readPhotoFileAsDataUrl(
  userData: string,
  guid: string
): string | null {
  const photosDir = getPhotosDir(userData);
  const filePath = path.join(photosDir, guid);
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  return `data:image/*;base64,${buffer.toString("base64")}`;
}

// Generated image file operations
export function saveGeneratedImage(
  userData: string,
  guid: string,
  style: string,
  base64: string
): string {
  const genDir = getGeneratedDir(userData);
  ensureDir(genDir);
  const genFileName = `${guid}_${style}`;
  const genFilePath = path.join(genDir, genFileName);
  fs.writeFileSync(genFilePath, Buffer.from(base64, "base64"));
  return genFilePath;
}

export function deleteGeneratedImage(
  userData: string,
  guid: string,
  style?: string
) {
  const mapping = getAllGeneratedMapping(userData);
  if (!mapping[guid]) return;
  if (style) {
    const fileName = mapping[guid][style];
    if (fileName) {
      const genDir = getGeneratedDir(userData);
      const genFilePath = path.join(genDir, fileName);
      if (fs.existsSync(genFilePath)) fs.unlinkSync(genFilePath);
    }
  } else {
    for (const fileName of Object.values(mapping[guid])) {
      const genDir = getGeneratedDir(userData);
      const genFilePath = path.join(genDir, fileName as string);
      if (fs.existsSync(genFilePath)) fs.unlinkSync(genFilePath);
    }
  }
}

export function readGeneratedImageAsDataUrl(
  userData: string,
  guid: string,
  style: string
): string | null {
  const genDir = getGeneratedDir(userData);
  const genFileName = `${guid}_${style}`;
  const genFilePath = path.join(genDir, genFileName);
  if (!fs.existsSync(genFilePath)) return null;
  const buffer = fs.readFileSync(genFilePath);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export function getGeneratedImagePath(
  userData: string,
  guid: string,
  style = "default"
): string | null {
  const mapping = getAllGeneratedMapping(userData);
  if (mapping[guid] && mapping[guid][style]) {
    const fileName = mapping[guid][style];
    const genDir = getGeneratedDir(userData);
    const genFilePath = path.join(genDir, fileName);
    if (fs.existsSync(genFilePath)) return genFilePath;
  }
  return null;
}

export function copyFileToDownloads(
  srcPath: string,
  destFileName: string,
  appInstance: { getPath: (name: string) => string }
): string {
  const downloadsDir = appInstance.getPath("downloads");
  const outPath = path.join(downloadsDir, destFileName);
  fs.copyFileSync(srcPath, outPath);
  return outPath;
}

// --- Upsert/Delete helpers ---

// Photos Metadata
export function upsertPhotoMetadata(
  userData: string,
  updates: Record<string, any>
): void {
  const metadata = getAllPhotosMetadata(userData);
  Object.assign(metadata, updates);
  saveAllPhotosMetadata(userData, metadata);
}

export function deletePhotoMetadata(userData: string, guids: string[]): void {
  const metadata = getAllPhotosMetadata(userData);
  for (const guid of guids) {
    delete metadata[guid];
  }
  saveAllPhotosMetadata(userData, metadata);
}

// Generated Mapping
export function upsertGeneratedMapping(
  userData: string,
  updates: Record<string, Record<string, string>>
): void {
  const mapping = getAllGeneratedMapping(userData);
  for (const guid in updates) {
    if (!mapping[guid]) mapping[guid] = {};
    Object.assign(mapping[guid], updates[guid]);
  }
  saveAllGeneratedMapping(userData, mapping);
}

export function deleteGeneratedMappingEntry(
  userData: string,
  guids: string[],
  styles?: string[]
): void {
  const mapping = getAllGeneratedMapping(userData);
  for (const guid of guids) {
    if (!mapping[guid]) continue;
    if (styles && styles.length > 0) {
      for (const style of styles) {
        delete mapping[guid][style];
      }
      if (Object.keys(mapping[guid]).length === 0) delete mapping[guid];
    } else {
      delete mapping[guid];
    }
  }
  saveAllGeneratedMapping(userData, mapping);
}

// Thumbnails
export function upsertThumbnails(
  userData: string,
  updates: Record<string, string>
): void {
  const thumbs = getAllThumbnails(userData);
  Object.assign(thumbs, updates);
  saveAllThumbnails(userData, thumbs);
}

export function deleteThumbnails(userData: string, guids: string[]): void {
  const thumbs = getAllThumbnails(userData);
  for (const guid of guids) {
    delete thumbs[guid];
  }
  saveAllThumbnails(userData, thumbs);
}

// Preferences
export function upsertPreferences(
  userData: string,
  updates: Partial<Record<string, any>>
): void {
  const prefs = getAllPreferences(userData);
  Object.assign(prefs, updates);
  saveAllPreferences(userData, prefs);
}
