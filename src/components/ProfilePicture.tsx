import { useState, useRef } from 'react';
import { User, Upload } from 'lucide-react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ProfilePictureProps {
  url?: string;
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  onUpdate?: (url: string) => void;
  editable?: boolean;
}

export const ProfilePicture = ({
  url,
  userId,
  size = 'md',
  onUpdate,
  editable = false
}: ProfilePictureProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      // Create a reference to the storage location
      const imageRef = ref(storage, `avatars/${userId}`);

      // Upload the file
      await uploadBytes(imageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(imageRef);

      // Call the onUpdate callback with the new URL
      if (onUpdate) {
        onUpdate(downloadURL);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {url ? (
        <img
          src={url}
          alt="Profile"
          className={`${sizeClasses[size]} rounded-full object-cover ${
            editable ? 'cursor-pointer' : ''
          }`}
          onClick={() => editable && fileInputRef.current?.click()}
        />
      ) : (
        <div
          className={`${
            sizeClasses[size]
          } rounded-full bg-gray-200 flex items-center justify-center ${
            editable ? 'cursor-pointer' : ''
          }`}
          onClick={() => editable && fileInputRef.current?.click()}
        >
          <User
            className={`${
              size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-8 w-8' : 'h-12 w-12'
            } text-gray-400`}
          />
        </div>
      )}

      {editable && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <div
            className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 text-gray-600" />
          </div>
        </>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white"></div>
        </div>
      )}

      {error && (
        <div className="absolute -bottom-6 left-0 right-0 text-center text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};