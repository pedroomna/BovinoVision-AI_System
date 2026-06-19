import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ShieldCheck, Eye, Sparkles } from 'lucide-react';

interface SplashIntroProps {
  onComplete: () => void;
}

export default function SplashIntro({ onComplete }: SplashIntroProps) {
  const [progress, setProgress] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isCheckingNodes, setIsCheckingNodes] = useState(false);

  useEffect(() => {
    // Elegant loading progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Accelerate when closer to completion
        const increment = prev < 50 ? Math.random() * 8 + 4 : Math.random() * 12 + 6;
        return Math.min(prev + increment, 100);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress > 45) {
      setIsCheckingNodes(true);
    }
    if (progress === 100) {
      // Auto transition slightly after completion, or user can click
      const timeout = setTimeout(() => {
        handleEnter();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [progress]);

  const handleEnter = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onComplete();
    }, 600); // Wait for exit animation
  };

  // High-tech geometric bovine face lines (symmetric absolute coordinate ratios)
  const drawLine = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (custom: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: custom * 0.1, type: 'spring', duration: 1.5, bounce: 0 },
        opacity: { delay: custom * 0.1, duration: 0.3 }
      }
    })
  };

  return (
    <AnimatePresence>
      {!isLeaving && (
        <motion.div
          id="splash-screen-container"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-radial from-[#041E15] via-[#02100B] to-[#010604] select-none overflow-hidden p-4 text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -40, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Cybernetic Tech Scan Grid Backdrop */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-down from-emerald-950/20 to-transparent pointer-events-none" />
          
          {/* Interactive Scanning HUD ring overlay */}
          <div className="relative flex flex-col items-center justify-center max-w-md w-full px-4">
            
            {/* Pulsing Outer Circle Grid */}
            <motion.div 
              className="absolute w-72 h-72 md:w-80 md:h-80 rounded-full border border-emerald-500/10 flex items-center justify-center pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
            >
              <div className="absolute top-0 w-2 h-2 rounded-full bg-emerald-400 blur-[2px]" />
              <div className="absolute bottom-0 w-2 h-2 rounded-full bg-emerald-400 blur-[2px]" />
              <div className="absolute w-[90%] h-[90%] rounded-full border border-dashed border-emerald-500/5" />
            </motion.div>

            {/* Glowing Laser Scan Bar */}
            <motion.div
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-right from-transparent via-emerald-400/80 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.8)] z-10 pointer-events-none"
              style={{ width: '80%', left: '10%' }}
              animate={{ 
                top: ['15%', '65%', '15%']
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4.5, 
                ease: 'easeInOut' 
              }}
            />

            {/* CUSTOM GEOMETRIC SPECULAR BOVINE LOGO (SVG) */}
            <motion.div 
              className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center z-20 cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={progress === 100 ? handleEnter : undefined}
            >
              <svg 
                viewBox="0 0 200 200" 
                className="w-full h-full text-emerald-400 dark:text-[#aeeecb] drop-shadow-[0_0_15px_rgba(52,211,153,0.35)]"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* SVG Definitions */}
                <defs>
                  <linearGradient id="bullGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Cybernetic Bounding Box corners */}
                <path d="M15,15 L30,15 M15,15 L15,30" stroke="#047857" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <path d="M185,15 L170,15 M185,15 L185,30" stroke="#047857" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <path d="M15,185 L30,185 M15,185 L15,170" stroke="#047857" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <path d="M185,185 L170,185 M185,185 L185,170" stroke="#047857" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

                {/* 1. Horns (Chifres Simétricos e Futuristas) */}
                {/* Left Horn */}
                <motion.path 
                  d="M 85 65 C 65 60, 45 40, 38 18 C 34 10, 36 8, 42 12 C 55 25, 75 52, 85 64" 
                  stroke="url(#bullGlow)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  variants={drawLine}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                />
                {/* Right Horn */}
                <motion.path 
                  d="M 115 65 C 135 60, 155 40, 162 18 C 166 10, 164 8, 158 12 C 145 25, 125 52, 115 64" 
                  stroke="url(#bullGlow)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  variants={drawLine}
                  initial="hidden"
                  animate="visible"
                  custom={1.2}
                />

                {/* 2. Ears (Relacionamento de Carcaça e Angulação) */}
                {/* Left Ear */}
                <motion.path 
                  d="M 68 75 L 34 88 L 65 98 Z" 
                  stroke="url(#bullGlow)" 
                  strokeWidth="2" 
                  strokeLinejoin="round"
                  variants={drawLine}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                />
                {/* Right Ear */}
                <motion.path 
                  d="M 132 75 L 166 88 L 135 98 Z" 
                  stroke="url(#bullGlow)" 
                  strokeWidth="2" 
                  strokeLinejoin="round"
                  variants={drawLine}
                  initial="hidden"
                  animate="visible"
                  custom={2.2}
                />

                {/* 3. Main Face Shield (Escudo geométrico da cabeça) */}
                <motion.path 
                  d="M 85 65 L 115 65 L 132 75 L 122 135 L 100 162 L 78 135 L 68 75 Z" 
                  stroke="url(#bullGlow)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  variants={drawLine}
                  initial="hidden"
                  animate="visible"
                  custom={3}
                />

                {/* 4. Muzzle & Nostrils (Focinho Geométrico) */}
                <motion.path 
                  d="M 86 130 L 114 130" 
                  stroke="url(#bullGlow)" 
                  strokeWidth="1.5" 
                  variants={drawLine}
                  initial="hidden"
                  animate="visible"
                  custom={4.5}
                />
                <motion.path 
                  d="M 90 142 L 100 148 L 110 142" 
                  stroke="url(#bullGlow)" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  variants={drawLine}
                  initial="hidden"
                  animate="visible"
                  custom={5.2}
                />

                {/* 5. Glowing Vision Tracker Targets (Círculos e retículos de IA) */}
                {/* Left Eye AI Tracker */}
                <motion.circle 
                  cx="82" 
                  cy="92" 
                  r="5" 
                  stroke="#10B981" 
                  strokeWidth="1.5"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                />
                <motion.circle 
                  cx="82" 
                  cy="92" 
                  r="1.5" 
                  fill="#6EE7B7" 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />

                {/* Right Eye AI Tracker */}
                <motion.circle 
                  cx="118" 
                  cy="92" 
                  r="5" 
                  stroke="#10B981" 
                  strokeWidth="1.5"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                />
                <motion.circle 
                  cx="118" 
                  cy="92" 
                  r="1.5" 
                  fill="#6EE7B7" 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />

                {/* Forehead Tech Grid Crosshair */}
                <motion.path 
                  d="M 100 82 L 100 94 M 94 88 L 106 88" 
                  stroke="#10B981" 
                  strokeWidth="1"
                  opacity="0.8"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.8 }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                />
                
                {/* 6. Precision scan dots / biometric points nodes (Pontos ECC) */}
                {isCheckingNodes && (
                  <>
                    {/* Node 1: Garupa */}
                    <motion.circle 
                      cx="65" 
                      cy="115" 
                      r="3" 
                      fill="#34D399" 
                      filter="url(#glow)"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    {/* Node 2: Costelas */}
                    <motion.circle 
                      cx="135" 
                      cy="115" 
                      r="3" 
                      fill="#34D399" 
                      filter="url(#glow)"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 1, delay: 0.2, repeat: Infinity }}
                    />
                    {/* Node 3: Inserção de Cauda */}
                    <motion.circle 
                      cx="100" 
                      cy="75" 
                      r="2.5" 
                      fill="#6EE7B7" 
                      filter="url(#glow)"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, delay: 0.4, repeat: Infinity }}
                    />
                    {/* Intersecting biometric telemetry lines */}
                    <motion.path 
                      d="M 65 115 L 100 75 L 135 115" 
                      stroke="#10b981" 
                      strokeWidth="0.75" 
                      strokeDasharray="4 3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                    />
                  </>
                )}
              </svg>

              {/* Central Glowing Bull-Eye Pulsar */}
              <div className="absolute top-[44%] left-[45%] w-6 h-6 rounded-full bg-emerald-500/15 animate-ping pointer-events-none" />
            </motion.div>

            {/* System Name Header */}
            <div className="text-center mt-6 space-y-2 z-20">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-400 shrink-0 animate-pulse" />
                  <span className="font-sans font-extrabold text-2xl tracking-tight text-[#aeeecb] bg-clip-text">
                    BovinoVision AI
                  </span>
                </div>
              </motion.div>

              <motion.p
                className="text-gray-400 font-mono tracking-[0.2em] text-[10px] md:text-xs font-bold uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                Visão Computacional & Escore Corporal
              </motion.p>
            </div>

            {/* High Tech HUD Telemetry Loading state */}
            <div className="w-full mt-10 space-y-4 z-20">
              {/* Progress Bar Container */}
              <div className="relative h-1.5 w-full bg-emerald-950/40 rounded-full border border-emerald-900/30 overflow-hidden shadow-inner">
                <motion.div 
                  className="h-full bg-gradient-to-right from-emerald-500 to-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeInOut' }}
                />
              </div>

              {/* Status information */}
              <div className="flex items-center justify-between font-mono text-[9px] md:text-[10px] text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                  <span>
                    {progress < 30 ? 'Inicializando rede neural...' :
                     progress < 60 ? 'Mapeando vértices biométricos...' :
                     progress < 90 ? 'Conectando ao núcleo inteligente...' :
                     'Dispositivo móvel calibrado e pronto.'}
                  </span>
                </div>
                <span className="text-emerald-400 font-bold">{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Animated Status Indicator (Hands-free transition on completion) */}
            <div className="h-14 mt-6 flex items-center justify-center z-20 w-full">
              <AnimatePresence>
                {progress === 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.85, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-emerald-400 font-mono tracking-widest text-[11px] font-bold uppercase flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4 animate-spin-slow" />
                    <span>Acesso Autorizado • Inicializando</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Signature Badge */}
            <motion.div 
              className="mt-6 flex items-center gap-1 font-mono text-[9px] text-[#047857]/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.5 }}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Conexão Encriptada Móvel • Securitizada</span>
            </motion.div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
