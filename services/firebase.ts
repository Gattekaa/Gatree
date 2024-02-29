import { storage } from "@/database/firebase";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";

/**
 * Service to upload a file to Firebase Storage
 *
 * @example
 *   uploadFile(file, 'foler_name', 'file_name')
 *
 * @category Services
 * @param {string} fileName - Nome do arquivo
 * @param {File} file - Arquivo da foto
 * @param {string} folderName - Nome da pasta
 * @returns {Promise<string>} URL da foto
 */

export async function uploadFile(
  file: File | Blob | Uint8Array | ArrayBuffer,
  folderName: string,
  fileName: string,
): Promise<string> {
  const storageRef = ref(storage, `${folderName}/${fileName}`);
  await uploadBytes(storageRef, file);

  return await getDownloadURL(storageRef);
}

/**
 * Service to delete a file from Firebase Storage
 *
 * @example
 *   deleteFile('foler_name', 'file_name')
 *
 * @category Services
 * @param {string} fileName - Nome do arquivo
 * @param {string} folderName - Nome da pasta
 * @returns {Promise<void>}
 */

export async function deleteFile(
  folderName: string,
  fileName: string,
): Promise<void> {
  const storageRef = ref(storage, `${folderName}/${fileName}`);
  await deleteObject(storageRef);
}
