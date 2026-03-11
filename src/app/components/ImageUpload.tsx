import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';

interface ImageUploadProps {
  image: string | null;
  onImageChange: (image: string | null) => void;
}

export function ImageUpload({ image, onImageChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="space-y-4">
      {!image ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-500/5'
              : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-gray-300 font-medium mb-1">Upload Trade Screenshot</p>
              <p className="text-sm text-gray-500">
                Drag & drop or click to select your chart image
              </p>
            </div>
            <Button variant="outline" size="sm" className="pointer-events-none">
              <ImageIcon className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative group">
          <img
            src={image}
            alt="Trade screenshot"
            className="w-full h-64 object-cover rounded-xl border border-gray-700"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-900/90 border-gray-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Replace
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onImageChange(null)}
              className="bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
