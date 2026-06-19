/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  X, 
  FileText, 
  Lock, 
  Code2, 
  LifeBuoy, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Copy, 
  Check,
  ChevronRight,
  Database,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface FooterModalProps {
  initialTab: 'terms' | 'privacy' | 'support';
  onClose: () => void;
}

export default function FooterModal({ initialTab, onClose }: FooterModalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'support'>(initialTab);
  const [copiedText, setCopiedText] = useState(false);
  
  // Support form state
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportType, setSupportType] = useState('ECC / Visão Computacional');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSendingState, setSupportSendingState] = useState<'idle' | 'sending' | 'success'>('idle');
  const [supportProgress, setSupportProgress] = useState(0);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName || !supportEmail || !supportMessage) return;

    setSupportSendingState('sending');
    setSupportProgress(10);

    const interval = setInterval(() => {
      setSupportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSupportSendingState('success');
          return 100;
        }
        return prev + 15;
      });
    }, 120);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#0e1320] w-full max-w-4xl h-[85vh] md:h-[75vh] flex flex-col rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        
        {/* Header bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-950/30 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-100 dark:bg-blue-950/60 rounded-lg text-[#1e3a8a] dark:text-sky-300">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Portal de Conformidade e Integração
              </h2>
              <p className="text-xs text-gray-500 dark:text-sky-400 font-mono mt-0.5">
                BovinoVision AI • Pecuária de Precisão Integrada
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800/65 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-sky-300 transition-colors cursor-pointer focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body with Left Sidebar Tabs and Right Panels */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Sidebar tabs */}
          <div className="w-full md:w-64 bg-gray-50/50 dark:bg-gray-950/20 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible shrink-0 scrollbar-none">
            
            <button
              onClick={() => setActiveTab('terms')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-lg text-xs font-bold font-sans tracking-wide transition-all duration-150 cursor-pointer focus:outline-none shrink-0 md:shrink ${
                activeTab === 'terms'
                  ? 'bg-[#1e3a8a] text-white dark:bg-[#1e3a8a]/20 dark:text-sky-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-850/60 hover:text-gray-900 dark:hover:text-sky-300'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Termos de Serviço</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-lg text-xs font-bold font-sans tracking-wide transition-all duration-150 cursor-pointer focus:outline-none shrink-0 md:shrink ${
                activeTab === 'privacy'
                  ? 'bg-[#1e3a8a] text-white dark:bg-[#1e3a8a]/20 dark:text-sky-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-850/60 hover:text-gray-900 dark:hover:text-sky-300'
              }`}
            >
              <Lock className="h-4 w-4" />
              <span>Política de Privacidade</span>
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-lg text-xs font-bold font-sans tracking-wide transition-all duration-150 cursor-pointer focus:outline-none shrink-0 md:shrink ${
                activeTab === 'support'
                  ? 'bg-[#1e3a8a] text-white dark:bg-[#1e3a8a]/20 dark:text-sky-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-850/60 hover:text-gray-900 dark:hover:text-sky-300'
              }`}
            >
              <LifeBuoy className="h-4 w-4" />
              <span>Suporte Técnico</span>
            </button>

            <div className="hidden md:block mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 px-3">
              <div className="text-[10px] font-mono text-gray-400 dark:text-sky-600 leading-normal">
                <span>Versão Executiva 2.7.2</span>
                <br />
                <span>Status: Todos os nós Online</span>
              </div>
            </div>
          </div>

          {/* Right Pane with scrolling view */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white dark:bg-[#0e1320] scrollbar-thin">
            
            {/* TABS 1: Terms of Service */}
            {activeTab === 'terms' && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Termos de Uso do BovinoVision AI
                  </h3>
                  <p className="text-xs text-gray-550 dark:text-sky-400/80 font-mono mt-1">
                    Última Atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase())} • Versão 24.2
                  </p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/30 flex items-start gap-3">
                  <span className="p-1 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-800 dark:text-amber-400 mt-0.5">
                    <LifeBuoy className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">Isenção de Responsabilidade Diagnóstica</h4>
                    <p className="text-xs text-amber-800/90 dark:text-amber-400/80 mt-1 leading-relaxed">
                      Todas as telemetrias fornecidas pelo sistema – incluindo o Escore de Condição Corporal (ECC), pesos estimados e volume de carcaça – constituem estimativas estatísticas baseadas em análise visual computadorizada inteligente (modelos YOLOv8). Elas destinam-se a otimizar o manejo de fazendas e triagem para exportação, devendo ser interpretadas sob a supervisão final de médicos veterinários e zootecnistas credenciados.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                      <span className="h-1.5 w-1.5 bg-[#1e3a8a] dark:bg-sky-400 rounded-full"></span>
                      1. Licenciamento e Propriedade de Dados
                    </h4>
                    <p>
                      Ao criar ou de forma contínua operar uma conta BovinoVision AI, é concedida a você uma licença pessoal, não-exclusiva e intransferível de uso do software para análise do seu rebanho agropecuário. Todos os dados coletados de peso e registros bovinos do dispositivo pertencem exclusivamente ao usuário licenciado.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                      <span className="h-1.5 w-1.5 bg-[#1e3a8a] dark:bg-sky-400 rounded-full"></span>
                      2. Disponibilidade do Serviço de Visão Offline
                    </h4>
                    <p>
                      Compreendemos que fazendas encontram-se frequentemente em áreas remotas. Os algoritmos do BovinoVision AI oferecem suporte completo a avaliações offline por meio de sincronização incremental inteligente de banco de dados (`indexDB` e `localStorage`), garantindo que nenhuma biometria de campo seja perdida caso falte rede de dados.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                      <span className="h-1.5 w-1.5 bg-[#1e3a8a] dark:bg-sky-400 rounded-full"></span>
                      3. Alteração e Reajustes
                    </h4>
                    <p>
                      Reservamo-nos o direito de ajustar algoritmos de visão e segmentação para acompanhar avanços da Embrapa e pesquisas focadas no cruzamento de matrizes zebuínas de altíssima produtividade.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TABS 2: Privacy Policy */}
            {activeTab === 'privacy' && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Política de Privacidade de Biometria Animal
                  </h3>
                  <p className="text-xs text-gray-550 dark:text-sky-400/80 font-mono mt-1">
                    Foco na Proteção do Produtor Rural e sua Propriedade
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-blue-950/10 border border-gray-100 dark:border-blue-950/50">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
                      <Lock className="h-4 w-4 text-[#1e3a8a] dark:text-sky-300" />
                      Dados Seguros e Locais
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                      A coleta de fotos de matrizes e as pesagens estimadas são priorizadas localmente. Fotos submetidas para análise são criptografadas em base64 e enviadas para modelos locais ou APIs dedicadas de forma 100% privada.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-blue-950/10 border border-gray-100 dark:border-blue-950/50">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
                      <Layers className="h-4 w-4 text-[#1e3a8a] dark:text-sky-300" />
                      Criptografia de Ponto Posterior
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                      A segmentação tridimensional utiliza processamento estruturado transparente. Nenhuma coordenada geográfica exata de divisas de pastos é divulgada publicamente para garantir a segurança de sua propriedade.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">Controle Absoluto de Dados</h4>
                    <p>
                      Vocês, produtores, detêm controle absoluto dos dados em toda a esteira do sistema. Em caso de necessidade de exclusão total ou parcial de relatórios de lote, exportação de arquivos, substituição de diagnósticos ou portabilidade, nosso sistema de relatórios permite a purgação imediata em um clique sob suas configurações de navegador.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">Conformidade com Legislações Agro-Legais</h4>
                    <p>
                      Nós obedecemos rigorosamente à Lei Geral de Proteção de Dados (LGPD) brasileira. Seus registros de animais rastreáveis sob os brincos não são compartilhados com agências fiscais externas sem sua determinação ou emissão direta da correspondente GTA (Guia de Trânsito Animal).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TABS 4: Technical Support Form */}
            {activeTab === 'support' && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Suporte Veterinário & de Engenharia Agrotech
                  </h3>
                  <p className="text-xs text-gray-550 dark:text-sky-400/80 font-mono mt-1">
                    Fale com nossos técnicos de campo e cientistas de dados especializados
                  </p>
                </div>

                {supportSendingState === 'idle' && (
                  <form onSubmit={handleSendSupport} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 dark:text-sky-300 uppercase mb-1">
                          Nome do Produtor / Veterinário
                        </label>
                        <input 
                          type="text"
                          required
                          value={supportName}
                          onChange={(e) => setSupportName(e.target.value)}
                          placeholder="Ex: Dr. Pedro d'Almeida"
                          className="w-full h-10 px-3 border border-gray-200 dark:border-blue-950 rounded-xl bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-sky-300 font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 dark:text-sky-300 uppercase mb-1">
                          E-mail para Retorno do Laudo
                        </label>
                        <input 
                          type="email"
                          required
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          placeholder="Ex: pedro@bovinovision.ai"
                          className="w-full h-10 px-3 border border-gray-200 dark:border-blue-950 rounded-xl bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-sky-300 font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-400 dark:text-sky-300 uppercase mb-1">
                        Área de Incidente ou Dúvida
                      </label>
                      <select
                        value={supportType}
                        onChange={(e) => setSupportType(e.target.value)}
                        className="w-full h-10 px-3 border border-gray-200 dark:border-blue-950 rounded-xl bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-sky-300 font-sans"
                      >
                        <option value="ECC / Visão Computacional">Problemas em Avaliação Especializada de ECC</option>
                        <option value="Calibração de Câmera">Calibração e Foco de Câmera de Curral</option>
                        <option value="Banco de Lotes">Sincronização de Lotes e Banco de Dados Offline</option>
                        <option value="Planilhas e PDF">Dificuldade em Exportar Laudo Técnico ou CSV</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-400 dark:text-sky-300 uppercase mb-1">
                        Descrição do Problema na Fazenda
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        placeholder="Relate detalhadamente o comportamento inesperado ou a dificuldade com o lote..."
                        className="w-full p-3 border border-gray-200 dark:border-blue-950 rounded-xl bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-sky-300 font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      className="h-10 px-5 bg-blue-900 hover:bg-blue-950 text-white dark:bg-blue-800 dark:hover:bg-blue-700 dark:text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                    >
                      <Send className="h-4 w-4" />
                      <span>Enviar Solicitação de Diagnóstico</span>
                    </button>
                  </form>
                )}

                {supportSendingState === 'sending' && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <span className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-800 dark:text-sky-300 animate-bounce">
                      <LifeBuoy className="h-6 w-6" />
                    </span>
                    <div className="text-center">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Transmitindo Dados ao Suporte Técnico</h4>
                      <p className="text-xs text-gray-400 mt-1">Conectando ao gateway de engenharia agrícola central...</p>
                    </div>
                    
                    <div className="w-64 h-2 bg-gray-150 dark:bg-blue-900/25 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-850 bg-blue-600 transition-all duration-150 ease-out"
                        style={{ width: `${supportProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {supportSendingState === 'success' && (
                  <div className="py-8 px-6 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-105 border-blue-100 dark:border-blue-900/40 text-center flex flex-col items-center justify-center space-y-4 animate-scale-up">
                    <span className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-800 dark:text-sky-300">
                      <CheckCircle2 className="h-8 w-8" />
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Chamado Enviado com Suporte de Campo Garantido!</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                        Prezado {supportName}, sua mensagem de erro de categoria <strong>{supportType}</strong> foi cadastrada com sucesso sob o protocolo <strong>#BV-{Math.floor(Math.random() * 900000) + 100000}</strong>. Um engenheiro de campo ou zootecnista responsável entrará em contato em até 4 horas úteis no e-mail: <strong>{supportEmail}</strong>.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSupportName('');
                        setSupportEmail('');
                        setSupportMessage('');
                        setSupportSendingState('idle');
                      }}
                      className="mt-2 h-9 px-4 border border-blue-800/40 hover:border-blue-800 text-blue-800 dark:border-sky-305 dark:border-sky-300 dark:hover:border-sky-300 dark:text-sky-300 font-bold text-xs rounded-xl transition-all cursor-pointer focus:outline-none"
                    >
                      Criar Outro Chamado
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
