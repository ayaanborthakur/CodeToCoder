import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from './firebase';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Validates the file before upload
 */
function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File too large. Maximum size is 2MB.';
  }
  return null;
}

/**
 * Uploads a profile picture to Firebase Storage and updates Firestore
 */
export async function uploadProfilePicture(userId: string, file: File): Promise<UploadResult> {
  const validationError = validateFile(file);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    // Create a reference to the profile picture location
    const storageRef = ref(storage, `profile/${userId}`);
    
    // Upload the file
    await uploadBytes(storageRef, file, {
      contentType: file.type,
    });
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update Firestore with the avatar URL
    await updateAvatarInFirestore(userId, downloadURL);
    
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to upload image' 
    };
  }
}

/**
 * Deletes the user's profile picture from Firebase Storage
 */
export async function deleteProfilePicture(userId: string): Promise<UploadResult> {
  try {
    const storageRef = ref(storage, `profile/${userId}`);
    await deleteObject(storageRef);
    
    // Remove avatar URL from Firestore
    await updateAvatarInFirestore(userId, null);
    
    return { success: true };
  } catch (error) {
    // If the file doesn't exist, that's fine - just update Firestore
    if ((error as any)?.code === 'storage/object-not-found') {
      await updateAvatarInFirestore(userId, null);
      return { success: true };
    }
    
    console.error('Error deleting profile picture:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete image' 
    };
  }
}

/**
 * Updates the avatar field in the user's Firestore document
 */
export async function updateAvatarInFirestore(userId: string, avatarUrl: string | null): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    avatar: avatarUrl
  });
}
