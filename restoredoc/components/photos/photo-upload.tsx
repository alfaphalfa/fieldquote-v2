'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PhotoFile {
  id: string;
  file: File;
  preview: string;
  base64?: string;
}

interface PhotoUploadProps {
  onPhotosChange: (photos: PhotoFile[]) => void;
  maxPhotos?: number;
}

export function PhotoUpload({ onPhotosChange, maxPhotos = 10 }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    );

    const newPhotos = await Promise.all(
      validFiles.slice(0, maxPhotos - photos.length).map(async (file) => {
        const id = Math.random().toString(36).substr(2, 9);
        const preview = URL.createObjectURL(file);
        
        // Convert to base64 for API
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
          };
          reader.readAsDataURL(file);
        });

        return { id, file, preview, base64 };
      })
    );

    const updatedPhotos = [...photos, ...newPhotos];
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);
    setIsProcessing(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [photos, maxPhotos]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removePhoto = (id: string) => {
    const updatedPhotos = photos.filter(p => p.id !== id);
    
    // Revoke object URL to prevent memory leaks
    const photo = photos.find(p => p.id === id);
    if (photo) {
      URL.revokeObjectURL(photo.preview);
    }
    
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${photos.length >= maxPhotos ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="photo-upload"
          disabled={photos.length >= maxPhotos || isProcessing}
        />
        
        <label 
          htmlFor="photo-upload" 
          className={photos.length >= maxPhotos ? 'cursor-not-allowed' : 'cursor-pointer'}
        >
          <div className="flex flex-col items-center justify-center">
            {isProcessing ? (
              <>
                <Loader2 className="w-12 h-12 text-gray-400 mb-3 animate-spin" />
                <p className="text-gray-600">Processing photos...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-600 mb-1">
                  Drag & drop photos here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  {photos.length}/{maxPhotos} photos • Max 10MB per photo
                </p>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={photo.preview}
                  alt="Damage photo"
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay with file info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs">
                    <p className="truncate">{photo.file.name}</p>
                    <p>{(photo.file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
                
                {/* Remove button */}
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Photo count and status */}
      {photos.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            <span>{photos.length} photo{photos.length !== 1 ? 's' : ''} selected</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              photos.forEach(p => URL.revokeObjectURL(p.preview));
              setPhotos([]);
              onPhotosChange([]);
            }}
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}