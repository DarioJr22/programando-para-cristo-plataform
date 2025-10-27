import React, { useState } from 'react';
import { X, Save, Eye, Plus, Trash2 } from 'lucide-react';
import { MarkdownRenderer } from '../MarkdownRenderer';

interface ChallengeFormProps {
  challenge?: any;
  onSave: (challengeData: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ChallengeForm({ challenge, onSave, onCancel, isLoading = false }: ChallengeFormProps) {
  const [formData, setFormData] = useState({
    title: challenge?.title || '',
    description: challenge?.description || '',
    level: challenge?.level || 'iniciante',
    technologies: challenge?.technologies || ['HTML', 'CSS'],
    points: challenge?.points || 50,
    status: challenge?.status || 'draft',
    requirements: challenge?.requirements || ['Conhecimento básico de HTML', 'Editor de código'],
    tips: challenge?.tips || ['Use o VSCode como editor', 'Teste no navegador'],
    demoUrl: challenge?.demoUrl || '',
    codeUrl: challenge?.codeUrl || '',
    thumbnail: challenge?.thumbnail || '',
    estimatedTime: challenge?.estimatedTime || '2-3 horas'
  });

  const [showPreview, setShowPreview] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  const [newTip, setNewTip] = useState('');

  const levels = [
    { value: 'iniciante', label: 'Iniciante', points: 50 },
    { value: 'intermediario', label: 'Intermediário', points: 75 },
    { value: 'avancado', label: 'Avançado', points: 100 }
  ];

  const availableTechnologies = [
    'HTML', 'CSS', 'JavaScript', 'React', 'Vue', 'Angular',
    'TypeScript', 'Node.js', 'Express', 'Python', 'Java',
    'PHP', 'SQL', 'MongoDB', 'Firebase', 'Git', 'Bootstrap',
    'Tailwind CSS', 'Sass', 'Webpack', 'Vite'
  ];

  const handleLevelChange = (level: string) => {
    const levelData = levels.find(l => l.value === level);
    setFormData(prev => ({
      ...prev,
      level,
      points: levelData?.points || 50
    }));
  };

  const toggleTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.includes(tech)
        ? prev.technologies.filter((t: string) => t !== tech)
        : [...prev.technologies, tech]
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_: any, i: number) => i !== index)
    }));
  };

  const addTip = () => {
    if (newTip.trim()) {
      setFormData(prev => ({
        ...prev,
        tips: [...prev.tips, newTip.trim()]
      }));
      setNewTip('');
    }
  };

  const removeTip = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tips: prev.tips.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (showPreview) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Preview do Desafio</h2>
          <button
            onClick={() => setShowPreview(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8">
          <div className="mb-6 flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              formData.level === 'iniciante' ? 'bg-green-100 text-green-700' :
              formData.level === 'intermediario' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {levels.find(l => l.value === formData.level)?.label}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
              {formData.points} pontos
            </span>
          </div>
          
          {formData.thumbnail && (
            <img 
              src={formData.thumbnail} 
              alt={formData.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{formData.title}</h1>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Tecnologias</h3>
            <div className="flex flex-wrap gap-2">
              {formData.technologies.map((tech: string) => (
                <span key={tech} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          
          <div className="prose prose-lg max-w-none mb-8">
            <MarkdownRenderer content={formData.description} />
          </div>
          
          {formData.requirements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Pré-requisitos</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {formData.requirements.map((req: string, index: number) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
          
          {formData.tips.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Dicas</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {formData.tips.map((tip: string, index: number) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            {formData.demoUrl && (
              <a
                href={formData.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver Demo
              </a>
            )}
            {formData.codeUrl && (
              <a
                href={formData.codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Ver Código
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {challenge ? 'Editar Desafio' : 'Criar Novo Desafio'}
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título do Desafio *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Criar uma Landing Page Responsiva"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição (Markdown) *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="## Objetivo

Descreva o que o usuário deve construir...

### Funcionalidades

- [ ] Feature 1
- [ ] Feature 2

### Layout

Você pode usar o design disponível em..."
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nível de Dificuldade *
            </label>
            <select
              value={formData.level}
              onChange={(e) => handleLevelChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {levels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label} ({level.points} pts)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tempo Estimado
            </label>
            <input
              type="text"
              value={formData.estimatedTime}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 2-3 horas"
            />
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

        {/* Technologies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tecnologias Utilizadas *
          </label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {availableTechnologies.map(tech => (
              <label key={tech} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.technologies.includes(tech)}
                  onChange={() => toggleTechnology(tech)}
                  className="mr-2"
                />
                <span className="text-sm">{tech}</span>
              </label>
            ))}
          </div>
        </div>

        {/* URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Demo/Resultado Final
            </label>
            <input
              type="url"
              value={formData.demoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://exemplo.com/demo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Código/GitHub
            </label>
            <input
              type="url"
              value={formData.codeUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, codeUrl: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/exemplo/projeto"
            />
          </div>
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL da Thumbnail
          </label>
          <input
            type="url"
            value={formData.thumbnail}
            onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://exemplo.com/thumbnail.jpg"
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Pré-requisitos
          </label>
          <div className="space-y-2">
            {formData.requirements.map((req: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm">{req}</span>
                <button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Conhecimento básico de HTML"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <button
                type="button"
                onClick={addRequirement}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Dicas para o Desafio
          </label>
          <div className="space-y-2">
            {formData.tips.map((tip: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 bg-yellow-50 rounded-lg text-sm">{tip}</span>
                <button
                  type="button"
                  onClick={() => removeTip(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTip}
                onChange={(e) => setNewTip(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Use o VSCode como editor"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTip())}
              />
              <button
                type="button"
                onClick={addTip}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Salvando...' : challenge ? 'Atualizar Desafio' : 'Criar Desafio'}
          </button>
        </div>
      </form>
    </div>
  );
}