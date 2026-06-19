/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Camera, 
  Check, 
  AlertTriangle, 
  Eye, 
  ArrowRight,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../translations';

interface CameraTourGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
}

export default function CameraTourGuideModal({
  isOpen,
  onClose,
  language = 'pt'
}: CameraTourGuideModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: language === 'es' ? '1. Ángulo Posterior (Diagonal a 45°)' : language === 'en' ? '1. Rear Angle (45° Diagonal)' : '1. Ângulo Traseiro (Giro de 45°)',
      subtitle: language === 'es' ? 'Foco en la grupa' : language === 'en' ? 'Focus on the rump' : 'Foco absoluto na garupa',
      description: language === 'es' 
        ? 'Coloque la cámara a un ángulo diagonal de 45° apuntando a la parte trasera del animal. Evite fotos totalmente laterales o frontales, ya que el análisis de Condición Corporal (ECC) mide la cobertura de grasa sobre el hueso de la cadera, el lecho de la cola y el lomo.'
        : language === 'en' 
        ? 'Position your camera at a 45° diagonal angle pointing to the rear of the steer. Avoid direct side or frontal shots, because the BCS algorithm evaluates fat coverage over the hip bone, pin bones, tailhead, and spine.'
        : 'Posicione a câmera em um giro de 45 graus apontando para a garupa/traseira do boi. Evite fotografar o animal de perfil reto ou de frente, pois o sistema de leitura precisa mapear com precisão as curvas de profundidade, bacia e inserção da cauda.',
      correctTips: language === 'es'
        ? ['Ángulo diagonal trasero (líneas visibles)', 'Visualización clara de huesos de cadera y cola']
        : language === 'en'
        ? ['Diagonal rear angle (clear outlines)', 'Tailhead and hip bones fully visible']
        : ['Ângulo diagonal traseiro (curvas visíveis)', 'Ossos do quadril e inserção da cauda nítidos'],
      incorrectTips: language === 'es'
        ? ['Foto de lado 100% (oculta el relieve óseo)', 'Foto frontal (no permite evaluar la cadera)']
        : language === 'en'
        ? ['Flat side view (hides bone depth)', 'Front view (cannot evaluate rump fat)']
        : ['Foto de perfil reto (oculta profundidade)', 'Foto frontal (impossível avaliar a garupa)'],
      graphic: (isDark: boolean) => (
        <div className="relative w-full h-44 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
          {/* Stylized vector overhead cow positioning diagram */}
          <svg viewBox="0 0 200 120" className="w-full h-full max-w-[240px]">
            {/* Clean overhead bovine geometry centered */}
            <g transform="translate(10, 0)">
              {/* Steer Torso */}
              <rect x="75" y="48" width="34" height="24" rx="10" fill={isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(30, 58, 138, 0.06)'} stroke={isDark ? '#475569' : '#cbd5e1'} strokeWidth="1.5" />
              {/* Steer Head facing left */}
              <polygon points="63,60 71,53 71,67" fill={isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(30, 58, 138, 0.12)'} stroke={isDark ? '#475569' : '#cbd5e1'} strokeWidth="1" />
              {/* Horns */}
              <path d="M 69 54 C 65 51, 61 52, 59 54 M 69 66 C 65 69, 61 68, 59 66" fill="none" stroke={isDark ? '#64748b' : '#94a3b8'} strokeWidth="1.2" strokeLinecap="round" />
              {/* Tail on right */}
              <path d="M 109 60 C 115 60, 117 65, 118 68" fill="none" stroke={isDark ? '#64748b' : '#94a3b8'} strokeWidth="1.2" strokeLinecap="round" />
              
              {/* Target Marker on Rump (right side) */}
              <circle cx="104" cy="60" r="3" fill="#10b981" />
              <line x1="104" y1="46" x2="104" y2="74" stroke="#10b981" strokeWidth="0.8" strokeDasharray="2 2" />
            </g>
            
            {/* Correct path Indicator */}
            <path d="M 114 60 L 150 90" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="150" cy="90" r="14" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="1" />
            <text x="150" y="93" textAnchor="middle" fill="#10b981" className="text-[8px] font-mono font-extrabold">45°</text>
            <text x="150" y="112" textAnchor="middle" fill="#10b981" className="text-[8px] font-semibold">Ideal</text>

            {/* Incorrect Side Path */}
            <path d="M 95 60 L 40 60" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="40" cy="60" r="10" fill="#ef4444" fillOpacity="0.05" stroke="#ef4444" strokeWidth="1" />
            <text x="40" y="63" textAnchor="middle" fill="#ef4444" className="text-[7px] font-mono font-semibold">90°</text>
            <text x="40" y="78" textAnchor="middle" fill="#ef4444" className="text-[8px] font-medium">Incorreto</text>
          </svg>
          <div className="absolute top-2.5 left-3 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 text-[9px] font-mono font-bold rounded">
            ORIENTAÇÃO DE ÂNGULO
          </div>
        </div>
      )
    },
    {
      title: language === 'es' ? '2. Distancia de Captura (1.5m a 2.5m)' : language === 'en' ? '2. Optimal Capture Distance' : '2. Distância de Captura (1.5m - 2.5m)',
      subtitle: language === 'es' ? 'Evite estar muy cerca' : language === 'en' ? 'Avoid being too close' : 'Enquadramento corporal amplo',
      description: language === 'es'
        ? 'Mantenga una distancia de 1.5 a 2.5 metros del animal. Toda la región de la rabadilla, los extremos del cuadril y las nalgas de la res deben caber completamente dentro de los marcadores del visor para una correcta lectura métrica.'
        : language === 'en'
        ? 'Maintain a regular distance of 1.5 to 2.5 meters. The entire rump region, flanks, and tailhead must fit cleanly inside the screen guides to execute accurate structural volume predictions.'
        : 'Mantenha a câmera afastada entre 1,5 e 2,5 metros do animal. Toda a garupa e perfil superior do músculo glúteo e cauda devem aparecer de maneira completa dentro do visor do aparelho, sem cortar as beiradas.',
      correctTips: language === 'es'
        ? ['Animal encuadrado completamente', 'Margen de resguardo alrededor']
        : language === 'en'
        ? ['Margins around the cattle hip', 'Full rump bounds captured']
        : ['Animal inteiro dentro da guia', 'Margem de segurança ao redor'],
      incorrectTips: language === 'es'
        ? ['Muy cerca (corta la pelvis del animal)', 'Muy lejos (píxeles insuficientes)']
        : language === 'en'
        ? ['Too close (cuts off pelvis bones)', 'Too far (insufficient bone texture)']
        : ['Muito perto (corta bacia e lombo)', 'Muito longe (baixa resolução no campo)'],
      graphic: (isDark: boolean) => (
        <div className="relative w-full h-44 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 200 120" className="w-full h-full max-w-[240px]">
            {/* Distance visualization */}
            <line x1="40" y1="90" x2="160" y2="90" stroke={isDark ? '#475569' : '#cbd5e1'} strokeWidth="1" />
            <line x1="40" y1="85" x2="40" y2="95" stroke={isDark ? '#475569' : '#cbd5e1'} strokeWidth="1" />
            <line x1="160" y1="85" x2="160" y2="95" stroke={isDark ? '#475569' : '#cbd5e1'} strokeWidth="1" />
            
            {/* Labels */}
            <rect x="75" y="77" width="50" height="15" rx="3" fill={isDark ? '#1e293b' : '#ffffff'} stroke={isDark ? '#334155' : '#e2e8f0'} />
            <text x="100" y="88" textAnchor="middle" fill={isDark ? '#cbd5e1' : '#1e3a8a'} className="text-[8px] font-sans font-bold">1.5m - 2.5m</text>

            {/* Modern vertical smartphone outline */}
            <rect x="25" y="32" width="22" height="38" rx="4" fill={isDark ? 'rgba(100, 116, 139, 0.1)' : 'rgba(100, 116, 139, 0.05)'} stroke={isDark ? '#64748b' : '#475569'} strokeWidth="1.2" />
            <line x1="31" y1="35" x2="39" y2="35" stroke={isDark ? '#64748b' : '#475569'} strokeWidth="1" strokeLinecap="round" />
            <circle cx="36" cy="65" r="1" fill={isDark ? '#64748b' : '#475569'} />
            
            {/* Rump bounding box */}
            <rect x="145" y="30" width="30" height="40" rx="4" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 3" />
            <text x="160" y="52" textAnchor="middle" fill="#10b981" className="text-[8px] font-bold">GARUPA</text>
          </svg>
          <div className="absolute top-2.5 left-3 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 text-[9px] font-mono font-bold rounded">
            DISTÂNCIA RECOMENDADA
          </div>
        </div>
      )
    },
    {
      title: language === 'es' ? '3. Iluminación Uniforme' : language === 'en' ? '3. Avoid Backlight and Glare' : '3. Iluminação Uniforme (Sem Contra-luz)',
      subtitle: language === 'es' ? 'Evite sombras extremas' : language === 'en' ? 'Avoid extreme shadows' : 'Qualidade de captação de imagem',
      description: language === 'es'
        ? 'Evite capturar fotos con el Sol directamente detrás del ganado. Las siluetas oscuras impiden que el modelo analice los contornos tridimensionales de los músculos de la grupa. Busque siempre luz natural difusa o la iluminación uniforme del cobertizo.'
        : language === 'en'
        ? 'Avoid shooting directly into the sun (strong backlight). Silhouette shadows erase muscle contours and bone highlights. Use uniform natural sunlight or corral soft shadow to capture clean surface texture details.'
        : 'Evite capturar imagens posicionando a lente diretamente contra o Sol de fundo (contra-luz extrema). Isso cria sombras escuras que impedem o leitor biométrico de identificar detalhes de profundidade das costelas e ancas. Use luz do dia difusa e uniforme.',
      correctTips: language === 'es'
        ? ['Luz diurna suave que destaca relieves', 'Sombra uniforme dentro de la manga']
        : language === 'en'
        ? ['Soft daylight highlighting bones', 'Evenly shaded environments']
        : ['Luz solar difusa e uniforme', 'Curral sombreado e com boa visibilidade'],
      incorrectTips: language === 'es'
        ? ['Sol de frente a la lente (destello)', 'Silueta negra sin detalles de piel']
        : language === 'en'
        ? ['Sun facing the lens (creates glare)', 'Pitch black silhouettes without curves']
        : ['Sol brilhando diretamente na lente', 'Traseira do animal muito escura/sombreada'],
      graphic: (isDark: boolean) => (
        <div className="relative w-full h-44 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 200 120" className="w-full h-full max-w-[240px]">
            {/* Glowing Sun and Ray symbols illustrating proper setup */}
            <circle cx="100" cy="30" r="10" fill="#d97706" fillOpacity="0.10" stroke="#d97706" strokeWidth="1.2" />
            <line x1="100" y1="12" x2="100" y2="16" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="100" y1="44" x2="100" y2="48" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="82" y1="30" x2="86" y2="30" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="114" y1="30" x2="118" y2="30" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />
            
            {/* Symmetrical diffuse ray directions */}
            <path d="M 60 70 C 80 80, 120 80, 140 70" stroke="#d97706" strokeWidth="0.8" strokeDasharray="3 15" />
            <text x="100" y="85" textAnchor="middle" fill={isDark ? '#cbd5e1' : '#1e293b'} className="text-[9px] font-sans font-bold">Iluminação Natural Difusa</text>
          </svg>
          <div className="absolute top-2.5 left-3 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 text-[9px] font-mono font-bold rounded">
            CONDIÇÃO DE ILUMINAÇÃO
          </div>
        </div>
      )
    },
    {
      title: language === 'es' ? '4. Nivelamiento y Altura' : language === 'en' ? '4. Camera Height and Level' : '4. Nivelamento e Altura Coerente',
      subtitle: language === 'es' ? 'Evite ángulos raros' : language === 'en' ? 'Avoid severe angles' : 'Mesma altura do lombo',
      description: language === 'es'
        ? 'Sujete su dispositivo de manera nivelada, idealmente a la altura del lombo o dorso del animal. Evite fotos tomadas muy desde arriba o muy cerca del suelo, para no alterar la perspectiva del análisis biométrico.'
        : language === 'en'
        ? 'Hold the handset straight and parallel, aligned to the level of the animal\'s spine line. Avoid tilted top-down or severe bottom-up angles to preserve realistic geometric aspect ratios.'
        : 'Mantenha o celular reto e firme, idealmente posicionado na altura do dorso/lombo do animal. Evite inclinações severas de cima para baixo ou tirar fotos agachado muito próximo ao chão para não distorcer a geometria.',
      correctTips: language === 'es'
        ? ['Celular perpendicular al eje', 'Altura alineada con la grupa']
        : language === 'en'
        ? ['Device parallel to the body axis', 'Aligned at rump mid-height']
        : ['Lente perpendicular ao dorso', 'Alinhado horizontalmente com a garupa'],
      incorrectTips: language === 'es'
        ? ['Inclinación cenital (desde arriba)', 'Ángulo bajo deformante']
        : language === 'en'
        ? ['Zenith slant (top-down view)', 'Severe ground-up angle bias']
        : ['Inclinação vertical para baixo', 'Foto de baixo para cima distorcendo volume'],
      graphic: (isDark: boolean) => (
        <div className="relative w-full h-44 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 200 120" className="w-full h-full max-w-[240px]">
            {/* Level lines indicators */}
            <line x1="30" y1="60" x2="170" y2="60" stroke="#10b981" strokeWidth="1.2" />
            <circle cx="30" cy="60" r="3" fill="#10b981" />
            <circle cx="170" cy="60" r="3" fill="#10b981" />
            
            {/* Balanced text label */}
            <rect x="70" y="47" width="60" height="11" rx="3" fill="#10b981" fillOpacity="0.05" stroke="#10b981" strokeWidth="0.5" />
            <text x="100" y="55" textAnchor="middle" fill="#10b981" className="text-[8px] font-sans font-bold uppercase tracking-widest">Nível de Dorso</text>
            <text x="100" y="80" textAnchor="middle" fill={isDark ? '#cbd5e1' : '#64748b'} className="text-[8px] font-semibold">Câmera Centralizada a 1.2m de altura</text>
          </svg>
          <div className="absolute top-2.5 left-3 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 text-[9px] font-mono font-bold rounded">
            ALINHAMENTO DO APARELHO
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div 
      className="fixed inset-0 bg-black/75 z-55 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in text-left select-none"
      id="camera-tour-guide-modal-overlay"
    >
      <div 
        className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col"
        id="camera-tour-guide-modal-card"
      >
        {/* Header bar of Tour Modal */}
        <div className="p-4 bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg text-white">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider font-sans leading-none">
                {language === 'es' ? 'Guía de Posicionamiento de Cámara' : language === 'en' ? 'Camera Positioning Guide' : 'Guia de Posicionamento de Câmera'}
              </h3>
              <p className="text-[10px] text-sky-200/95 font-sans mt-1 border-none bg-transparent">
                {language === 'es' ? 'Recomendaciones técnicas de campo' : language === 'en' ? 'Technical recommendations for image capture' : 'Recomendações técnicas de campo'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
            title="Fechar Guia"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Slider State Indicator */}
        <div className="bg-slate-100 dark:bg-slate-900/60 px-5 py-2.5 border-b border-slate-200/60 dark:border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentStep === idx 
                    ? 'w-7 bg-blue-600 dark:bg-sky-400' 
                    : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono font-extrabold text-blue-700 dark:text-sky-300 bg-blue-100/50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200/20">
            {language === 'es' ? 'PASO' : language === 'en' ? 'STEP' : 'PASSO'} {currentStep + 1} / {steps.length}
          </span>
        </div>

        {/* Main Step Content Container */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[70vh]">
          {/* Header instructions for step */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-black text-blue-600 dark:text-sky-400">
              {steps[currentStep].subtitle}
            </span>
            <h4 className="text-lg font-black text-slate-900 dark:text-white font-sans leading-tight">
              {steps[currentStep].title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Graphic Area */}
          <div>
            {steps[currentStep].graphic(isDark)}
          </div>

          {/* Visual Dos and Don'ts checklists matching screen standard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Correto Column */}
            <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-250 dark:border-emerald-900/30 rounded-xl space-y-2.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold font-sans uppercase text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5 stroke-[3] text-emerald-505" />
                <span>{language === 'es' ? 'CORRECTO' : language === 'en' ? 'CORRECT' : 'RECOMENDADO'}</span>
              </span>
              <ul className="space-y-1.5">
                {steps[currentStep].correctTips.map((tip, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-slate-700 dark:text-slate-350 leading-tight">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Incorreto Column */}
            <div className="p-4 bg-rose-500/5 dark:bg-rose-950/10 border border-rose-250 dark:border-rose-900/30 rounded-xl space-y-2.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold font-sans uppercase text-rose-600 dark:text-rose-450">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-505" />
                <span>{language === 'es' ? 'EVITAR' : language === 'en' ? 'AVOID' : 'INCORRETO / DEFORMA'}</span>
              </span>
              <ul className="space-y-1.5">
                {steps[currentStep].incorrectTips.map((tip, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-slate-700 dark:text-slate-350 leading-tight">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-450 shrink-0 mt-1.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Bottom Utility Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between gap-3 font-sans font-bold">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs leading-none shrink-0 flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{language === 'es' ? 'Atrás' : language === 'en' ? 'Back' : 'Anterior'}</span>
          </button>

          <button
            id={`camera-tour-guide-next-btn-${currentStep}`}
            onClick={handleNext}
            className="px-6 py-2.5 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg text-xs leading-none flex items-center gap-1.5 hover:shadow-md transition-all duration-150 transform hover:scale-[1.01] active:scale-98 cursor-pointer text-center"
          >
            <span>
              {currentStep === steps.length - 1 
                ? (language === 'es' ? 'Entendido, ¡Listo!' : language === 'en' ? 'Got it, Done!' : 'Entendi, Concluir')
                : (language === 'es' ? 'Siguiente Paso' : language === 'en' ? 'Next Step' : 'Próxima Orientação')
              }
            </span>
            {currentStep === steps.length - 1 ? (
              <Award className="h-4 w-4 text-sky-200" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
