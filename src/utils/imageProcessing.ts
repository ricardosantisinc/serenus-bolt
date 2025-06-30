/**
 * Sistema de Processamento Seguro de Imagens
 * 
 * Este módulo fornece funcionalidades para:
 * - Validação segura de arquivos de imagem
 * - Redimensionamento automático mantendo aspect ratio
 * - Compressão de imagens para otimização
 * - Sanitização de nomes de arquivo
 * - Verificação de tipo MIME
 * 
 * @author Serenus Platform
 * @version 1.0.0
 */

import { ImageProcessingOptions, PhotoUploadResult } from '../types';

// Configurações padrão para processamento de imagens
export const DEFAULT_IMAGE_OPTIONS: ImageProcessingOptions = {
  maxWidth: 400,
  maxHeight: 400,
  quality: 0.8,
  format: 'image/jpeg'
};

// Tipos MIME permitidos
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png'
];

// Tamanho máximo do arquivo (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Valida se o arquivo é uma imagem válida
 * @param file - Arquivo a ser validado
 * @returns Promise<boolean> - True se válido, false caso contrário
 */
export const validateImageFile = async (file: File): Promise<{ valid: boolean; errors: string[] }> => {
  const errors: string[] = [];

  // Verificar se é um arquivo
  if (!file) {
    errors.push('Nenhum arquivo selecionado');
    return { valid: false, errors };
  }

  // Verificar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    errors.push('Tipo de arquivo não permitido. Use apenas JPG, JPEG ou PNG');
  }

  // Verificar tamanho
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(1);
    errors.push(`Arquivo muito grande. Tamanho máximo: ${sizeMB}MB`);
  }

  // Verificar se realmente é uma imagem (magic number check)
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    if (!isValidImageHeader(uint8Array)) {
      errors.push('Arquivo corrompido ou não é uma imagem válida');
    }
  } catch (error) {
    errors.push('Erro ao verificar a integridade do arquivo');
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Verifica os magic numbers do arquivo para confirmar que é uma imagem
 * @param buffer - Buffer do arquivo
 * @returns boolean - True se for uma imagem válida
 */
const isValidImageHeader = (buffer: Uint8Array): boolean => {
  if (buffer.length < 4) return false;

  // JPEG magic numbers
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return true;
  }

  // PNG magic numbers
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return true;
  }

  return false;
};

/**
 * Sanitiza o nome do arquivo removendo caracteres perigosos
 * @param fileName - Nome original do arquivo
 * @returns string - Nome sanitizado
 */
export const sanitizeFileName = (fileName: string): string => {
  // Remove path traversal attempts
  let sanitized = fileName.replace(/[\/\\:*?"<>|]/g, '');
  
  // Remove multiple dots
  sanitized = sanitized.replace(/\.+/g, '.');
  
  // Ensure it doesn't start with a dot or dash
  sanitized = sanitized.replace(/^[.-]/, '');
  
  // Limit length
  if (sanitized.length > 100) {
    const ext = sanitized.split('.').pop();
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = nameWithoutExt.substring(0, 96 - (ext?.length || 0)) + '.' + ext;
  }
  
  // Generate unique name to prevent conflicts
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const ext = sanitized.split('.').pop();
  const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
  
  return `${nameWithoutExt}_${timestamp}_${randomSuffix}.${ext}`;
};

/**
 * Redimensiona uma imagem mantendo o aspect ratio
 * @param file - Arquivo de imagem
 * @param options - Opções de processamento
 * @returns Promise<Blob> - Imagem processada
 */
export const resizeAndCompressImage = async (
  file: File, 
  options: ImageProcessingOptions = DEFAULT_IMAGE_OPTIONS
): Promise<{ blob: Blob; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Não foi possível criar contexto do canvas'));
      return;
    }

    img.onload = () => {
      try {
        // Calcular novas dimensões mantendo aspect ratio
        const { width: newWidth, height: newHeight } = calculateDimensions(
          img.width,
          img.height,
          options.maxWidth,
          options.maxHeight
        );

        // Configurar canvas
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Aplicar configurações de qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Converter para blob com compressão
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ 
                blob, 
                width: newWidth, 
                height: newHeight 
              });
            } else {
              reject(new Error('Erro ao processar imagem'));
            }
          },
          options.format,
          options.quality
        );
      } catch (error) {
        reject(new Error('Erro ao redimensionar imagem'));
      }
    };

    img.onerror = () => {
      reject(new Error('Erro ao carregar imagem'));
    };

    // Carregar imagem
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Calcula as novas dimensões mantendo o aspect ratio
 * @param originalWidth - Largura original
 * @param originalHeight - Altura original
 * @param maxWidth - Largura máxima
 * @param maxHeight - Altura máxima
 * @returns Novas dimensões
 */
const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  let { width, height } = { width: originalWidth, height: originalHeight };

  // Se a imagem já está dentro dos limites, não redimensionar
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // Calcular ratios
  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(widthRatio, heightRatio);

  // Aplicar ratio mantendo proporção
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  return { width, height };
};

/**
 * Converte Blob para Base64
 * @param blob - Blob da imagem
 * @returns Promise<string> - String Base64
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove o prefixo data:image/...;base64,
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Erro ao converter para Base64'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler blob'));
    reader.readAsDataURL(blob);
  });
};

/**
 * Converte Base64 para Blob
 * @param base64 - String Base64
 * @param mimeType - Tipo MIME da imagem
 * @returns Blob
 */
export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

/**
 * Processa completamente um arquivo de imagem
 * @param file - Arquivo de imagem
 * @param options - Opções de processamento
 * @returns Promise<PhotoUploadResult> - Resultado do processamento
 */
export const processImageFile = async (
  file: File,
  options: ImageProcessingOptions = DEFAULT_IMAGE_OPTIONS
): Promise<PhotoUploadResult> => {
  try {
    // Validar arquivo
    const validation = await validateImageFile(file);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Arquivo inválido',
        errors: validation.errors
      };
    }

    // Redimensionar e comprimir
    const { blob, width, height } = await resizeAndCompressImage(file, options);

    // Converter para Base64
    const base64Data = await blobToBase64(blob);

    // Sanitizar nome do arquivo
    const sanitizedFileName = sanitizeFileName(file.name);

    // Preparar resultado
    const result: PhotoUploadResult = {
      success: true,
      message: 'Imagem processada com sucesso',
      photo: {
        id: '', // Será preenchido pelo backend
        userId: '', // Será preenchido pelo backend
        imageData: base64Data,
        fileName: sanitizedFileName,
        fileType: options.format,
        fileSize: blob.size,
        width,
        height,
        isActive: true,
        uploadDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    return result;
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao processar imagem',
      errors: [error instanceof Error ? error.message : 'Erro desconhecido']
    };
  }
};

/**
 * Cria uma URL temporária para preview da imagem
 * @param file - Arquivo de imagem
 * @returns Promise<string> - URL para preview
 */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Erro ao criar preview'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
};

/**
 * Cache de imagens para melhor performance
 */
class ImageCache {
  private cache = new Map<string, string>();
  private maxSize = 50; // Máximo de 50 imagens em cache

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: string): void {
    if (this.cache.size >= this.maxSize) {
      // Remove o primeiro item (FIFO)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const imageCache = new ImageCache();