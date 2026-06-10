import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export interface PickedImage {
  uri: string;
  fileName: string;
  mimeType: string;
}

/**
 * Launches the device image library and returns the selected image, or `null`
 * if the user cancelled or permission was denied.
 */
export async function pickImage(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permission to access photos was denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.7,
  });

  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    fileName: asset.fileName ?? `image-${Date.now()}.jpg`,
    mimeType: asset.mimeType ?? 'image/jpeg',
  };
}

/**
 * Reads a local file URI into a Blob.
 *
 * `fetch(uri).blob()` is unreliable on React Native (it can yield an empty or
 * corrupt blob), so we use XMLHttpRequest which works consistently on native
 * and web. A corrupt blob is exactly what makes an uploaded image appear fine
 * in the uploader's session but broken for everyone else.
 */
function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response as Blob);
    xhr.onerror = () => reject(new Error('Failed to read image file'));
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}

/**
 * Uploads a local image URI to Firebase Storage under `folder/` and returns the
 * public download URL.
 */
export async function uploadImageAsync(
  uri: string,
  folder: string,
  mimeType = 'image/jpeg',
): Promise<string> {
  const blob = await uriToBlob(uri);

  const contentType = blob.type || mimeType;
  const extension = (contentType.split('/')[1] || 'jpg').split('+')[0];
  const path = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, blob, { contentType });
  return getDownloadURL(storageRef);
}

/**
 * Convenience helper: pick an image and upload it, returning the download URL.
 * Returns `null` if the user cancelled the picker.
 */
export async function pickAndUploadImage(folder: string): Promise<string | null> {
  const picked = await pickImage();
  if (!picked) return null;
  return uploadImageAsync(picked.uri, folder, picked.mimeType);
}
