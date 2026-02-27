import Constants from 'expo-constants';

/**
 * Get Cloudinary configuration from environment variables
 */
const getCloudinaryConfig = () => {
  const cloudName =
    Constants.expoConfig?.extra?.cloudinaryCloudName ||
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset =
    Constants.expoConfig?.extra?.cloudinaryUploadPreset ||
    process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const apiKey =
    Constants.expoConfig?.extra?.cloudinaryApiKey || process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing. Please check your .env file.');
  }

  return {
    cloudName,
    uploadPreset,
    apiKey,
  };
};

/**
 * Cloudinary service for handling image uploads
 */
export class CloudinaryService {
  /**
   * Upload image to Cloudinary
   * @param imageUri - Local URI of the image to upload
   * @param folder - Optional folder path in Cloudinary
   * @returns Promise with the uploaded image URL
   */
  static async uploadImage(
    imageUri: string,
    folder?: string
  ): Promise<{ url: string; publicId: string }> {
    try {
      const config = getCloudinaryConfig();

      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);
      formData.append('upload_preset', config.uploadPreset);
      formData.append('cloud_name', config.cloudName);

      if (folder) {
        formData.append('folder', folder);
      }

      // Upload to Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload image');
      }

      const data = await response.json();

      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      throw new Error(error.message || 'Failed to upload image to Cloudinary');
    }
  }

  /**
   * Upload multiple images to Cloudinary
   * @param imageUris - Array of local URIs
   * @param folder - Optional folder path
   * @returns Promise with array of uploaded image URLs
   */
  static async uploadMultipleImages(
    imageUris: string[],
    folder?: string
  ): Promise<Array<{ url: string; publicId: string }>> {
    try {
      const uploadPromises = imageUris.map(uri => this.uploadImage(uri, folder));
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error: any) {
      console.error('Multiple image upload error:', error);
      throw new Error(error.message || 'Failed to upload images');
    }
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - Public ID of the image to delete
   */
  static async deleteImage(publicId: string): Promise<void> {
    try {
      const config = getCloudinaryConfig();
      const timestamp = Math.round(new Date().getTime() / 1000);

      // Generate signature (if using signed uploads)
      // For unsigned uploads with upload preset, deletion might require API key/secret
      // This is a simplified version - you may need to implement signature generation

      const deleteUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`;

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('timestamp', timestamp.toString());

      const response = await fetch(deleteUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to delete image from Cloudinary');
      }
    } catch (error: any) {
      console.error('Cloudinary delete error:', error);
      throw new Error(error.message || 'Failed to delete image');
    }
  }
}
