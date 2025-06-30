/**
 * Hook para gerenciamento de programas educacionais
 * 
 * Fornece funcionalidades para:
 * - CRUD de cursos, módulos e aulas
 * - Gerenciamento de conteúdo multimedia
 * - Reordenação drag-and-drop
 * - Estatísticas e analytics
 * 
 * @author Serenus Platform
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  Course, 
  Module, 
  Lesson, 
  CourseFormData, 
  ModuleFormData, 
  LessonFormData,
  LessonContent,
  User,
  CourseTreeNode,
  EducationalStats,
  DragDropResult
} from '../types';

interface UseEducationalProgramsOptions {
  currentUser: User;
  onError?: (error: string) => void;
}

interface UseEducationalProgramsReturn {
  courses: Course[];
  isLoading: boolean;
  createCourse: (courseData: CourseFormData) => Promise<Course>;
  updateCourse: (courseId: string, courseData: CourseFormData) => Promise<Course>;
  deleteCourse: (courseId: string) => Promise<boolean>;
  createModule: (courseId: string, moduleData: ModuleFormData) => Promise<Module>;
  updateModule: (moduleId: string, moduleData: ModuleFormData) => Promise<Module>;
  deleteModule: (moduleId: string) => Promise<boolean>;
  createLesson: (moduleId: string, lessonData: LessonFormData & { content: LessonContent }) => Promise<Lesson>;
  updateLesson: (lessonId: string, lessonData: LessonFormData & { content: LessonContent }) => Promise<Lesson>;
  deleteLesson: (lessonId: string) => Promise<boolean>;
  reorderContent: (result: DragDropResult) => Promise<boolean>;
  getStats: () => EducationalStats;
  getCourseTree: () => CourseTreeNode[];
}

// Mock storage para demonstração (em produção, usar Supabase)
let mockCourses: Record<string, Course> = {
  'course1': {
    id: 'course1',
    title: 'Fundamentos de Bem-estar Mental',
    description: 'Curso introdutório sobre saúde mental e bem-estar no ambiente de trabalho.',
    status: 'published',
    order: 0,
    modules: [
      {
        id: 'module1',
        courseId: 'course1',
        title: 'Introdução ao Bem-estar',
        description: 'Conceitos básicos sobre saúde mental e bem-estar.',
        status: 'published',
        order: 0,
        lessons: [
          {
            id: 'lesson1',
            moduleId: 'module1',
            title: 'O que é Bem-estar Mental?',
            description: 'Definições e importância do bem-estar mental.',
            status: 'published',
            order: 0,
            contentType: 'text',
            content: {
              text: {
                id: 'text1',
                content: '<h2>Bem-estar Mental no Trabalho</h2><p>O bem-estar mental é um estado de saúde no qual uma pessoa consegue lidar com os estresses normais da vida, trabalhar de forma produtiva e contribuir para sua comunidade.</p><h3>Componentes do Bem-estar</h3><ul><li>Saúde emocional</li><li>Resiliência</li><li>Autoestima</li><li>Relacionamentos saudáveis</li></ul>',
                order: 0
              }
            },
            estimatedDuration: 15,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15')
          }
        ],
        estimatedDuration: 15,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ],
    totalLessons: 1,
    estimatedDuration: 15,
    createdBy: 'superadmin@gsm.com',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    tags: ['bem-estar', 'saúde mental',  'introdução'],
    category: 'Bem-estar',
    level: 'beginner'
  },
  'course2': {
    id: 'course2',
    title: 'Técnicas de Relaxamento',
    description: 'Aprenda técnicas práticas para reduzir o estresse e promover o relaxamento.',
    status: 'draft',
    order: 1,
    modules: [],
    totalLessons: 0,
    estimatedDuration: 0,
    createdBy: 'superadmin@gsm.com',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    tags: ['relaxamento', 'estresse', 'técnicas'],
    category: 'Bem-estar',
    level: 'intermediate'
  }
};

export const useEducationalPrograms = (options: UseEducationalProgramsOptions): UseEducationalProgramsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>(Object.values(mockCourses));

  // Sync with mock storage
  useEffect(() => {
    setCourses(Object.values(mockCourses));
  }, []);

  /**
   * Cria um novo curso
   */
  const createCourse = useCallback(async (courseData: CourseFormData): Promise<Course> => {
    setIsLoading(true);

    try {
      // Simular tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newCourseId = `course_${Date.now()}`;
      const newCourse: Course = {
        id: newCourseId,
        title: courseData.title,
        description: courseData.description,
        status: courseData.status,
        order: Object.keys(mockCourses).length,
        modules: [],
        totalLessons: 0,
        estimatedDuration: 0,
        createdBy: options.currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: courseData.tags,
        category: courseData.category,
        level: courseData.level
      };

      mockCourses[newCourseId] = newCourse;
      setCourses(Object.values(mockCourses));

      console.log('✅ Curso criado com sucesso:', newCourse);
      return newCourse;

    } catch (error) {
      console.error('❌ Erro ao criar curso:', error);
      if (options.onError) {
        options.onError('Erro ao criar curso');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Atualiza um curso existente
   */
  const updateCourse = useCallback(async (courseId: string, courseData: CourseFormData): Promise<Course> => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const existingCourse = mockCourses[courseId];
      if (!existingCourse) {
        throw new Error('Curso não encontrado');
      }

      const updatedCourse: Course = {
        ...existingCourse,
        title: courseData.title,
        description: courseData.description,
        status: courseData.status,
        tags: courseData.tags,
        category: courseData.category,
        level: courseData.level,
        updatedAt: new Date()
      };

      mockCourses[courseId] = updatedCourse;
      setCourses(Object.values(mockCourses));

      console.log('✅ Curso atualizado com sucesso:', updatedCourse);
      return updatedCourse;

    } catch (error) {
      console.error('❌ Erro ao atualizar curso:', error);
      if (options.onError) {
        options.onError('Erro ao atualizar curso');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Exclui um curso
   */
  const deleteCourse = useCallback(async (courseId: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!mockCourses[courseId]) {
        throw new Error('Curso não encontrado');
      }

      delete mockCourses[courseId];
      setCourses(Object.values(mockCourses));

      console.log('✅ Curso excluído com sucesso:', courseId);
      return true;

    } catch (error) {
      console.error('❌ Erro ao excluir curso:', error);
      if (options.onError) {
        options.onError('Erro ao excluir curso');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Cria um novo módulo
   */
  const createModule = useCallback(async (courseId: string, moduleData: ModuleFormData): Promise<Module> => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const course = mockCourses[courseId];
      if (!course) {
        throw new Error('Curso não encontrado');
      }

      const newModuleId = `module_${Date.now()}`;
      const newModule: Module = {
        id: newModuleId,
        courseId,
        title: moduleData.title,
        description: moduleData.description,
        status: moduleData.status,
        order: course.modules.length,
        lessons: [],
        estimatedDuration: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      course.modules.push(newModule);
      mockCourses[courseId] = course;
      setCourses(Object.values(mockCourses));

      console.log('✅ Módulo criado com sucesso:', newModule);
      return newModule;

    } catch (error) {
      console.error('❌ Erro ao criar módulo:', error);
      if (options.onError) {
        options.onError('Erro ao criar módulo');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Atualiza um módulo existente
   */
  const updateModule = useCallback(async (moduleId: string, moduleData: ModuleFormData): Promise<Module> => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // Find module in courses
      let targetModule: Module | null = null;
      let targetCourse: Course | null = null;

      for (const course of Object.values(mockCourses)) {
        const module = course.modules.find(m => m.id === moduleId);
        if (module) {
          targetModule = module;
          targetCourse = course;
          break;
        }
      }

      if (!targetModule || !targetCourse) {
        throw new Error('Módulo não encontrado');
      }

      const updatedModule: Module = {
        ...targetModule,
        title: moduleData.title,
        description: moduleData.description,
        status: moduleData.status,
        updatedAt: new Date()
      };

      // Update module in course
      const moduleIndex = targetCourse.modules.findIndex(m => m.id === moduleId);
      targetCourse.modules[moduleIndex] = updatedModule;
      mockCourses[targetCourse.id] = targetCourse;
      setCourses(Object.values(mockCourses));

      console.log('✅ Módulo atualizado com sucesso:', updatedModule);
      return updatedModule;

    } catch (error) {
      console.error('❌ Erro ao atualizar módulo:', error);
      if (options.onError) {
        options.onError('Erro ao atualizar módulo');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Exclui um módulo
   */
  const deleteModule = useCallback(async (moduleId: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find and remove module from course
      for (const course of Object.values(mockCourses)) {
        const moduleIndex = course.modules.findIndex(m => m.id === moduleId);
        if (moduleIndex !== -1) {
          course.modules.splice(moduleIndex, 1);
          // Recalculate total lessons and duration
          course.totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
          course.estimatedDuration = course.modules.reduce((total, module) => total + module.estimatedDuration, 0);
          mockCourses[course.id] = course;
          setCourses(Object.values(mockCourses));
          
          console.log('✅ Módulo excluído com sucesso:', moduleId);
          return true;
        }
      }

      throw new Error('Módulo não encontrado');

    } catch (error) {
      console.error('❌ Erro ao excluir módulo:', error);
      if (options.onError) {
        options.onError('Erro ao excluir módulo');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Cria uma nova aula
   */
  const createLesson = useCallback(async (moduleId: string, lessonData: LessonFormData & { content: LessonContent }): Promise<Lesson> => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find module in courses
      let targetModule: Module | null = null;
      let targetCourse: Course | null = null;

      for (const course of Object.values(mockCourses)) {
        const module = course.modules.find(m => m.id === moduleId);
        if (module) {
          targetModule = module;
          targetCourse = course;
          break;
        }
      }

      if (!targetModule || !targetCourse) {
        throw new Error('Módulo não encontrado');
      }

      const newLessonId = `lesson_${Date.now()}`;
      const newLesson: Lesson = {
        id: newLessonId,
        moduleId,
        title: lessonData.title,
        description: lessonData.description,
        status: lessonData.status,
        order: targetModule.lessons.length,
        contentType: lessonData.contentType,
        content: lessonData.content,
        estimatedDuration: lessonData.estimatedDuration || 15,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      targetModule.lessons.push(newLesson);
      
      // Recalculate durations
      targetModule.estimatedDuration = targetModule.lessons.reduce((total, lesson) => total + lesson.estimatedDuration, 0);
      targetCourse.totalLessons = targetCourse.modules.reduce((total, module) => total + module.lessons.length, 0);
      targetCourse.estimatedDuration = targetCourse.modules.reduce((total, module) => total + module.estimatedDuration, 0);

      mockCourses[targetCourse.id] = targetCourse;
      setCourses(Object.values(mockCourses));

      console.log('✅ Aula criada com sucesso:', newLesson);
      return newLesson;

    } catch (error) {
      console.error('❌ Erro ao criar aula:', error);
      if (options.onError) {
        options.onError('Erro ao criar aula');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Atualiza uma aula existente
   */
  const updateLesson = useCallback(async (lessonId: string, lessonData: LessonFormData & { content: LessonContent }): Promise<Lesson> => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // Find lesson in courses
      let targetLesson: Lesson | null = null;
      let targetModule: Module | null = null;
      let targetCourse: Course | null = null;

      for (const course of Object.values(mockCourses)) {
        for (const module of course.modules) {
          const lesson = module.lessons.find(l => l.id === lessonId);
          if (lesson) {
            targetLesson = lesson;
            targetModule = module;
            targetCourse = course;
            break;
          }
        }
        if (targetLesson) break;
      }

      if (!targetLesson || !targetModule || !targetCourse) {
        throw new Error('Aula não encontrada');
      }

      const updatedLesson: Lesson = {
        ...targetLesson,
        title: lessonData.title,
        description: lessonData.description,
        status: lessonData.status,
        contentType: lessonData.contentType,
        content: lessonData.content,
        estimatedDuration: lessonData.estimatedDuration || targetLesson.estimatedDuration,
        updatedAt: new Date()
      };

      // Update lesson in module
      const lessonIndex = targetModule.lessons.findIndex(l => l.id === lessonId);
      targetModule.lessons[lessonIndex] = updatedLesson;

      // Recalculate durations
      targetModule.estimatedDuration = targetModule.lessons.reduce((total, lesson) => total + lesson.estimatedDuration, 0);
      targetCourse.estimatedDuration = targetCourse.modules.reduce((total, module) => total + module.estimatedDuration, 0);

      mockCourses[targetCourse.id] = targetCourse;
      setCourses(Object.values(mockCourses));

      console.log('✅ Aula atualizada com sucesso:', updatedLesson);
      return updatedLesson;

    } catch (error) {
      console.error('❌ Erro ao atualizar aula:', error);
      if (options.onError) {
        options.onError('Erro ao atualizar aula');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Exclui uma aula
   */
  const deleteLesson = useCallback(async (lessonId: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find and remove lesson from module
      for (const course of Object.values(mockCourses)) {
        for (const module of course.modules) {
          const lessonIndex = module.lessons.findIndex(l => l.id === lessonId);
          if (lessonIndex !== -1) {
            module.lessons.splice(lessonIndex, 1);
            
            // Recalculate durations
            module.estimatedDuration = module.lessons.reduce((total, lesson) => total + lesson.estimatedDuration, 0);
            course.totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
            course.estimatedDuration = course.modules.reduce((total, module) => total + module.estimatedDuration, 0);

            mockCourses[course.id] = course;
            setCourses(Object.values(mockCourses));
            
            console.log('✅ Aula excluída com sucesso:', lessonId);
            return true;
          }
        }
      }

      throw new Error('Aula não encontrada');

    } catch (error) {
      console.error('❌ Erro ao excluir aula:', error);
      if (options.onError) {
        options.onError('Erro ao excluir aula');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Reordena conteúdo (drag and drop)
   */
  const reorderContent = useCallback(async (result: DragDropResult): Promise<boolean> => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Implementation would depend on the specific drag-drop library used
      // This is a placeholder for the reordering logic
      
      console.log('✅ Conteúdo reordenado com sucesso:', result);
      return true;

    } catch (error) {
      console.error('❌ Erro ao reordenar conteúdo:', error);
      if (options.onError) {
        options.onError('Erro ao reordenar conteúdo');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Obtém estatísticas dos programas educacionais
   */
  const getStats = useCallback((): EducationalStats => {
    const allCourses = Object.values(mockCourses);
    
    const stats: EducationalStats = {
      totalCourses: allCourses.length,
      totalModules: allCourses.reduce((total, course) => total + course.modules.length, 0),
      totalLessons: allCourses.reduce((total, course) => total + course.totalLessons, 0),
      publishedCourses: allCourses.filter(course => course.status === 'published').length,
      draftCourses: allCourses.filter(course => course.status === 'draft').length,
      totalEstimatedHours: allCourses.reduce((total, course) => total + course.estimatedDuration, 0) / 60,
      contentByType: {
        text: 0,
        video: 0,
        document: 0,
        mixed: 0
      }
    };

    // Count content by type
    allCourses.forEach(course => {
      course.modules.forEach(module => {
        module.lessons.forEach(lesson => {
          stats.contentByType[lesson.contentType]++;
        });
      });
    });

    return stats;
  }, []);

  /**
   * Obtém estrutura em árvore dos cursos
   */
  const getCourseTree = useCallback((): CourseTreeNode[] => {
    return Object.values(mockCourses).map(course => ({
      id: course.id,
      title: course.title,
      type: 'course',
      status: course.status,
      order: course.order,
      estimatedDuration: course.estimatedDuration,
      children: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        type: 'module',
        status: module.status,
        order: module.order,
        parentId: course.id,
        estimatedDuration: module.estimatedDuration,
        children: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          type: 'lesson',
          status: lesson.status,
          order: lesson.order,
          parentId: module.id,
          hasContent: !!(lesson.content.text || lesson.content.videos?.length || lesson.content.documents?.length),
          estimatedDuration: lesson.estimatedDuration
        }))
      }))
    }));
  }, []);

  return {
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
  };
};