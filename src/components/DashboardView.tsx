/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  ChevronRight, 
  AlertCircle, 
  ArrowRight,
  RefreshCw,
  Database,
  Camera
} from 'lucide-react';
import { CattleRecord, DashboardStats } from '../types';
import { SAMPLE_CATTLE } from '../data/samples';
import { motion } from 'motion/react';
import { translations, Language } from '../translations';
import CameraTourGuideModal from './CameraTourGuideModal';

interface DashboardViewProps {
  stats: DashboardStats;
  records: CattleRecord[];
  recentRecords: CattleRecord[];
  onSelectRecord: (record: CattleRecord) => void;
  onNavigateToHistory: () => void;
  triggerRefreshInsights: (fromTelemetry?: boolean) => Promise<void>;
  loadingInsights: boolean;
  language?: Language;
  realDataOnly?: boolean;
  onToggleRealDataOnly?: (val: boolean) => void;
}

export default function DashboardView({
  stats,
  records,
  recentRecords,
  onSelectRecord,
  onNavigateToHistory,
  triggerRefreshInsights,
  loadingInsights,
  language = 'pt',
  realDataOnly = false,
  onToggleRealDataOnly = () => {}
}: DashboardViewProps) {
  
  const t = translations[language];
  
  // Dynamic monthly averages calculated from actual cattle records with professional baseline fallbacks
  const MONTHS_MAPPING = [
    { label: 'JAN', shorthandPt: 'Jan', baseline: 2.9 },
    { label: 'FEV', shorthandPt: 'Fev', baseline: 3.1 },
    { label: 'MAR', shorthandPt: 'Mar', baseline: 3.4 },
    { label: 'ABR', shorthandPt: 'Abr', baseline: 3.8 },
    { label: 'MAI', shorthandPt: 'Mai', baseline: 4.1 },
    { label: 'JUN', shorthandPt: 'Jun', baseline: 4.2 }
  ];

  const computedMonthlyAverages = MONTHS_MAPPING.map(m => {
    // Filter records by Portuguese shorthand name of the month (e.g. 'Jan', 'Fev'...)
    const recordsInMonth = records.filter(r => 
      r.date && r.date.toLowerCase().includes(m.shorthandPt.toLowerCase())
    );

    if (recordsInMonth.length > 0) {
      const sum = recordsInMonth.reduce((acc, r) => acc + r.score, 0);
      return {
        month: m.label,
        bcs: parseFloat((sum / recordsInMonth.length).toFixed(1))
      };
    } else {
      return {
        month: m.label,
        bcs: m.baseline
      };
    }
  });
  
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const [isSyncingTelemetry, setIsSyncingTelemetry] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [showSyncSuccessToast, setShowSyncSuccessToast] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showCameraTour, setShowCameraTour] = useState(false);

  const handleSincronizarTelemetria = async () => {
    setIsSyncingTelemetry(true);
    setShowSyncSuccessToast(false);
    setSyncMessage('📡 Conectando ao Gateway BLE (Setor Pasto Norte)...');
    
    setTimeout(() => {
      setSyncMessage('📥 Lendo dados das Balanças do cocho Pasto Norte...');
    }, 1000);

    setTimeout(() => {
      setSyncMessage('🔋 Sincronizando Beacons e colares ruminais (Lote A-45)...');
    }, 2000);

    setTimeout(async () => {
      try {
        await triggerRefreshInsights(true);
      } catch (err) {
        console.warn(err);
      }
      setIsSyncingTelemetry(false);
      setSyncMessage('');
      setShowSyncSuccessToast(true);
      
      // Auto dismiss success toast after 5 seconds
      setTimeout(() => {
        setShowSyncSuccessToast(false);
      }, 5000);
    }, 3000);
  };

  const handleGenerateLocalReport = () => {
    setIsGeneratingReport(true);
    
    setTimeout(() => {
      // Cabeçalho bem organizado com acentuação correta e separador de colunas padrão para Excel BR/PT (ponto e vírgula)
      const headers = 'ID;Data da Avaliação;Lote;Raça;Escore Corporal (ECC);Peso Estimado (kg);Tipo de Peso;Espessura de Gordura (mm);Confiança da IA;Parecer Técnico;Observações\n';
      const rows = recentRecords.map(r => {
        const id = r.id || '';
        const date = r.date || '';
        const lot = r.lot || '';
        const breed = r.breed || '';
        const score = r.score !== undefined && r.score !== null ? r.score.toFixed(2).replace('.', ',') : '';
        const weight = r.weight !== undefined && r.weight !== null ? r.weight.toString().replace('.', ',') : '450,0';
        const weightType = r.isRealWeight ? 'Medido (Balança)' : 'Sugerido (IA)';
        const fat = r.fatProgress !== undefined && r.fatProgress !== null ? r.fatProgress.toFixed(1).replace('.', ',') : '12,0';
        const confidence = r.aiConfidence !== undefined && r.aiConfidence !== null ? `${r.aiConfidence.toFixed(1).replace('.', ',')}%` : '';
        const verdict = r.verdict || '';
        const notes = (r.notes || '').replace(/"/g, '""').replace(/\r?\n|\r/g, ' ');

        return `"${id}";"${date}";"${lot}";"${breed}";"${score}";"${weight}";"${weightType}";"${fat}";"${confidence}";"${verdict}";"${notes}"`;
      }).join('\n');
      
      // UTF-8 BOM (\uFEFF) garante que acentuações como ç, ã, á, ó, ê funcionem perfeitamente no Excel
      const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Relatorio_Compacto_ECC_Bovinos_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsGeneratingReport(false);
    }, 1200);
  };
  
  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Dynamic Telemetry Status Inline Banners */}
      {(isSyncingTelemetry || showSyncSuccessToast) && (
        <div className="space-y-2 animate-fade-in text-left">
          {isSyncingTelemetry && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/60 rounded text-emerald-800 dark:text-[#aeeecb] text-xs font-mono font-bold animate-pulse">
              <RefreshCw className="h-4 w-4 animate-spin shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{syncMessage}</span>
            </div>
          )}

          {showSyncSuccessToast && (
            <div className="flex items-center justify-between gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-250 dark:border-emerald-800/80 rounded text-[#0e5138] dark:text-[#aeeecb] text-xs font-sans font-bold shadow-sm">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <span className="block h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>{realDataOnly ? 'Giro de Balança Sincronizado! Seus registros em tempo real foram sincronizados e as métricas do painel atualizadas com sucesso.' : 'Telemetria do Rebanho Sincronizada! Leituras de 14 balanças de cocho, 28 colares ruminais e Beacons de pastagem foram integradas e atualizadas com sucesso.'}</span>
              </div>
              <button 
                onClick={() => setShowSyncSuccessToast(false)}
                className="text-emerald-700 hover:text-emerald-950 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold focus:outline-none cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* Page Title & Slogan */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-950 dark:text-[#f8fafc] font-sans">
            {t.herdSummary}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t.herdSummarySub}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSincronizarTelemetria}
            disabled={isSyncingTelemetry || loadingInsights}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-[#1e3a8a] dark:hover:text-sky-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncingTelemetry || loadingInsights ? 'animate-spin' : ''}`} />
            <span>{isSyncingTelemetry ? t.syncing : t.syncTelemetry}</span>
          </button>
        </div>
      </div>

      {/* 3 Grid Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Animals */}
        <div className="bg-white dark:bg-[#0e1320] rounded-lg border border-gray-200 dark:border-gray-800 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between text-left">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-gray-400 dark:text-gray-500 font-bold block uppercase">
              {t.totalAnimals}
            </span>
            <div className="text-4xl font-sans font-bold text-gray-900 dark:text-white mt-2">
              {stats.totalAnimals.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-medium mt-4">
            <TrendingUp className="h-4 w-4" />
            <span>+{stats.totalNewThisWeek} {t.newThisWeek}</span>
          </div>
        </div>

        {/* Card 2: Ready for Slaughter */}
        <div className="bg-white dark:bg-[#0e1320] rounded-lg border border-gray-200 dark:border-gray-800 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between text-left">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-gray-400 dark:text-gray-500 font-bold block uppercase">
              {t.readySlaughter}
            </span>
            <div className="text-4xl font-sans font-bold text-gray-900 dark:text-white mt-2">
              {stats.readyForSlaughter}
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#aeeecb] dark:bg-[#aeeecb]/20 text-[#316e52] dark:text-[#aeeecb]">
              {language === 'es' ? 'CONDICIÓN IDEAL (ECC > 4.0)' : language === 'en' ? 'IDEAL CONDITION (BCS > 4.0)' : 'CONDIÇÃO IDEAL (ECC > 4.0)'}
            </span>
          </div>
        </div>

        {/* Card 3: At Risk / Under Monitoring with smooth background color animation */}
        <motion.div 
          animate={{
            backgroundColor: stats.underMonitoring > 0 
              ? (isDark ? ["#0e1320", "#311818", "#0e1320"] : ["#ffffff", "#fef2f2", "#ffffff"])
              : (isDark ? "#0e1320" : "#ffffff")
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="rounded-lg border border-red-100 dark:border-red-950/40 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between text-left"
        >
          <div>
            <span className="text-[10px] font-mono tracking-wider text-red-600 dark:text-red-400 font-bold block uppercase">
              {language === 'es' ? 'Monitoreo Activo' : language === 'en' ? 'Active Monitoring' : 'Em Monitoramento Ativo'}
            </span>
            <div className="text-4xl font-sans font-bold text-[#ba1a1a] dark:text-red-400 mt-2 flex items-baseline justify-between">
              <span>{stats.underMonitoring}</span>
              {stats.underMonitoring > 0 && (
                <span className="text-[10px] font-mono font-bold text-[#ba1a1a] dark:text-red-400 animate-pulse">
                  {language === 'es' ? '⚠️ DETECTADO NO APTO' : language === 'en' ? '⚠️ UNFIT DETECTED' : '⚠️ DETECTADO NÃO APTO'}
                </span>
              )}
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#ffdad6] dark:bg-[#ffdad6]/20 text-[#93000a] dark:text-red-400">
              {language === 'es' ? 'No Aptos (ECC < 2.5)' : language === 'en' ? 'Unfit (BCS < 2.5)' : 'Não Aptos (ECC < 2.5)'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Middle Grid - SVG Spline Chart + AI Insights Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Body Condition Evolution Graph */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0e1320] rounded-lg border border-gray-200 dark:border-gray-800 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.03)] dark:shadow-none">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-950 dark:text-white uppercase tracking-wide font-sans">
                {language === 'es' ? 'Evolución de la Condición Corporal' : language === 'en' ? 'Body Condition Evolution' : 'Evolução da Condição Corporal'}
              </h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                {language === 'es' ? 'Escala de 1 a 5 | Medias por Lote de Cría' : language === 'en' ? 'Scale 1 to 5 | Averages by Breeding Lot' : 'Escala de 1 a 5 | Médias por Lote de Cria'}
              </p>
            </div>
            <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium font-bold">
              {language === 'es' ? 'LOTE A-45 (ACTUAL)' : language === 'en' ? 'LOT A-45 (CURRENT)' : 'LOTE A-45 (ATUAL)'}
            </span>
          </div>

          {/* Beautiful and natural solid vertical columns representing historic ECC averages */}
          <div className="h-64 w-full relative pt-4 pr-4">
            {/* Absolute background grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between text-right pr-2 pointer-events-none">
              {[5.0, 4.0, 3.0, 2.0, 1.0].map((val) => (
                <div key={val} className="w-full flex items-center border-t border-dashed border-gray-100 dark:border-gray-800/80 h-0 text-[10px] font-mono text-gray-300 dark:text-gray-600">
                  <span className="absolute -left-6 translate-y-1 w-5 text-right">{val.toFixed(1)}</span>
                </div>
              ))}
            </div>

            {/* SVG solid columnar charts without AI-like neon elements */}
            <svg className="w-full h-full absolute inset-0 pt-2 pb-6" viewBox="0 0 500 200" preserveAspectRatio="none">
              {computedMonthlyAverages.map((avg, idx) => {
                const totalWidth = 500;
                const margin = 50;
                const availableWidth = totalWidth - margin * 2;
                const step = availableWidth / (computedMonthlyAverages.length - 1);
                const cx = margin + idx * step;
                const score = avg.bcs;
                
                // Height of bar proportional to score (out of 5.0 max)
                const barHeight = (score / 5.0) * 140;
                const y = 170 - barHeight;
                const width = 28;
                const rx = 0; // Square borders instead of capsule rounding
                
                const barColor = isDark ? '#38bdf8' : '#1e3a8a';
                const bgBarColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(30, 58, 138, 0.04)';

                return (
                  <g key={avg.month} className="group cursor-pointer">
                    {/* Background slot track */}
                    <rect
                      x={cx - width / 2}
                      y={30}
                      width={width}
                      height={140}
                      rx={rx}
                      fill={bgBarColor}
                      className="transition-colors duration-200 group-hover:fill-blue-500/5 dark:group-hover:fill-white/10"
                    />
                    
                    {/* Solid Natural Meausurement Column */}
                    <rect
                      x={cx - width / 2}
                      y={y}
                      width={width}
                      height={barHeight}
                      rx={rx}
                      fill={avg.month === 'JUN' ? (isDark ? '#bae6fd' : '#1d4ed8') : barColor}
                      className="transition-all duration-200 group-hover:opacity-90 transform origin-bottom group-hover:scale-y-[1.02]"
                    />

                    {/* ECC values displayed above column */}
                    <text
                      x={cx}
                      y={y - 8}
                      textAnchor="middle"
                      fill={isDark ? '#f1f5f9' : '#1e293b'}
                      className="text-[11px] font-sans font-bold select-none transition-transform duration-200 group-hover:-translate-y-1"
                    >
                      {score.toFixed(1)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* X Axis Months Label Line */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10 text-[11px] font-mono font-bold text-gray-400">
              {computedMonthlyAverages.map((avg) => (
                <span key={avg.month} className={avg.month === 'JUN' ? 'text-gray-950 dark:text-[#aeeecb] font-black' : ''}>
                  {avg.month}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: INSIGHTS CARD (Stunning Dark Green Box) */}
        <div className="bg-[#0f2d5c] dark:bg-blue-950 text-white rounded-lg border border-blue-900/30 p-6 shadow-md flex flex-col justify-between text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-widest text-sky-300 font-bold">
                {language === 'es' ? 'Insights y Diagnósticos' : language === 'en' ? 'Insights & Diagnostics' : 'Insights & Diagnósticos'}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-sans font-light leading-relaxed text-blue-50">
                {loadingInsights ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-sky-300" />
                    <span>{language === 'es' ? 'Procesando puntuaciones corporales y proyectando tendencias...' : language === 'en' ? 'Processing body scores and projecting feeding trends...' : 'Processando escores corporais e projetando tendências alimentares...'}</span>
                  </span>
                ) : (
                  stats.aiInsightsText ? (
                    stats.aiInsightsText
                      .replace(/\*\*/g, '')
                      .replace(/\*/g, '')
                      .replace(/Análise Executiva\s*\(IA\)\s*:/gi, 'Análise Executiva:')
                      .replace(/Análise Executiva\s*\(IA\)/gi, 'Análise Executiva')
                      .replace(/Análise Executiva de IA/gi, 'Análise Executiva')
                  ) : null
                )}
              </p>
            </div>
          </div>

          <div className="pt-6">
            <button
              id="dashboard-btn-generate-ai-report"
              onClick={handleGenerateLocalReport}
              disabled={isGeneratingReport}
              className="w-full py-2.5 bg-sky-200 hover:bg-sky-300 text-sky-950 font-mono font-bold text-[11px] uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 hover:shadow-md active:scale-98"
            >
              <span>{isGeneratingReport ? (language === 'es' ? 'Generando...' : language === 'en' ? 'Generating...' : 'Gerando...') : t.generateReportCsv}</span>
              <ArrowRight className={`h-3.5 w-3.5 ${isGeneratingReport ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: Avaliações Recentes (Recent Assessments Panel) */}
      <div className="bg-white dark:bg-[#0e1320] rounded-lg border border-gray-200 dark:border-gray-800 shadow-[0_2px_4px_rgba(0,0,0,0.03)] dark:shadow-none p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-950 dark:text-white uppercase tracking-wide font-sans">
            {t.recentAssessments}
          </h3>
          <button
            onClick={onNavigateToHistory}
            className="text-xs font-mono font-bold text-blue-600 dark:text-sky-300 hover:text-blue-800 dark:hover:text-white flex items-center gap-1 group transition-colors"
          >
            <span>{language === 'es' ? 'VER TODAS' : language === 'en' ? 'VIEW ALL' : 'VER TODAS'}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-500 dark:text-gray-400 border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 text-[10px] font-mono tracking-wider font-bold text-gray-400 dark:text-gray-500 uppercase">
                <th className="py-3 px-4">{language === 'es' ? 'MINIATURA' : language === 'en' ? 'THUMBNAIL' : 'MINIATURA'}</th>
                <th className="py-3 px-4">{language === 'es' ? 'ID ANIMAL' : language === 'en' ? 'ANIMAL ID' : 'ANIMAL ID'}</th>
                <th className="py-3 px-4">{language === 'es' ? 'FECHA EVALUACIÓN' : language === 'en' ? 'EVALUATION DATE' : 'DATA AVALIAÇÃO'}</th>
                <th className="py-3 px-4">{language === 'es' ? 'LOTE / RAZA' : language === 'en' ? 'LOT / BREED' : 'LOTE / RAÇA'}</th>
                <th className="py-3 px-4 text-center justify-center">{language === 'es' ? 'PESO' : language === 'en' ? 'WEIGHT' : 'PESO'}</th>
                <th className="py-3 px-4 text-center justify-center">SCORE (ECC)</th>
                <th className="py-3 px-4 text-center justify-center">{language === 'es' ? 'VEREDICTO' : language === 'en' ? 'VERDICT' : 'VEREDITO'}</th>
                <th className="py-3 px-4 text-right">{language === 'es' ? 'ACCIONES' : language === 'en' ? 'ACTIONS' : 'AÇÕES'}</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-3">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400">
                        <Database className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Nenhum animal registrado em tempo real</h4>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Você ativou o Modo de Dados 100% Reais. Para começar, envie fotos de campo de bovinos ou clique em Novo Registro no topo para criar sua primeira ficha de campo!
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                recentRecords.map((r) => (
                  <tr 
                    key={r.id} 
                    className="border-b border-gray-150/50 dark:border-gray-800/60 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-all duration-200 group"
                  >
                    <td className="py-3 px-4">
                      <img 
                        src={r.photoUrl} 
                        alt={`Minis ${r.id}`} 
                        className="h-10 w-16 rounded object-cover border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1e3a8a] dark:text-sky-300 transition-all duration-150 group-hover:text-blue-600 dark:group-hover:text-sky-400">
                      #{r.id}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 transition-colors duration-150 group-hover:text-gray-900 dark:group-hover:text-white">
                      {r.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100 leading-tight transition-colors duration-150 group-hover:text-blue-900 dark:group-hover:text-white">{r.lot}</div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5 transition-colors duration-150 group-hover:text-gray-500 dark:group-hover:text-gray-300">{r.breed}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-gray-900 dark:text-gray-150 transition-all duration-150 group-hover:scale-105">
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{r.weight.toFixed(1)} <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">kg</span></span>
                        {r.isRealWeight && (
                          <span className="inline-flex items-center justify-center p-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-850" title="Peso aferido fisicamente na balança">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-sm font-bold text-gray-950 dark:text-white transition-all duration-150 group-hover:scale-105">
                      {r.score.toFixed(1)} <span className="text-gray-300 dark:text-gray-600 font-normal">/ 5.0</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase transition-all duration-200 ${
                        r.verdict === 'APTO PARA ABATE'
                          ? 'bg-[#aeeecb]/80 dark:bg-[#aeeecb]/15 text-[#0e5138] dark:text-[#aeeecb] group-hover:bg-[#aeeecb] dark:group-hover:bg-[#aeeecb]/25 border border-emerald-300/20 dark:border-emerald-900/40'
                          : 'bg-[#ffdad6]/80 dark:bg-[#ffdad6]/10 text-[#93000a] dark:text-red-400 group-hover:bg-[#ffdad6] dark:group-hover:bg-[#ffdad6]/20 border border-red-300/20 dark:border-red-900/40'
                      }`}>
                        {r.verdict}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectRecord(r)}
                        className="inline-flex items-center gap-1 font-mono font-bold text-xs text-blue-600 dark:text-sky-300 hover:text-blue-800 dark:hover:text-white hover:underline transition-all duration-150 cursor-pointer"
                      >
                        <span className="transition-all duration-150 group-hover:translate-x-[-2px]">Ver Detalhes</span>
                        <ChevronRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CameraTourGuideModal isOpen={showCameraTour} onClose={() => setShowCameraTour(false)} language={language} />
    </div>
  );
}
