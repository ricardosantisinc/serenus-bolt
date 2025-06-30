export interface Company {
  id: string;
  name: string;
  domain: string;
  contactPerson: string;
  corporateEmail: string;
  landlinePhone?: string;
  mobilePhone: string;
  logo?: string;
  createdAt: Date;
  isActive: boolean;
  plan: 'basic' | 'premium' | 'enterprise';
  maxUsers: number;
  currentUsers: number;
  subscriptionPlanId?: string;
}

export interface CompanyCheckupSettings {
  id: string;
  companyId: string;
  normalIntervalDays: number; // Padrão 90 dias
  severeIntervalDays: number; // Padrão 30 dias
  autoRemindersEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyRecommendation {
  id: string;
  companyId: string;
  title: string;
  content: string;
  recommendationType: 'mental_health' | 'nutrition' | 'general' | 'integrated' | 'universal';
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  value: number;
  periodicity: 'monthly' | 'quarterly' | 'annually';
  features: string[];
  isActive: boolean;
  createdAt: Date;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'gerente' | 'colaborador';
  companyId?: string; // Super admin doesn't belong to any company
  department?: string;
  avatar?: string;
  lastCheckup?: Date;
  nextCheckup?: Date;
  permissions: Permission[];
  checkupHistory?: CheckupResult[];
  birthDate?: Date;
  gender?: 'male' | 'female' | 'other';
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface MentalHealthMetric {
  id: string;
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  description: string;
}

export interface WellnessContent {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'exercise' | 'training';
  duration?: string;
  image: string;
  category: string;
  requiredRole?: User['role'][];
}

export interface ChartData {
  name: string;
  depression: number;
  stress: number;
  anxiety: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  avatar?: string;
  mentalHealthScore: number;
  lastCheckup?: Date;
  status: 'active' | 'inactive' | 'on-leave';
}

export interface AdminStats {
  totalEmployees: number;
  activeEmployees: number;
  averageMentalHealthScore: number;
  checkupsThisMonth: number;
  departmentStats: DepartmentStats[];
}

export interface DepartmentStats {
  name: string;
  employeeCount: number;
  averageScore: number;
  color: string;
}

export interface SuperAdminStats {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  monthlyRevenue: number;
  companiesGrowth: number;
  usersGrowth: number;
  revenueGrowth: number;
}

// DASS-21 Related Types
export interface Dass21Question {
  id: number;
  text: string;
  category: 'stress' | 'anxiety' | 'depression';
}

export interface Dass21Response {
  questionId: number;
  value: 0 | 1 | 2 | 3;
}

export interface Dass21Scores {
  stress: number;
  anxiety: number;
  depression: number;
}

export interface Dass21Classification {
  stress: 'normal' | 'leve' | 'moderado' | 'severo' | 'extremamente_severo';
  anxiety: 'normal' | 'leve' | 'moderado' | 'severo' | 'extremamente_severo';
  depression: 'normal' | 'leve' | 'moderado' | 'severo' | 'extremamente_severo';
}

// IAS (Índice de Alimentação Saudável) Related Types
export interface IasQuestion {
  id: number;
  text: string;
  options: IasOption[];
}

export interface IasOption {
  text: string;
  value: number;
}

export interface IasResponse {
  questionId: number;
  value: number;
}

export interface IasResult {
  totalScore: number;
  classification: 'alto_risco' | 'desbalanceada' | 'razoavel' | 'saudavel';
  recommendations: string[];
}

// Combined Assessment Types
export interface CombinedAssessmentResult {
  dass21: {
    scores: Dass21Scores;
    classifications: Dass21Classification;
    overallScore: number;
    severityLevel: string;
  };
  ias: IasResult;
  recommendedPaths: string[];
  psychologistReferralNeeded: boolean;
  justification: string;
  criticalLevel: 'baixo' | 'moderado' | 'alto' | 'crítico';
  recommendations: string[];
}

export interface CheckupResult {
  id: string;
  userId: string;
  companyId: string;
  date: Date;
  responses: Dass21Response[];
  scores: Dass21Scores;
  classifications: Dass21Classification;
  overallScore: number; // Average of all three scores
  severityLevel: 'normal' | 'leve' | 'moderado' | 'severo' | 'extremamente_severo';
  nextCheckupDate: Date;
  // IAS Fields
  iasResponses?: IasResponse[];
  iasTotalScore?: number;
  iasClassification?: 'alto_risco' | 'desbalanceada' | 'razoavel' | 'saudavel';
  // Combined Assessment Fields
  combinedRecommendedPaths?: string[];
  combinedPsychologistReferralNeeded?: boolean;
  combinedJustification?: string;
  combinedCriticalLevel?: 'baixo' | 'moderado' | 'alto' | 'crítico';
  combinedRecommendations?: string[];
}

// Mental Health Classification Result
export interface MentalHealthClassificationResult {
  recommendedPaths: string[];
  psychologistReferralNeeded: boolean;
  justification: string;
  criticalLevel: 'baixo' | 'moderado' | 'alto' | 'crítico';
  recommendations: string[];
}

// Analytics and Reports
export interface CheckupAnalytics {
  totalCheckups: number;
  averageOverallScore: number;
  severityDistribution: {
    normal: number;
    leve: number;
    moderado: number;
    severo: number;
    extremamente_severo: number;
  };
  trendData: {
    month: string;
    averageScore: number;
    checkupCount: number;
  }[];
  departmentAnalytics: {
    department: string;
    averageScore: number;
    employeeCount: number;
    riskCount: number;
  }[];
}

// User Profile Update Interface
export interface UserProfileUpdate {
  name: string;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'other';
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Profile Photo Types
export interface UserPhoto {
  id: string;
  userId: string;
  imageData: string; // Base64 encoded image data
  fileName: string;
  fileType: 'image/jpeg' | 'image/jpg' | 'image/png';
  fileSize: number;
  width: number;
  height: number;
  isActive: boolean;
  uploadDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoUploadResult {
  success: boolean;
  message: string;
  photo?: UserPhoto;
  errors?: string[];
}

export interface ImageProcessingOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'image/jpeg' | 'image/png';
}

// ====== EDUCATIONAL PROGRAMS SYSTEM ======

// Enums for better type safety
export type PublicationStatus = 'draft' | 'published' | 'archived';
export type ContentType = 'text' | 'video' | 'document' | 'mixed';
export type VideoProvider = 'youtube' | 'vimeo';
export type DocumentType = 'pdf' | 'doc' | 'docx';

// Core Educational Program Interfaces
export interface Course {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  status: PublicationStatus;
  order: number;
  modules: Module[];
  totalLessons: number;
  estimatedDuration: number; // em minutos
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  status: PublicationStatus;
  order: number;
  lessons: Lesson[];
  estimatedDuration: number; // em minutos
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  status: PublicationStatus;
  order: number;
  contentType: ContentType;
  content: LessonContent;
  estimatedDuration: number; // em minutos
  createdAt: Date;
  updatedAt: Date;
}

// Content Types for Lessons
export interface LessonContent {
  text?: RichTextContent;
  videos?: VideoContent[];
  documents?: DocumentContent[];
}

export interface RichTextContent {
  id: string;
  content: string; // HTML content from rich text editor
  order: number;
}

export interface VideoContent {
  id: string;
  title: string;
  description?: string;
  provider: VideoProvider;
  videoId: string; // YouTube or Vimeo video ID
  embedUrl: string;
  thumbnailUrl?: string;
  duration?: number; // em segundos
  order: number;
}

export interface DocumentContent {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  originalFileName: string;
  fileType: DocumentType;
  fileSize: number;
  downloadUrl: string;
  previewUrl?: string;
  order: number;
  uploadedAt: Date;
}

// Tree View Structure
export interface CourseTreeNode {
  id: string;
  title: string;
  type: 'course' | 'module' | 'lesson';
  status: PublicationStatus;
  order: number;
  children?: CourseTreeNode[];
  parentId?: string;
  hasContent?: boolean;
  estimatedDuration?: number;
}

// Form Data Interfaces
export interface CourseFormData {
  title: string;
  description: string;
  coverImage?: File;
  status: PublicationStatus;
  tags: string[];
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface ModuleFormData {
  title: string;
  description: string;
  status: PublicationStatus;
}

export interface LessonFormData {
  title: string;
  description: string;
  status: PublicationStatus;
  contentType: ContentType;
}

// Content Form Data
export interface RichTextFormData {
  content: string;
}

export interface VideoFormData {
  title: string;
  description?: string;
  provider: VideoProvider;
  videoUrl: string; // Full URL that will be parsed
}

export interface DocumentFormData {
  title: string;
  description?: string;
  file: File;
}

// API Response Types
export interface EducationalContentResponse {
  success: boolean;
  message: string;
  data?: Course | Module | Lesson;
  errors?: string[];
}

export interface ContentUploadResponse {
  success: boolean;
  message: string;
  content?: VideoContent | DocumentContent | RichTextContent;
  errors?: string[];
}

// Search and Filter Types
export interface ContentFilters {
  status?: PublicationStatus | 'all';
  contentType?: ContentType | 'all';
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  category?: string | 'all';
  searchTerm?: string;
}

// Statistics and Analytics
export interface EducationalStats {
  totalCourses: number;
  totalModules: number;
  totalLessons: number;
  publishedCourses: number;
  draftCourses: number;
  totalEstimatedHours: number;
  contentByType: {
    text: number;
    video: number;
    document: number;
    mixed: number;
  };
}

// User Progress Types (for future implementation)
export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  completed: boolean;
  progress: number; // 0-100
  timeSpent: number; // em minutos
  lastAccessed: Date;
  completedAt?: Date;
}

// Drag and Drop Types
export interface DragDropItem {
  id: string;
  type: 'course' | 'module' | 'lesson';
  order: number;
  parentId?: string;
}

export interface DragDropResult {
  draggedId: string;
  destination: {
    parentId?: string;
    index: number;
  };
  source: {
    parentId?: string;
    index: number;
  };
}