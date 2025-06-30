import React, { useState } from 'react';
import { Plus, X, Play, Edit3, Save, Loader2 } from 'lucide-react';
import { VideoContent, VideoProvider } from '../types';

interface VideoContentEditorProps {
  videos: VideoContent[];
  onChange: (videos: VideoContent[]) => void;
}

export const VideoContentEditor: React.FC<VideoContentEditorProps> = ({
  videos,
  onChange
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoContent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    provider: 'youtube' as VideoProvider,
    videoUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      provider: 'youtube',
      videoUrl: ''
    });
    setEditingVideo(null);
    setError('');
  };

  const extractVideoId = (url: string, provider: VideoProvider): string | null => {
    try {
      if (provider === 'youtube') {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
      } else if (provider === 'vimeo') {
        const regex = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
        const match = url.match(regex);
        return match ? match[1] : null;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const generateEmbedUrl = (videoId: string, provider: VideoProvider): string => {
    if (provider === 'youtube') {
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (provider === 'vimeo') {
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return '';
  };

  const generateThumbnailUrl = (videoId: string, provider: VideoProvider): string => {
    if (provider === 'youtube') {
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    } else if (provider === 'vimeo') {
      // For Vimeo, we would need to make an API call to get thumbnail
      return 'https://via.placeholder.com/320x180?text=Vimeo+Video';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      setIsLoading(false);
      return;
    }

    if (!formData.videoUrl.trim()) {
      setError('URL do vídeo é obrigatória');
      setIsLoading(false);
      return;
    }

    const videoId = extractVideoId(formData.videoUrl, formData.provider);
    if (!videoId) {
      setError('URL do vídeo inválida para o provedor selecionado');
      setIsLoading(false);
      return;
    }

    try {
      const newVideo: VideoContent = {
        id: editingVideo?.id || `video_${Date.now()}`,
        title: formData.title.trim(),
        description: formData.description.trim(),
        provider: formData.provider,
        videoId,
        embedUrl: generateEmbedUrl(videoId, formData.provider),
        thumbnailUrl: generateThumbnailUrl(videoId, formData.provider),
        order: editingVideo?.order || videos.length
      };

      if (editingVideo) {
        const updatedVideos = videos.map(v => v.id === editingVideo.id ? newVideo : v);
        onChange(updatedVideos);
      } else {
        onChange([...videos, newVideo]);
      }

      setShowAddForm(false);
      resetForm();
    } catch (err) {
      setError('Erro ao processar vídeo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (video: VideoContent) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      provider: video.provider,
      videoUrl: video.provider === 'youtube' 
        ? `https://www.youtube.com/watch?v=${video.videoId}`
        : `https://vimeo.com/${video.videoId}`
    });
    setShowAddForm(true);
  };

  const handleDelete = (videoId: string) => {
    const updatedVideos = videos.filter(v => v.id !== videoId);
    onChange(updatedVideos);
  };

  const openAddForm = () => {
    resetForm();
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Conteúdo em Vídeo</h3>
        <button
          onClick={openAddForm}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar Vídeo</span>
        </button>
      </div>

      {/* Video List */}
      <div className="space-y-4">
        {videos.map((video) => (
          <div key={video.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex space-x-4">
              <div className="flex-shrink-0">
                <div className="relative w-32 h-18 bg-gray-200 rounded overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/128x72?text=Video';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-6 w-6 text-white drop-shadow-lg" />
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{video.title}</h4>
                {video.description && (
                  <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                )}
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span className="capitalize">{video.provider}</span>
                  <span>•</span>
                  <span>ID: {video.videoId}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(video)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(video.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {videos.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum vídeo adicionado</h3>
            <p className="text-gray-600 mb-4">Comece adicionando vídeos do YouTube ou Vimeo</p>
            <button
              onClick={openAddForm}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Adicionar Primeiro Vídeo
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Video Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingVideo ? 'Editar Vídeo' : 'Adicionar Vídeo'}
              </h3>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provedor *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'youtube', label: 'YouTube' },
                    { value: 'vimeo', label: 'Vimeo' }
                  ].map((provider) => (
                    <div
                      key={provider.value}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        formData.provider === provider.value
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        provider: provider.value as VideoProvider 
                      }))}
                    >
                      <span className="text-sm font-medium">{provider.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  URL do Vídeo *
                </label>
                <input
                  id="videoUrl"
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder={formData.provider === 'youtube' 
                    ? 'https://www.youtube.com/watch?v=...' 
                    : 'https://vimeo.com/...'
                  }
                  required
                />
              </div>

              <div>
                <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  id="videoTitle"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Digite o título do vídeo"
                  required
                />
              </div>

              <div>
                <label htmlFor="videoDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  id="videoDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Descrição opcional do vídeo"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3" />
                      <span>{editingVideo ? 'Atualizar' : 'Adicionar'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};