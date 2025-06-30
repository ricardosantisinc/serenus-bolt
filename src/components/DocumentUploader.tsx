import React, { useState, useRef } from 'react';
import { 
  Upload, 
  X, 
  FileText, 
  Download, 
  Eye, 
  Trash2,
  Plus,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { DocumentContent, DocumentType } from '../types';

interface DocumentUploaderProps {
  documents: DocumentContent[];
  onChange: (documents: DocumentContent[]) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documents,
  onChange
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const getFileIcon = (fileType: DocumentType) => {
    return <FileText className="h-8 w-8 text-red-600" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentType = (mimeType: string): DocumentType => {
    switch (mimeType) {
      case 'application/pdf':
        return 'pdf';
      case 'application/msword':
        return 'doc';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'docx';
      default:
        return 'pdf';
    }
  };

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Tipo de arquivo não suportado. Use apenas PDF, DOC ou DOCX.';
    }
    
    if (file.size > maxFileSize) {
      return 'Arquivo muito grande. Tamanho máximo: 10MB.';
    }
    
    return null;
  };

  const processFile = async (file: File): Promise<DocumentContent> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const document: DocumentContent = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          title: file.name.split('.')[0],
          fileName: file.name,
          originalFileName: file.name,
          fileType: getDocumentType(file.type),
          fileSize: file.size,
          downloadUrl: reader.result as string, // In real app, this would be uploaded to storage
          order: documents.length,
          uploadedAt: new Date()
        };
        
        resolve(document);
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files: FileList) => {
    setError('');
    setUploading(true);

    try {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      
      // Validate all files first
      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          setError(error);
          setUploading(false);
          return;
        }
        validFiles.push(file);
      }

      // Process all valid files
      const newDocuments: DocumentContent[] = [];
      for (const file of validFiles) {
        const document = await processFile(file);
        newDocuments.push(document);
      }

      onChange([...documents, ...newDocuments]);
    } catch (err) {
      setError('Erro ao processar arquivos');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
    // Reset input
    e.target.value = '';
  };

  const handleDelete = (documentId: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== documentId);
    onChange(updatedDocuments);
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Documentos</h3>
        <button
          onClick={openFileSelector}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
          disabled={uploading}
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar Documento</span>
        </button>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-teal-500 bg-teal-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileSelector}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-teal-600 animate-spin mb-2" />
            <p className="text-sm text-gray-600">Processando arquivos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Clique para selecionar ou arraste arquivos aqui
            </p>
            <p className="text-xs text-gray-500">
              PDF, DOC, DOCX até 10MB
            </p>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-800">{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-3">
        {documents.map((document) => (
          <div key={document.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getFileIcon(document.fileType)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{document.title}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{document.fileType.toUpperCase()}</span>
                  <span>•</span>
                  <span>{formatFileSize(document.fileSize)}</span>
                  <span>•</span>
                  <span>{document.uploadedAt.toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {document.previewUrl && (
                  <button
                    onClick={() => window.open(document.previewUrl, '_blank')}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = document.downloadUrl;
                    link.download = document.originalFileName;
                    link.click();
                  }}
                  className="text-gray-400 hover:text-green-600 transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handleDelete(document.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {documents.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento adicionado</h3>
            <p className="text-gray-600 mb-4">Faça upload de documentos PDF, DOC ou DOCX</p>
            <button
              onClick={openFileSelector}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Adicionar Primeiro Documento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};