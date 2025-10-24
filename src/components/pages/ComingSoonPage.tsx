import React from 'react';
import { Clock, Code, BookOpen, Target } from 'lucide-react';

export function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-4xl">✝️</span>
            </div>
            <div className="text-white text-3xl font-bold">Programando para Cristo</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
              <Clock className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Estamos Preparando Algo Especial! 🚀
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma está sendo desenvolvida com muito carinho para você. 
              Em breve teremos conteúdo incrível sobre programação e fé!
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-blue-50 rounded-xl">
              <Code className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Tutoriais</h3>
              <p className="text-sm text-gray-600">
                Aprenda programação com propósito e valores cristãos
              </p>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl">
              <BookOpen className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Artigos</h3>
              <p className="text-sm text-gray-600">
                Conteúdos que unem tecnologia e fé cristã
              </p>
            </div>
            <div className="p-6 bg-green-50 rounded-xl">
              <Target className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Desafios</h3>
              <p className="text-sm text-gray-600">
                Pratique suas habilidades com projetos inspiradores
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="border-t border-gray-200 pt-8">
            <p className="text-gray-700 mb-4 font-medium">
              Quer ser notificado quando lançarmos?
            </p>
            <a
              href="/#newsletter"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              📧 Inscreva-se na Newsletter
            </a>
          </div>

          {/* Bible Verse */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 italic">
              "Tudo tem o seu tempo determinado, e há tempo para todo propósito debaixo do céu."
            </p>
            <p className="text-xs text-gray-400 mt-2">Eclesiastes 3:1</p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <a 
            href="/" 
            className="text-white hover:text-blue-100 transition-colors inline-flex items-center gap-2"
          >
            ← Voltar para o início
          </a>
        </div>
      </div>
    </div>
  );
}
