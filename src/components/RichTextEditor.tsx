import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Quote,
  Link,
  Image,
  Code,
  Undo,
  Redo
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Digite o conteúdo da aula..."
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const toolbarButtons = [
    { command: 'bold', icon: Bold, label: 'Negrito' },
    { command: 'italic', icon: Italic, label: 'Itálico' },
    { command: 'underline', icon: Underline, label: 'Sublinhado' },
    { command: 'insertUnorderedList', icon: List, label: 'Lista' },
    { command: 'insertOrderedList', icon: ListOrdered, label: 'Lista Numerada' },
    { command: 'formatBlock', icon: Quote, label: 'Citação', value: 'blockquote' },
    { command: 'createLink', icon: Link, label: 'Link' },
    { command: 'insertHTML', icon: Code, label: 'Código' },
    { command: 'undo', icon: Undo, label: 'Desfazer' },
    { command: 'redo', icon: Redo, label: 'Refazer' }
  ];

  const handleLinkInsert = () => {
    const url = prompt('Digite a URL do link:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleCodeInsert = () => {
    const code = prompt('Digite o código:');
    if (code) {
      executeCommand('insertHTML', `<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">${code}</code>`);
    }
  };

  const handleImageInsert = () => {
    const url = prompt('Digite a URL da imagem:');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {toolbarButtons.map((button) => {
          const Icon = button.icon;
          return (
            <button
              key={button.command}
              onClick={() => {
                if (button.command === 'createLink') {
                  handleLinkInsert();
                } else if (button.command === 'insertHTML') {
                  handleCodeInsert();
                } else {
                  executeCommand(button.command, button.value);
                }
              }}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title={button.label}
              type="button"
            >
              <Icon className="h-4 w-4 text-gray-600" />
            </button>
          );
        })}
        
        {/* Image button */}
        <button
          onClick={handleImageInsert}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Inserir Imagem"
          type="button"
        >
          <Image className="h-4 w-4 text-gray-600" />
        </button>
        
        {/* Heading dropdown */}
        <select
          onChange={(e) => executeCommand('formatBlock', e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded"
          defaultValue=""
        >
          <option value="">Formato</option>
          <option value="h2">Título 2</option>
          <option value="h3">Título 3</option>
          <option value="h4">Título 4</option>
          <option value="p">Parágrafo</option>
        </select>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsEditorFocused(true)}
        onBlur={() => setIsEditorFocused(false)}
        className={`p-4 min-h-96 max-h-96 overflow-y-auto focus:outline-none ${
          isEditorFocused ? 'ring-2 ring-teal-500' : ''
        }`}
        style={{
          lineHeight: '1.6'
        }}
        data-placeholder={placeholder}
      />

      {/* Character count */}
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
        {content.replace(/<[^>]*>/g, '').length} caracteres
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.3;
        }
        
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.3;
        }
        
        [contenteditable] h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.3;
        }
        
        [contenteditable] p {
          margin: 0.5rem 0;
        }
        
        [contenteditable] ul,
        [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        
        [contenteditable] blockquote {
          margin: 1rem 0;
          padding: 0.5rem 1rem;
          border-left: 4px solid #D1D5DB;
          background-color: #F9FAFB;
          font-style: italic;
        }
        
        [contenteditable] a {
          color: #0D9488;
          text-decoration: underline;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          margin: 0.5rem 0;
          border-radius: 0.375rem;
        }
        
        [contenteditable] code {
          background-color: #F3F4F6;
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};