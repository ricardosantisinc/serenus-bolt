import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Play, 
  FileText,
  Download,
  Clock,
  User,
  Calendar
} from 'lucide-react';
import { Course, Module, Lesson, ContentType } from '../types';

interface ContentViewerProps {
  course: Course;
  onClose: () => void;
}

export const ContentViewer: React.FC<ContentViewerProps> = ({
  course,
  onClose
}) => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(
    course.modules.length > 0 ? course.modules[0] : null
  );
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const getContentTypeIcon = (contentType: ContentType) => {
    switch (contentType) {
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'document':
        return <Download className="h-4 w-4" />;
      case 'mixed':
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const renderLessonContent = (lesson: Lesson) => {
    if (!lesson.content) return null;

    return (
      <div className="space-y-8">
        {/* Text Content */}
        {lesson.content.text && (
          <div className="prose prose-lg max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: lesson.content.text.content }}
              className="leading-relaxed"
            />
          </div>
        )}

        {/* Video Content */}
        {lesson.content.videos && lesson.content.videos.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Play className="h-5 w-5 mr-2" />
              Vídeos
            </h3>
            {lesson.content.videos.map((video) => (
              <div key={video.id} className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-2">{video.title}</h4>
                {video.description && (
                  <p className="text-sm text-gray-600 mb-4">{video.description}</p>
                )}
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Document Content */}
        {lesson.content.documents && lesson.content.documents.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Documentos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.content.documents.map((document) => (
                <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-red-600" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{document.title}</h4>
                      {document.description && (
                        <p className="text-sm text-gray-600">{document.description}</p>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {document.fileType.toUpperCase()} • {Math.round(document.fileSize / 1024)}KB
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = document.downloadUrl;
                        link.download = document.originalFileName;
                        link.click();
                      }}
                      className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600">{course.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-full overflow-hidden">
          {/* Sidebar - Course Structure */}
          <div className={`border-r border-gray-200 bg-gray-50 transition-all duration-300 ${
            sidebarCollapsed ? 'w-16' : 'w-80'
          }`}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {!sidebarCollapsed && (
                  <h2 className="font-semibold text-gray-900">Conteúdo do Curso</h2>
                )}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!sidebarCollapsed && (
              <div className="overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 80px)' }}>
                {course.modules.map((module) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setSelectedModule(selectedModule?.id === module.id ? null : module)}
                      className="w-full p-4 text-left bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">{module.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {module.lessons.length} aulas • {Math.round(module.estimatedDuration / 60)}h
                          </p>
                        </div>
                        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                          selectedModule?.id === module.id ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </button>

                    {selectedModule?.id === module.id && (
                      <div className="border-t border-gray-200">
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonSelect(lesson)}
                            className={`w-full p-3 text-left transition-colors ${
                              selectedLesson?.id === lesson.id
                                ? 'bg-teal-50 border-l-4 border-teal-500'
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              {getContentTypeIcon(lesson.contentType)}
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{lesson.title}</h4>
                                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{lesson.estimatedDuration}min</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {course.modules.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum módulo disponível</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            {selectedLesson ? (
              <div className="p-8">
                {/* Lesson Header */}
                <div className="mb-8">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <span>{selectedModule?.title}</span>
                    <ChevronRight className="h-4 w-4" />
                    <span>{selectedLesson.title}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedLesson.title}</h1>
                  <p className="text-lg text-gray-600 mb-4">{selectedLesson.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{selectedLesson.estimatedDuration} minutos</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getContentTypeIcon(selectedLesson.contentType)}
                      <span className="capitalize">{selectedLesson.contentType}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{selectedLesson.createdAt.toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                {/* Lesson Content */}
                {renderLessonContent(selectedLesson)}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Selecione uma aula</h2>
                  <p className="text-gray-600">
                    Escolha uma aula no menu lateral para começar a estudar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};