import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, X, Edit3, Eye, Trash2, Search, Filter, GraduationCap, Play, FileText, Video, Upload, ChevronRight, ChevronDown, CircleDot as DragHandleDots2, Settings, Globe, Archive, Clock, Tag, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Course, Module, Lesson, PublicationStatus, ContentType, User, CourseTreeNode } from '../types';
import { CourseEditor } from './CourseEditor';
import { ModuleEditor } from './ModuleEditor';
import { LessonEditor } from './LessonEditor';
import { ContentViewer } from './ContentViewer';
import { useEducationalPrograms } from '../hooks/useEducationalPrograms';

interface EducationalProgramsProps {
  currentUser: User;
  onClose: () => void;
}

export const EducationalPrograms: React.FC<EducationalProgramsProps> = ({
  currentUser,
  onClose
}) => {
  const [activeView, setActiveView] = useState<'tree' | 'grid'>('grid');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showEditor, setShowEditor] = useState<{
    type: 'course' | 'module' | 'lesson' | null;
    mode: 'create' | 'edit';
    item?: Course | Module | Lesson;
  }>({ type: null, mode: 'create' });
  const [showViewer, setShowViewer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PublicationStatus | 'all'>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | 'all'>('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    type: 'course' | 'module' | 'lesson';
    id: string;
    title: string;
  } | null>(null);

  const {
    courses,
    isLoading,
    createCourse,
    updateCourse,
    deleteCourse,
    createModule,
    updateModule,
    deleteModule,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderContent,
    getStats,
    getCourseTree
  } = useEducationalPrograms({
    currentUser,
    onError: (error) => {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  });

  const stats = getStats();
  const courseTree = getCourseTree();

  // Limpar mensagens após um tempo
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Check if user has admin permissions
  const canManageContent = currentUser.role === 'super_admin';

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle node expansion in tree view
  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Handle delete course
  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    setShowDeleteConfirm({
      type: 'course',
      id: courseId,
      title: courseTitle
    });
  };

  // Handle delete module
  const handleDeleteModule = async (moduleId: string, moduleTitle: string) => {
    setShowDeleteConfirm({
      type: 'module',
      id: moduleId,
      title: moduleTitle
    });
  };

  // Handle delete lesson
  const handleDeleteLesson = async (lessonId: string, lessonTitle: string) => {
    setShowDeleteConfirm({
      type: 'lesson',
      id: lessonId,
      title: lessonTitle
    });
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;

    try {
      let success = false;
      
      switch (showDeleteConfirm.type) {
        case 'course':
          success = await deleteCourse(showDeleteConfirm.id);
          break;
        case 'module':
          success = await deleteModule(showDeleteConfirm.id);
          break;
        case 'lesson':
          success = await deleteLesson(showDeleteConfirm.id);
          break;
      }

      if (success) {
        const itemType = 
          showDeleteConfirm.type === 'course' ? 'Curso' :
          showDeleteConfirm.type === 'module' ? 'Módulo' : 'Aula';
        
        setSuccessMessage(`${itemType} "${showDeleteConfirm.title}" excluído com sucesso`);
      } else {
        setErrorMessage(`Erro ao excluir ${showDeleteConfirm.type}`);
      }
    } catch (error) {
      setErrorMessage(`Erro ao excluir: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  // Get status badge style
  const getStatusBadge = (status: PublicationStatus) => {
    const styles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      published: 'Publicado',
      draft: 'Rascunho',
      archived: 'Arquivado'
    };
    
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Get content type icon
  const getContentTypeIcon = (contentType: ContentType) => {
    const icons = {
      text: FileText,
      video: Video,
      document: Upload,
      mixed: BookOpen
    };
    const Icon = icons[contentType];
    return <Icon className="h-4 w-4" />;
  };

  // Render tree node
  const renderTreeNode = (node: CourseTreeNode, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.id} className="w-full">
        <div 
          className={`flex items-center py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors ${
            level > 0 ? 'ml-' + (level * 4) : ''
          } group`}
          style={{ marginLeft: `${level * 16}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.id)}
              className="mr-2 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6 mr-2" />
          )}
          
          <div className="flex items-center space-x-2 flex-1">
            {node.type === 'course' && <GraduationCap className="h-4 w-4 text-blue-600" />}
            {node.type === 'module' && <BookOpen className="h-4 w-4 text-green-600" />}
            {node.type === 'lesson' && getContentTypeIcon('mixed')}
            
            <span className="text-sm font-medium text-gray-900">{node.title}</span>
            {getStatusBadge(node.status)}
            
            {node.estimatedDuration && (
              <span className="text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {Math.round(node.estimatedDuration / 60)}h
              </span>
            )}
          </div>

          {canManageContent && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  if (node.type === 'course') {
                    const course = courses.find(c => c.id === node.id);
                    if (course) {
                      setShowEditor({ type: 'course', mode: 'edit', item: course });
                    }
                  } else if (node.type === 'module') {
                    // Encontrar o módulo
                    let foundModule: Module | null = null;
                    for (const course of courses) {
                      const module = course.modules.find(m => m.id === node.id);
                      if (module) {
                        foundModule = module;
                        setSelectedCourse(course);
                        break;
                      }
                    }
                    if (foundModule) {
                      setShowEditor({ type: 'module', mode: 'edit', item: foundModule });
                    }
                  } else if (node.type === 'lesson') {
                    // Encontrar a aula
                    let foundLesson: Lesson | null = null;
                    let parentModule: Module | null = null;
                    for (const course of courses) {
                      for (const module of course.modules) {
                        const lesson = module.lessons.find(l => l.id === node.id);
                        if (lesson) {
                          foundLesson = lesson;
                          parentModule = module;
                          setSelectedModule(module);
                          break;
                        }
                      }
                      if (foundLesson) break;
                    }
                    if (foundLesson) {
                      setShowEditor({ type: 'lesson', mode: 'edit', item: foundLesson });
                    }
                  }
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <Edit3 className="h-3 w-3" />
              </button>
              <button 
                onClick={() => {
                  if (node.type === 'course') {
                    const course = courses.find(c => c.id === node.id);
                    if (course) {
                      setSelectedCourse(course);
                      setShowViewer(true);
                    }
                  }
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <Eye className="h-3 w-3" />
              </button>
              <button
                onClick={() => {
                  if (node.type === 'course') {
                    const course = courses.find(c => c.id === node.id);
                    if (course) {
                      handleDeleteCourse(course.id, course.title);
                    }
                  } else if (node.type === 'module') {
                    handleDeleteModule(node.id, node.title);
                  } else if (node.type === 'lesson') {
                    handleDeleteLesson(node.id, node.title);
                  }
                }}
                className="text-gray-400 hover:text-red-600 p-1"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div>
            {node.children!.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-6 w-6 text-teal-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Programas Educacionais</h2>
              <p className="text-sm text-gray-600">Gerencie cursos, módulos e aulas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Success/Error Messages */}
        {(successMessage || errorMessage) && (
          <div className="px-6 py-3">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">{successMessage}</div>
                <button 
                  onClick={() => setSuccessMessage(null)}
                  className="text-green-500 hover:text-green-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
                <button 
                  onClick={() => setErrorMessage(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar with Stats and Filters */}
          <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto bg-gray-50">
            {/* Stats Cards */}
            <div className="space-y-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Cursos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Conteúdo Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalLessons}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {Math.round(stats.totalEstimatedHours)}h de conteúdo
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Publicados</p>
                    <p className="text-2xl font-bold text-green-600">{stats.publishedCourses}</p>
                  </div>
                  <Globe className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar cursos..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PublicationStatus | 'all')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                >
                  <option value="all">Todos os Status</option>
                  <option value="published">Publicados</option>
                  <option value="draft">Rascunhos</option>
                  <option value="archived">Arquivados</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visualização
                </label>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => setActiveView('grid')}
                    className={`flex-1 px-3 py-2 text-sm ${
                      activeView === 'grid' 
                        ? 'bg-teal-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Grade
                  </button>
                  <button
                    onClick={() => setActiveView('tree')}
                    className={`flex-1 px-3 py-2 text-sm ${
                      activeView === 'tree' 
                        ? 'bg-teal-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Árvore
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Action Bar */}
            {canManageContent && (
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {activeView === 'tree' ? 'Estrutura Hierárquica' : 'Lista de Cursos'}
                  </h3>
                  <button
                    onClick={() => setShowEditor({ type: 'course', mode: 'create' })}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Novo Curso</span>
                  </button>
                </div>
              </div>
            )}

            {/* Content Display */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeView === 'tree' ? (
                // Tree View
                <div className="space-y-2">
                  {courseTree.map(node => renderTreeNode(node))}
                  {courseTree.length === 0 && (
                    <div className="text-center py-12">
                      <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum curso encontrado</h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Tente ajustar os filtros de busca'
                          : 'Comece criando seu primeiro curso'
                        }
                      </p>
                      {canManageContent && !searchTerm && statusFilter === 'all' && (
                        <button
                          onClick={() => setShowEditor({ type: 'course', mode: 'create' })}
                          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          Criar Primeiro Curso
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-3">{course.description}</p>
                        </div>
                        {getStatusBadge(course.status)}
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-3 w-3" />
                          <span>{course.modules.length} módulos</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Play className="h-3 w-3" />
                          <span>{course.totalLessons} aulas</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{Math.round(course.estimatedDuration / 60)}h</span>
                        </div>
                      </div>

                      {course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {course.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {course.tags.length > 3 && (
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{course.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowViewer(true);
                            }}
                            className="text-teal-600 hover:text-teal-800 transition-colors flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Visualizar</span>
                          </button>
                        </div>

                        {canManageContent && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setShowEditor({ type: 'course', mode: 'edit', item: course })}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="Editar curso"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id, course.title)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Excluir curso"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Ações de Módulos */}
                      {canManageContent && course.modules.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">Módulos</span>
                            <button
                              onClick={() => {
                                setSelectedCourse(course);
                                setShowEditor({ type: 'module', mode: 'create' });
                              }}
                              className="text-teal-600 hover:text-teal-800 text-xs flex items-center space-x-1"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Adicionar Módulo</span>
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {canManageContent && course.modules.length === 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowEditor({ type: 'module', mode: 'create' });
                            }}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm"
                          >
                            <span className="flex items-center justify-center space-x-1">
                              <Plus className="h-3 w-3" />
                              <span>Adicionar Primeiro Módulo</span>
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredCourses.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum curso encontrado</h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Tente ajustar os filtros de busca'
                          : 'Comece criando seu primeiro curso'
                        }
                      </p>
                      {canManageContent && !searchTerm && statusFilter === 'all' && (
                        <button
                          onClick={() => setShowEditor({ type: 'course', mode: 'create' })}
                          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          Criar Primeiro Curso
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Delete */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-60 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h3>
                <p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            
            <p className="mb-4 text-gray-700">
              Tem certeza que deseja excluir{' '}
              <span className="font-medium">
                {showDeleteConfirm.type === 'course' ? 'o curso' :
                 showDeleteConfirm.type === 'module' ? 'o módulo' : 'a aula'}{' '}
                "{showDeleteConfirm.title}"
              </span>?
            </p>

            <div className="flex items-center space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editors */}
      {showEditor.type === 'course' && (
        <CourseEditor
          mode={showEditor.mode}
          course={showEditor.item as Course}
          onSave={async (courseData) => {
            try {
              if (showEditor.mode === 'create') {
                const newCourse = await createCourse(courseData);
                setSuccessMessage(`Curso "${newCourse.title}" criado com sucesso`);
              } else {
                const updatedCourse = await updateCourse((showEditor.item as Course).id, courseData);
                setSuccessMessage(`Curso "${updatedCourse.title}" atualizado com sucesso`);
              }
              setShowEditor({ type: null, mode: 'create' });
            } catch (error) {
              setErrorMessage(`Erro ao ${showEditor.mode === 'create' ? 'criar' : 'atualizar'} curso`);
            }
          }}
          onClose={() => setShowEditor({ type: null, mode: 'create' })}
        />
      )}

      {showEditor.type === 'module' && (
        <ModuleEditor
          mode={showEditor.mode}
          module={showEditor.item as Module}
          courseId={selectedCourse?.id || ''}
          onSave={async (moduleData) => {
            try {
              if (showEditor.mode === 'create' && selectedCourse) {
                const newModule = await createModule(selectedCourse.id, moduleData);
                setSuccessMessage(`Módulo "${newModule.title}" criado com sucesso`);
              } else if (showEditor.item) {
                const updatedModule = await updateModule((showEditor.item as Module).id, moduleData);
                setSuccessMessage(`Módulo "${updatedModule.title}" atualizado com sucesso`);
              }
              setShowEditor({ type: null, mode: 'create' });
            } catch (error) {
              setErrorMessage(`Erro ao ${showEditor.mode === 'create' ? 'criar' : 'atualizar'} módulo`);
            }
          }}
          onClose={() => setShowEditor({ type: null, mode: 'create' })}
        />
      )}

      {showEditor.type === 'lesson' && (
        <LessonEditor
          mode={showEditor.mode}
          lesson={showEditor.item as Lesson}
          moduleId={selectedModule?.id || ''}
          onSave={async (lessonData) => {
            try {
              if (showEditor.mode === 'create' && selectedModule) {
                const newLesson = await createLesson(selectedModule.id, lessonData);
                setSuccessMessage(`Aula "${newLesson.title}" criada com sucesso`);
              } else if (showEditor.item) {
                const updatedLesson = await updateLesson((showEditor.item as Lesson).id, lessonData);
                setSuccessMessage(`Aula "${updatedLesson.title}" atualizada com sucesso`);
              }
              setShowEditor({ type: null, mode: 'create' });
            } catch (error) {
              setErrorMessage(`Erro ao ${showEditor.mode === 'create' ? 'criar' : 'atualizar'} aula`);
            }
          }}
          onClose={() => setShowEditor({ type: null, mode: 'create' })}
        />
      )}

      {/* Content Viewer */}
      {showViewer && selectedCourse && (
        <ContentViewer
          course={selectedCourse}
          onClose={() => {
            setShowViewer(false);
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
};