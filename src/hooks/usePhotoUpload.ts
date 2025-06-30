/**
 * Hook personalizado para gerenciamento de upload de fotos
 * 
 * Fornece funcionalidades para:
 * - Upload de fotos de perfil
 * - Remoção de fotos
 * - Cache de imagens
 * - Estados de loading e erro
 * 
 * @author Serenus Platform
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { UserPhoto, PhotoUploadResult } from '../types';
import { imageCache } from '../utils/imageProcessing';

interface UsePhotoUploadOptions {
  userId: string;
  onSuccess?: (photo: UserPhoto) => void;
  onError?: (error: string) => void;
}

interface UsePhotoUploadReturn {
  isUploading: boolean;
  uploadPhoto: (photoData: PhotoUploadResult) => Promise<{ success: boolean; message: string }>;
  removePhoto: (photoId: string) => Promise<{ success: boolean; message: string }>;
  getUserPhoto: (userId: string) => Promise<UserPhoto | null>;
  getPhotoUrl: (photoId: string) => string;
  clearCache: () => void;
}

// Mock storage para demonstração (em produção, usar Supabase)
let mockUserPhotos: Record<string, UserPhoto> = {};

export const usePhotoUpload = (options: UsePhotoUploadOptions): UsePhotoUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Faz upload de uma nova foto
   */
  const uploadPhoto = useCallback(async (photoData: PhotoUploadResult): Promise<{ success: boolean; message: string }> => {
    if (!photoData.success || !photoData.photo) {
      return {
        success: false,
        message: photoData.message || 'Dados da foto inválidos'
      };
    }

    setIsUploading(true);

    try {
      // Simular tempo de upload
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Gerar ID único para a foto
      const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      // Desativar fotos anteriores do usuário
      Object.keys(mockUserPhotos).forEach(key => {
        if (mockUserPhotos[key].userId === options.userId) {
          mockUserPhotos[key].isActive = false;
          mockUserPhotos[key].updatedAt = new Date();
        }
      });

      // Criar nova foto
      const newPhoto: UserPhoto = {
        ...photoData.photo,
        id: photoId,
        userId: options.userId,
        isActive: true,
        uploadDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Salvar no mock storage
      mockUserPhotos[photoId] = newPhoto;

      // Adicionar ao cache
      const cacheKey = `photo_${photoId}`;
      const photoUrl = `data:${newPhoto.fileType};base64,${newPhoto.imageData}`;
      imageCache.set(cacheKey, photoUrl);

      console.log('✅ Foto de perfil salva com sucesso:', newPhoto);

      // Callback de sucesso
      if (options.onSuccess) {
        options.onSuccess(newPhoto);
      }

      return {
        success: true,
        message: 'Foto de perfil atualizada com sucesso!'
      };

    } catch (error) {
      console.error('❌ Erro ao fazer upload da foto:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro interno no upload';
      
      if (options.onError) {
        options.onError(errorMessage);
      }

      return {
        success: false,
        message: 'Erro ao fazer upload da foto. Tente novamente.'
      };
    } finally {
      setIsUploading(false);
    }
  }, [options]);

  /**
   * Remove uma foto
   */
  const removePhoto = useCallback(async (photoId: string): Promise<{ success: boolean; message: string }> => {
    setIsUploading(true);

    try {
      // Simular tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      const photo = mockUserPhotos[photoId];
      
      if (!photo) {
        return {
          success: false,
          message: 'Foto não encontrada'
        };
      }

      if (photo.userId !== options.userId) {
        return {
          success: false,
          message: 'Não autorizado a remover esta foto'
        };
      }

      // Remover do storage
      delete mockUserPhotos[photoId];

      // Remover do cache
      const cacheKey = `photo_${photoId}`;
      imageCache.set(cacheKey, ''); // Limpar cache

      console.log('✅ Foto removida com sucesso:', photoId);

      return {
        success: true,
        message: 'Foto removida com sucesso!'
      };

    } catch (error) {
      console.error('❌ Erro ao remover foto:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro interno';
      
      if (options.onError) {
        options.onError(errorMessage);
      }

      return {
        success: false,
        message: 'Erro ao remover foto. Tente novamente.'
      };
    } finally {
      setIsUploading(false);
    }
  }, [options]);

  /**
   * Busca a foto ativa de um usuário
   */
  const getUserPhoto = useCallback(async (userId: string): Promise<UserPhoto | null> => {
    try {
      // Simular busca no banco
      await new Promise(resolve => setTimeout(resolve, 300));

      const userPhotos = Object.values(mockUserPhotos).filter(
        photo => photo.userId === userId && photo.isActive
      );

      return userPhotos.length > 0 ? userPhotos[0] : null;

    } catch (error) {
      console.error('❌ Erro ao buscar foto do usuário:', error);
      return null;
    }
  }, []);

  /**
   * Gera URL para exibição da foto
   */
  const getPhotoUrl = useCallback((photoId: string): string => {
    // Verificar cache primeiro
    const cacheKey = `photo_${photoId}`;
    const cachedUrl = imageCache.get(cacheKey);
    
    if (cachedUrl) {
      return cachedUrl;
    }

    // Buscar no storage
    const photo = mockUserPhotos[photoId];
    if (photo) {
      const photoUrl = `data:${photo.fileType};base64,${photo.imageData}`;
      imageCache.set(cacheKey, photoUrl);
      return photoUrl;
    }

    // Retornar placeholder se não encontrado
    return 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400';
  }, []);

  /**
   * Limpa o cache de imagens
   */
  const clearCache = useCallback(() => {
    imageCache.clear();
  }, []);

  return {
    isUploading,
    uploadPhoto,
    removePhoto,
    getUserPhoto,
    getPhotoUrl,
    clearCache
  };
};