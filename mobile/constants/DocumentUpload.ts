/**
 * Document Upload Constants
 * Configuration for document and image uploads in the app
 */

export const DocumentUploadConfig = {
  // Maximum file size in bytes (10 MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,

  // Accepted file types for documents
  ACCEPTED_DOCUMENT_TYPES: ['image/*', 'application/pdf'] as string[],

  // Accepted image types for image picker
  ACCEPTED_IMAGE_TYPES: ['images'] as ('images' | 'videos' | 'livePhotos')[],

  // Image quality (0-1)
  IMAGE_QUALITY: 0.8,

  // Image picker options
  IMAGE_PICKER: {
    allowsEditing: true,
    quality: 0.8,
  },

  // Document picker options
  DOCUMENT_PICKER: {
    copyToCacheDirectory: true,
  },

  // Icon sizes
  ICONS: {
    requirement: 20,
    upload: 48,
    fileInfo: 20,
  },

  // Colors (matching with app theme)
  COLORS: {
    success: '#16A34A', // Green
    border: '#9CA3AF', // Gray
    borderDashed: '#D1D5DB',
    background: '#F9FAFB',
  },
};

export default DocumentUploadConfig;
