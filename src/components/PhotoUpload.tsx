import React, { useState, useRef, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Loader2, 
  Check, 
  AlertTriangle,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { 
  processImageFile, 
  createImagePreview, 
  DEFAULT_IMAGE_OPTIONS 
} from '../utils/imageProcessing';
import { PhotoUploadResult } from '../types';

interface PhotoUploadProps {
  currentPhotoUrl?: string;
  isUploading?: boolean;
  onUpload: (photoData: PhotoUploadResult) => Promise<{ success: boolean; message: string }>;
  onRemove?: () => Promise<{ success: boolean; message: string }>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  currentPhotoUrl,
  isUploading = false,
  onUpload,
  onRemove,
  className = '',
  size = 'md',
  disabled = false
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dimensões baseadas no tamanho
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-10 w-10'
  };

  /**
   * Processa o arquivo selecionado
   */
  const handleFileSelect = useCallback(async (file: File) => {
    if (disabled || isUploading || isProcessing) return;

    setIsProcessing(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      // Criar preview imediato
      const preview = await createImagePreview(file);
      setPreviewUrl(preview);

      // Processar imagem
      const result = await processImageFile(file, DEFAULT_IMAGE_OPTIONS);

      if (!result.success) {
        setUploadError(result.errors?.join(', ') || result.message);
        setPreviewUrl(null);
        return;
      }

      // Fazer upload
      const uploadResult = await onUpload(result);
      
      if (uploadResult.success) {
        setUploadSuccess(uploadResult.message);
        // Manter preview até a página recarregar
        setTimeout(() => {
          setUploadSuccess(null);
        }, 3000);
      } else {
        setUploadError(uploadResult.message);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Erro ao processar foto:', error);
      setUploadError('Erro interno ao processar a imagem');
      setPreviewUrl(null);
    } finally {
      setIsProcessing(false);
    }
  }, [disabled, isUploading, isProcessing, onUpload]);

  /**
   * Handler para input de arquivo
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Limpar input para permitir re-seleção do mesmo arquivo
    e.target.value = '';
  }, [handleFileSelect]);

  /**
   * Handlers para drag and drop
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled || isUploading || isProcessing) return;

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      setUploadError('Por favor, selecione apenas arquivos de imagem');
    }
  }, [disabled, isUploading, isProcessing, handleFileSelect]);

  /**
   * Abre seletor de arquivo
   */
  const openFileSelector = useCallback(() => {
    if (disabled || isUploading || isProcessing) return;
    fileInputRef.current?.click();
  }, [disabled, isUploading, isProcessing]);

  /**
   * Remove foto atual
   */
  const handleRemove = useCallback(async () => {
    if (!onRemove || disabled || isUploading || isProcessing) return;

    setIsProcessing(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const result = await onRemove();
      if (result.success) {
        setUploadSuccess('Foto removida com sucesso');
        setPreviewUrl(null);
        setTimeout(() => {
          setUploadSuccess(null);
        }, 3000);
      } else {
        setUploadError(result.message);
      }
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      setUploadError('Erro ao remover foto');
    } finally {
      setIsProcessing(false);
    }
  }, [onRemove, disabled, isUploading, isProcessing]);

  const isWorking = isUploading || isProcessing;
  const hasPhoto = currentPhotoUrl || previewUrl;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div className="flex flex-col items-center space-y-4">
        {/* Photo Display/Upload Button */}
        <div
          className={`
            relative ${sizeClasses[size]} rounded-full overflow-hidden border-2 transition-all duration-200 cursor-pointer
            ${dragOver 
              ? 'border-teal-500 bg-teal-50 scale-105' 
              : hasPhoto 
                ? 'border-gray-200 hover:border-gray-300' 
                : 'border-dashed border-gray-300 hover:border-teal-400 hover:bg-teal-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isWorking ? 'pointer-events-none' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileSelector}
        >
          {hasPhoto ? (
            <>
              <img
                src={previewUrl || currentPhotoUrl}
                alt="Foto do perfil"
                className="w-full h-full object-cover"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
                <Camera className={`${iconSizes[size]} text-white opacity-0 hover:opacity-100 transition-opacity duration-200`} />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              {isWorking ? (
                <Loader2 className={`${iconSizes[size]} animate-spin`} />
              ) : (
                <>
                  <ImageIcon className={iconSizes[size]} />
                  {size !== 'sm' && (
                    <span className="text-xs mt-1 text-center">Clique ou arraste</span>
                  )}
                </>
              )}
            </div>
          )}

          {/* Loading Overlay */}
          {isWorking && hasPhoto && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Loader2 className={`${iconSizes[size]} text-white animate-spin`} />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={openFileSelector}
            disabled={disabled || isWorking}
            className="flex items-center space-x-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Upload className="h-4 w-4" />
            <span>{hasPhoto ? 'Alterar' : 'Upload'}</span>
          </button>

          {hasPhoto && onRemove && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || isWorking}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span>Remover</span>
            </button>
          )}
        </div>
      </div>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isWorking}
      />

      {/* Info Text */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          JPG, JPEG ou PNG até 5MB<br />
          Redimensionado automaticamente para 400x400px
        </p>
      </div>

      {/* Success Message */}
      {uploadSuccess && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-800">{uploadSuccess}</span>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-800">{uploadError}</span>
          <button
            onClick={() => setUploadError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};