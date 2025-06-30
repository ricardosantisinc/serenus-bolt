/**
 * API de Integração com Supabase para Fotos de Perfil
 * 
 * Este módulo seria responsável pela integração real com o Supabase
 * em ambiente de produção. Atualmente implementa mocks para demonstração.
 * 
 * @author Serenus Platform
 * @version 1.0.0
 */

import { UserPhoto, PhotoUploadResult } from '../types';

/**
 * Configuração da API de fotos
 */
export const PHOTO_API_CONFIG = {
  baseUrl: '/api/user-photos',
  maxRetries: 3,
  timeout: 30000, // 30 segundos
  chunkSize: 1024 * 1024, // 1MB chunks para upload
};

/**
 * Classe para gerenciamento de API de fotos
 */
export class PhotoApi {
  private static instance: PhotoApi;
  private cache = new Map<string, UserPhoto>();

  private constructor() {}

  /**
   * Singleton instance
   */
  public static getInstance(): PhotoApi {
    if (!PhotoApi.instance) {
      PhotoApi.instance = new PhotoApi();
    }
    return PhotoApi.instance;
  }

  /**
   * Faz upload de uma foto para o Supabase
   * @param userId - ID do usuário
   * @param photoData - Dados da foto processada
   * @returns Promise<UserPhoto>
   */
  async uploadPhoto(userId: string, photoData: PhotoUploadResult): Promise<UserPhoto> {
    try {
      if (!photoData.success || !photoData.photo) {
        throw new Error('Dados da foto inválidos');
      }

      console.log('🚀 Iniciando upload da foto para Supabase...');

      // Simular chamada para Supabase
      const response = await this.simulateSupabaseCall('POST', '/user-photos', {
        user_id: userId,
        image_data: photoData.photo.imageData,
        file_name: photoData.photo.fileName,
        file_type: photoData.photo.fileType,
        file_size: photoData.photo.fileSize,
        width: photoData.photo.width,
        height: photoData.photo.height,
        is_active: true
      });

      const photo: UserPhoto = {
        id: response.id,
        userId: response.user_id,
        imageData: response.image_data,
        fileName: response.file_name,
        fileType: response.file_type,
        fileSize: response.file_size,
        width: response.width,
        height: response.height,
        isActive: response.is_active,
        uploadDate: new Date(response.upload_date),
        createdAt: new Date(response.created_at),
        updatedAt: new Date(response.updated_at)
      };

      // Adicionar ao cache
      this.cache.set(photo.id, photo);

      console.log('✅ Upload concluído com sucesso:', photo.id);
      return photo;

    } catch (error) {
      console.error('❌ Erro no upload da foto:', error);
      throw new Error('Falha no upload da foto');
    }
  }

  /**
   * Remove uma foto do Supabase
   * @param photoId - ID da foto
   * @returns Promise<boolean>
   */
  async deletePhoto(photoId: string): Promise<boolean> {
    try {
      console.log('🗑️ Removendo foto do Supabase:', photoId);

      // Simular chamada para Supabase
      await this.simulateSupabaseCall('DELETE', `/user-photos/${photoId}`);

      // Remover do cache
      this.cache.delete(photoId);

      console.log('✅ Foto removida com sucesso');
      return true;

    } catch (error) {
      console.error('❌ Erro ao remover foto:', error);
      throw new Error('Falha ao remover foto');
    }
  }

  /**
   * Busca foto ativa de um usuário
   * @param userId - ID do usuário
   * @returns Promise<UserPhoto | null>
   */
  async getUserActivePhoto(userId: string): Promise<UserPhoto | null> {
    try {
      console.log('🔍 Buscando foto ativa do usuário:', userId);

      // Simular chamada para Supabase
      const response = await this.simulateSupabaseCall('GET', `/user-photos/user/${userId}/active`);

      if (!response) {
        return null;
      }

      const photo: UserPhoto = {
        id: response.id,
        userId: response.user_id,
        imageData: response.image_data,
        fileName: response.file_name,
        fileType: response.file_type,
        fileSize: response.file_size,
        width: response.width,
        height: response.height,
        isActive: response.is_active,
        uploadDate: new Date(response.upload_date),
        createdAt: new Date(response.created_at),
        updatedAt: new Date(response.updated_at)
      };

      // Adicionar ao cache
      this.cache.set(photo.id, photo);

      return photo;

    } catch (error) {
      console.error('❌ Erro ao buscar foto do usuário:', error);
      return null;
    }
  }

  /**
   * Busca uma foto específica
   * @param photoId - ID da foto
   * @returns Promise<UserPhoto | null>
   */
  async getPhoto(photoId: string): Promise<UserPhoto | null> {
    try {
      // Verificar cache primeiro
      const cached = this.cache.get(photoId);
      if (cached) {
        return cached;
      }

      console.log('🔍 Buscando foto:', photoId);

      // Simular chamada para Supabase
      const response = await this.simulateSupabaseCall('GET', `/user-photos/${photoId}`);

      if (!response) {
        return null;
      }

      const photo: UserPhoto = {
        id: response.id,
        userId: response.user_id,
        imageData: response.image_data,
        fileName: response.file_name,
        fileType: response.file_type,
        fileSize: response.file_size,
        width: response.width,
        height: response.height,
        isActive: response.is_active,
        uploadDate: new Date(response.upload_date),
        createdAt: new Date(response.created_at),
        updatedAt: new Date(response.updated_at)
      };

      // Adicionar ao cache
      this.cache.set(photo.id, photo);

      return photo;

    } catch (error) {
      console.error('❌ Erro ao buscar foto:', error);
      return null;
    }
  }

  /**
   * Gera URL pública para uma foto
   * @param photoId - ID da foto
   * @returns string - URL da foto
   */
  getPhotoUrl(photoId: string): string {
    // Em produção, retornaria a URL do Supabase Storage
    return `${PHOTO_API_CONFIG.baseUrl}/${photoId}`;
  }

  /**
   * Limpa o cache de fotos
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Simula chamadas para o Supabase (para demonstração)
   * Em produção, usaria o cliente do Supabase real
   */
  private async simulateSupabaseCall(method: string, endpoint: string, data?: any): Promise<any> {
    // Simular latência de rede
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    // Simular possíveis erros
    if (Math.random() < 0.05) { // 5% chance de erro
      throw new Error('Erro de rede simulado');
    }

    // Retornar dados simulados baseados no método
    switch (method) {
      case 'POST':
        return {
          id: `photo_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          user_id: data.user_id,
          image_data: data.image_data,
          file_name: data.file_name,
          file_type: data.file_type,
          file_size: data.file_size,
          width: data.width,
          height: data.height,
          is_active: data.is_active,
          upload_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

      case 'GET':
        if (endpoint.includes('/active')) {
          // Retornar null para simular que não há foto ativa
          return Math.random() > 0.5 ? null : {
            id: 'existing_photo_123',
            user_id: endpoint.split('/')[2],
            image_data: 'mock_base64_data',
            file_name: 'profile_photo.jpg',
            file_type: 'image/jpeg',
            file_size: 102400,
            width: 400,
            height: 400,
            is_active: true,
            upload_date: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString()
          };
        }
        return null;

      case 'DELETE':
        return { success: true };

      default:
        return null;
    }
  }
}

/**
 * Instância singleton da API de fotos
 */
export const photoApi = PhotoApi.getInstance();