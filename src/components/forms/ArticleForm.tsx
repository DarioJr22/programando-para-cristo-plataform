import React, { useState } from 'react';
import { X, Save, Eye } from 'lucide-react';
import { MarkdownRenderer } from '../MarkdownRenderer';

interface ArticleFormProps {
  article?: any;
  onSave: (articleData: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ArticleForm({ article, onSave, onCancel, isLoading = false }: ArticleFormProps) {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    slug: article?.slug || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    coverImage: article?.coverImage || '',
    category: article?.category || 'aulas',
    level: article?.level || 'iniciante',
    tags: article?.tags?.join(', ') || '',
    status: article?.status || 'draft',
    verse: {
      text: article?.verse?.text || '',
      reference: article?.verse?.reference || ''
    },
    readTime: article?.readTime || 5
  });

  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    { value: 'aulas', label: '📚 Aulas e Tutoriais' },
    { value: 'fe', label: '🙏 Fé e Programação' },
    { value: 'carreira', label: '💡 Carreira e Orientação' },
    { value: 'comunidade', label: '🎯 Comunidade' }
  ];

  const levels = [
    { value: 'iniciante', label: 'Iniciante' },
    { value: 'intermediario', label: 'Intermediário' },
    { value: 'avancado', label: 'Avançado' }
  ];

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const articleData = {
      ...formData,
      tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
    };

    await onSave(articleData);
  };

  if (showPreview) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Preview do Artigo</h2>
          <button
            onClick={() => setShowPreview(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8">
          <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              categories.find(c => c.value === formData.category)?.value === 'aulas' ? 'bg-blue-100 text-blue-700' :
              categories.find(c => c.value === formData.category)?.value === 'fe' ? 'bg-purple-100 text-purple-700' :
              categories.find(c => c.value === formData.category)?.value === 'carreira' ? 'bg-green-100 text-green-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {categories.find(c => c.value === formData.category)?.label}
            </span>
          </div>
          
          {formData.coverImage && (
            <img 
              src={formData.coverImage} 
              alt={formData.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{formData.title}</h1>
          <p className="text-xl text-gray-600 mb-8">{formData.excerpt}</p>
          
          <div className="prose prose-lg max-w-none">
            <MarkdownRenderer content={formData.content} />
          </div>
          
          {formData.verse.text && (
            <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <blockquote className="text-lg italic text-blue-900 mb-2">
                "{formData.verse.text}"
              </blockquote>
              <cite className="text-sm text-blue-700">— {formData.verse.reference}</cite>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {article ? 'Editar Artigo' : 'Criar Novo Artigo'}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o título do artigo..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug (URL) *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="url-do-artigo"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resumo/Excerpt *
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
            required
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Breve descrição do que o artigo aborda..."
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conteúdo (Markdown) *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            required
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="## Introdução

Escreva seu artigo em Markdown aqui...

### Subtítulo

```javascript
// Exemplo de código
function exemplo() {
  console.log('Hello World!');
}
```"
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nível *
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {levels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </div>
        </div>

        {/* Image and Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL da Imagem de Capa
            </label>
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="HTML, CSS, JavaScript"
            />
          </div>
        </div>

        {/* Verse Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Versículo Inspiracional</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texto do Versículo
              </label>
              <textarea
                value={formData.verse.text}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  verse: { ...prev.verse, text: e.target.value }
                }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tudo posso naquele que me fortalece"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referência
              </label>
              <input
                type="text"
                value={formData.verse.reference}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  verse: { ...prev.verse, reference: e.target.value }
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Filipenses 4:13"
              />
              
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo de Leitura (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.readTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, readTime: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Salvando...' : article ? 'Atualizar Artigo' : 'Criar Artigo'}
          </button>
        </div>
      </form>
    </div>
  );
}