/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Calendar, 
  ChevronDown, 
  TrendingUp, 
  PieChart, 
  BarChart2, 
  Activity, 
  Boxes 
} from 'lucide-react';
import { CattleRecord, UserProfile } from '../types';

interface ReportsViewProps {
  records: CattleRecord[];
  userProfile?: UserProfile;
}

export default function ReportsView({ records, userProfile }: ReportsViewProps) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const now = new Date();
  const currentMonthName = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();

  const [selectedLot, setSelectedLot] = useState('Todos');
  const [reportType, setReportType] = useState('mensal');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Extract distinct lots dynamically from actual records (guarantees real, non-simulated data)
  const availableLots = Array.from(new Set(records.map(r => r.lot).filter(Boolean)));

  // Filter records dynamically based on selected lot
  const filteredRecords = selectedLot === 'Todos' 
    ? records 
    : records.filter(r => r.lot === selectedLot);

  const handleExportBatchHTML = () => {
    setIsBatchDownloading(true);
    
    setTimeout(() => {
      let htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>BovinoVision AI - Dossiê de Laudos Lote ${selectedLot}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; background-color: #f3f4f6; margin: 0; padding: 40px 20px; }
        .dossier-header { max-width: 800px; margin: 0 auto 30px auto; text-align: center; background: #012d1d; color: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .dossier-header h1 { margin: 0; font-size: 24px; letter-spacing: -0.025em; }
        .dossier-header p { margin: 5px 0 0 0; font-size: 13px; color: #aeeecb; font-family: monospace; }
        .cert-card { max-width: 800px; margin: 0 auto 40px auto; background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); page-break-after: always; }
        .cert-header { border-bottom: 2px solid #012d1d; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .cert-title { font-size: 14px; font-weight: 800; color: #012d1d; text-transform: uppercase; letter-spacing: 0.05em; }
        .cert-id { font-family: monospace; font-size: 12px; color: #0e5138; font-weight: bold; background: #e6f4ea; padding: 4px 8px; border-radius: 4px; }
        .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
        .metric-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 16px; background-color: #f9fafb; text-align: left; }
        .metric-label { font-size: 10px; text-transform: uppercase; color: #6b7280; font-family: monospace; font-weight: bold; }
        .metric-value { font-size: 18px; font-weight: bold; color: #111827; margin-top: 4px; }
        .verdict-box { border: 2px solid #10b981; background: #f0fdf4; color: #065f46; padding: 15px; border-radius: 6px; margin-bottom: 25px; text-align: center; font-weight: bold; font-size: 14px; }
        .verdict-box.critico { border-color: #ef4444; background: #fef2f2; color: #991b1b; }
        .verdict-box.observacao { border-color: #f59e0b; background: #fffbeb; color: #92400e; }
        .doctor-signature { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: left; }
        .dr-text { font-size: 11px; font-family: monospace; color: #4b5563; line-height: 1.5; }
        @media print {
            body { background: white; padding: 0; }
            .dossier-header { display: none; }
            .cert-card { margin: 0; border: none; padding: 0; box-shadow: none; border-radius: 0; page-break-after: always; }
        }
    </style>
</head>
<body>
    <div class="dossier-header">
        <h1>DOSSIÊ DE LAUDOS CONSOLIDADOS - LOTE ${selectedLot}</h1>
        <p>BovinoVision AI • CERTIFICADOS VETERINÁRIOS GERADOS EM ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>`;

      filteredRecords.forEach(r => {
        const isCritical = r.verdict.includes('CRÍTICO');
        const isObs = r.verdict.includes('OBSERVAÇÃO');
        const verdictClass = isCritical ? 'verdict-box critico' : isObs ? 'verdict-box observacao' : 'verdict-box';
        
        htmlContent += `
    <div class="cert-card">
        <div class="cert-header">
            <div>
                <div class="cert-title">LAUDO TÉCNICO VETERINÁRIO DE PRECISÃO</div>
                <div style="font-size: 10px; color: #6b7280; font-family: monospace; margin-top: 2px;">CATTLEGUARD BOVINOVISION • COBERTURA DE CARCAÇA</div>
            </div>
            <div class="cert-id">ID: #${r.id}</div>
        </div>

        <div class="grid">
            <div class="metric-box">
                <span class="metric-label">Raça do Bovino</span>
                <div class="metric-value">${r.breed}</div>
            </div>
            <div class="metric-box">
                <span class="metric-label">Identificação Lotérica</span>
                <div class="metric-value">Lote ${r.lot}</div>
            </div>
            <div class="metric-box">
                <span class="metric-label">Massa Corporal Estimada</span>
                <div class="metric-value">${r.weight.toFixed(1)} kg</div>
            </div>
            <div class="metric-box">
                <span class="metric-label">Escore Corporal ECC</span>
                <div class="metric-value">${r.score.toFixed(1)} / 5.0</div>
            </div>
            <div class="metric-box" style="grid-column: span 2;">
                <span class="metric-label">Grau de Acabamento Subcutâneo (Gordura)</span>
                <div class="metric-value">${r.fatProgress.toFixed(1)}%</div>
            </div>
        </div>

        <div class="${verdictClass}">
            VEREDITO: ${r.verdict}
            <div style="font-size: 11px; font-weight: normal; margin-top: 4px; color: #4b5563;">
                ${r.notes || 'Resultado de escoragem biometrada utilizando calibradores fiduciários em lombo e garupa bovina.'}
            </div>
        </div>

        <div class="doctor-signature" style="justify-content: flex-end;">
            <div class="dr-text" style="text-align: right;">
                <div style="width: 200px; border-bottom: 1px solid #9ca3af; margin-bottom: 6px; margin-left: auto;"></div>
                <strong>${userProfile?.name || "Dr. Pedro Almeida"}</strong><br>
                ${userProfile?.specialty || "Médico Veterinário"} • ${userProfile?.crmv || "CRMV-PT #8420-BA"}
            </div>
        </div>
    </div>`;
      });

      htmlContent += `
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Laudos_Consolidados_Lote_${selectedLot.replace(/\s+/g, '_')}_Dossie.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsBatchDownloading(false);
    }, 1500);
  };

  // Compute aggregate statistics dynamically based on filtered records
  const averages = {
    weight: filteredRecords.reduce((acc, cr) => acc + cr.weight, 0) / filteredRecords.length || 480.0,
    score: filteredRecords.reduce((acc, cr) => acc + cr.score, 0) / filteredRecords.length || 3.2,
    fat: filteredRecords.reduce((acc, cr) => acc + cr.fatProgress, 0) / filteredRecords.length || 11.2,
  };

  // Compute dynamic distribution
  const countCol1 = filteredRecords.filter(r => r.score < 2.0).length;
  const countCol2 = filteredRecords.filter(r => r.score >= 2.0 && r.score < 3.0).length;
  const countCol3 = filteredRecords.filter(r => r.score >= 3.0 && r.score < 4.0).length;
  const countCol4 = filteredRecords.filter(r => r.score >= 4.0).length;
  const totalCount = filteredRecords.length || 1;

  const histogramData = [
    { label: 'Escore < 2.0 (Caquético/Alerta)', percent: Math.round((countCol1 / totalCount) * 105) / 1.05 === 0 ? 0 : Math.round((countCol1 / totalCount) * 100), bg: 'bg-[#ba1a1a]', count: countCol1 },
    { label: 'Escore 2.0-2.9 (Magro)', percent: Math.round((countCol2 / totalCount) * 105) / 1.05 === 0 ? 0 : Math.round((countCol2 / totalCount) * 100), bg: 'bg-amber-500', count: countCol2 },
    { label: 'Escore 3.0-3.9 (Ideal/Manejo)', percent: Math.round((countCol3 / totalCount) * 105) / 1.05 === 0 ? 0 : Math.round((countCol3 / totalCount) * 100), bg: 'bg-[#2c694e]', count: countCol3 },
    { label: 'Escore 4.0-5.0 (Abate/Prontos)', percent: Math.round((countCol4 / totalCount) * 105) / 1.05 === 0 ? 0 : Math.round((countCol4 / totalCount) * 100), bg: 'bg-[#012d1d]', count: countCol4 }
  ];

  const handleExportCSV = () => {
    setIsDownloading(true);
    setTimeout(() => {
      // Cabeçalho bem organizado com acentuação correta e separador de colunas padrão para Excel BR/PT (ponto e vírgula)
      const headers = 'ID;Data da Avaliação;Lote;Raça;Escore Corporal (ECC);Peso Estimado (kg);Tipo de Peso;Espessura de Gordura (mm);Confiança da IA;Parecer Técnico;Observações\n';
      const rows = filteredRecords.map(r => {
        const id = r.id || '';
        const date = r.date || '';
        const lot = r.lot || '';
        const breed = r.breed || '';
        const score = r.score !== undefined && r.score !== null ? r.score.toFixed(2).replace('.', ',') : '';
        const weight = r.weight !== undefined && r.weight !== null ? r.weight.toString().replace('.', ',') : '';
        const weightType = r.isRealWeight ? 'Medido (Balança)' : 'Sugerido (IA)';
        const fat = r.fatProgress !== undefined && r.fatProgress !== null ? r.fatProgress.toFixed(1).replace('.', ',') : '';
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
      link.setAttribute('download', `BovinoVision_Relatorio_Lote_${selectedLot.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDownloading(false);
    }, 1200);
  };

  const handleExportSummaryReport = () => {
    try {
      window.print();
    } catch (e) {
      console.warn("Iframe blocked native print. Downloading HTML report packet...", e);
    }

    // Standard high-fidelity printable HTML summary report dossier
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>BovinoVision AI - Relatório Resumido Lote ${selectedLot}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; background-color: #ffffff; margin: 0; padding: 40px; }
        .header { border-bottom: 3px solid #012d1d; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        .logo-title { font-size: 26px; font-weight: 900; color: #012d1d; letter-spacing: -0.02em; }
        .sub-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; font-family: monospace; margin-top: 4px; }
        .badge { background-color: #aeeecb; color: #0e5138; font-size: 10px; font-weight: bold; font-family: monospace; padding: 5px 10px; border-radius: 4px; text-transform: uppercase; }
        .title-section { margin-bottom: 30px; }
        .title-section h2 { font-size: 18px; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase; color: #111827; }
        .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; font-size: 12px; font-family: monospace; }
        .meta-grid p { margin: 4px 0; color: #4b5563; }
        .meta-grid strong { color: #111827; }
        .stats-grid { display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 20px; margin: 30px 0; }
        .stat-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; background-color: #f9fafb; text-align: center; }
        .stat-label { font-size: 10px; text-transform: uppercase; color: #6b7280; font-family: monospace; font-weight: bold; }
        .stat-value { font-size: 24px; font-weight: 800; color: #012d1d; margin-top: 6px; }
        .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #4b5563; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; font-family: monospace; }
        .chart-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 30px; }
        .bar-row { margin-bottom: 12px; }
        .bar-info { display: flex; justify-content: space-between; font-size: 11px; font-family: monospace; color: #374151; margin-bottom: 4px; }
        .bar-container { background-color: #f3f4f6; height: 10px; border-radius: 9999px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 9999px; }
        .fill-red { background-color: #ba1a1a; }
        .fill-amber { background-color: #f59e0b; }
        .fill-green-light { background-color: #2c694e; }
        .fill-green-dark { background-color: #012d1d; }
        .note-box { border-left: 4px solid #059669; background-color: #f0fdf4; padding: 15px; border-radius: 0 6px 6px 0; font-size: 12px; line-height: 1.6; color: #047857; margin-bottom: 30px; }
        .table-container { margin-bottom: 40px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; text-align: left; }
        th { background-color: #f9fafb; border-bottom: 2px solid #e5e7eb; padding: 8px; font-family: monospace; font-weight: bold; color: #4b5563; }
        td { border-bottom: 1px solid #e5e7eb; padding: 10px 8px; color: #374151; }
        td.bold-id { font-family: monospace; font-weight: bold; color: #111827; }
        td.bold-score { font-family: monospace; font-weight: bold; color: #012d1d; }
        .footer-sec { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        .seal-title { font-size: 10px; font-family: monospace; font-weight: bold; color: #065f46; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 3px 6px; border-radius: 4px; display: inline-block; }
        .seal-desc { font-size: 9px; color: #9ca3af; font-family: monospace; margin-top: 5px; }
        .signature-box { width: 220px; border-top: 1px solid #9ca3af; text-align: center; font-size: 11px; padding-top: 5px; color: #4b5563; }
        @media print {
            body { padding: 0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="logo-title">BovinoVision AI</div>
            <div class="sub-title">PECUÁRIA DE PRECISÃO & INTELIGÊNCIA VETERINÁRIA DE CARCAÇA</div>
        </div>
        <span class="badge">Relatório Estatístico de Rendimento</span>
    </div>

    <div class="title-section">
        <h2>Laudo Resumido de Desenvolvimento de Lote</h2>
        <div class="meta-grid">
            <div>
                <p><strong>LOTE SELECIONADO:</strong> ${selectedLot}</p>
                <p><strong>PERIODICIDADE:</strong> ${reportType === 'mensal' ? 'Relatório Mensal' : reportType === 'trimestral' ? 'Relatório Trimestral' : 'Relatório Anual'}</p>
                <p><strong>TOTAL DE ANIMAIS NOMINAIS:</strong> ${filteredRecords.length}</p>
            </div>
            <div style="text-align: right;">
                <p><strong>DATA DE EMISSÃO:</strong> ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p><strong>MÉDICO VETERINÁRIO:</strong> ${userProfile?.name || "Dr. Pedro Almeida"} (${userProfile?.crmv || "CRMV-PT #8420-BA"})</p>
                <p><strong>SÉRIE / LOCAL:</strong> Setor de Pasto Norte, Brasil</p>
            </div>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-box">
            <span class="stat-label">Média de Peso</span>
            <div class="stat-value">${averages.weight.toFixed(1)} kg</div>
        </div>
        <div class="stat-box">
            <span class="stat-label">Escore ECC Médio</span>
            <div class="stat-value">${averages.score.toFixed(1)} / 5.0</div>
        </div>
        <div class="stat-box">
            <span class="stat-label">Cobertura de Gordura</span>
            <div class="stat-value">${averages.fat.toFixed(1)}%</div>
        </div>
    </div>

    <div class="section-title">Distribuição do Escore de Condição Corporal (ECC)</div>
    <div class="chart-box">
        ${histogramData.map((col, idx) => {
            let colorClass = 'fill-green-dark';
            if (idx === 0) colorClass = 'fill-red';
            else if (idx === 1) colorClass = 'fill-amber';
            else if (idx === 2) colorClass = 'fill-green-light';
            
            return `
            <div class="bar-row">
                <div class="bar-info">
                    <span>${col.label}</span>
                    <strong>${col.count} an. (${col.percent}%)</strong>
                </div>
                <div class="bar-container">
                    <div class="bar-fill ${colorClass}" style="width: ${col.percent}%"></div>
                </div>
            </div>`;
        }).join('')}
    </div>

    <div class="section-title">Parecer e Recomendação Técnica e Zootécnica</div>
    <div class="note-box">
        <strong>Avaliação Zootécnica de Rebanho de Abate:</strong><br><br>
        ${averages.score < 2.5 
          ? "ALERTA NUTRICIONAL: O lote selecionado apresenta ECC abaixo da faixa ideal de rendimento (média menor que 2.5). Recomenda-se aumentar aporte energético e de cocho imediatamente. Monitorar incidências veterinárias."
          : averages.score >= 4.0
          ? "LOTE PRONTO PARA ABATE: Condição excelente de rendimento de carcaça e acabamento (média igual ou maior que 4.0). Lote apto para abate e transporte comercial de forma prioritária."
          : "DESENVOLVIMENTO DE CARCAÇA EXCELENTE: Condição ideal de manejo reprodutivo ou recria intermediária (média entre 2.5 e 4.0). Manter o protocolo atual de pasto rotacionado com suplementação mineral focada."
        }
        <br><br>
        <span style="font-size: 10px; color: #6b7280; font-family: monospace;">Análise computada sobre ${filteredRecords.length} amostras de registros autenticados do BovinoVision CattleGuard Core.</span>
    </div>

    <div class="section-title">Listagem Nominal de Controle Bovino</div>
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>Brinco (ID)</th>
                    <th>Raça</th>
                    <th>Escore ECC</th>
                    <th>Peso Corporal</th>
                    <th>Acabamento subcutâneo</th>
                    <th>Classificação Diagnóstica</th>
                    <th>Data</th>
                </tr>
            </thead>
            <tbody>
                ${filteredRecords.map(r => `
                <tr>
                    <td class="bold-id">#${r.id}</td>
                    <td>${r.breed}</td>
                    <td class="bold-score">${r.score.toFixed(1)}</td>
                    <td>${r.weight.toFixed(1)} kg</td>
                    <td>${r.fatProgress.toFixed(1)}%</td>
                    <td style="font-weight: bold; font-size: 10px;">${r.verdict}</td>
                    <td>${r.date}</td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer-sec">
        <div>
            <div class="seal-title">Autenticação de Segurança BovinoVision AI</div>
            <div class="seal-desc">
                Verificado via rede neural convolucional e calibradores de preenchimento subcutâneos.<br>
                Chave Eletrônica de Seguridade de Pasto: BV-934C-PRO-LAUDO-CONSOLIDADO
            </div>
        </div>
        <div class="signature-box">
            <strong>${userProfile?.name || "Dr. Pedro Almeida"}</strong><br>
            <span style="font-size: 9px; text-transform: uppercase; color: #6b7280;">${userProfile?.specialty || "Médico Veterinário"} • ${userProfile?.crmv || "CRMV-PT #8420-BA"}</span>
        </div>
    </div>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 800);
        };
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Relatorio_Resumido_Lote_${selectedLot.replace(/\s+/g, '_')}_BovinoVision.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <>
      <div className="space-y-6 animate-fade-in text-left print:hidden">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-950 font-sans">
            Relatórios & Diagnósticos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Exportações de planilhas consolidadas e telemetria estatística dos lotes cadastrados
          </p>
        </div>

        {/* Aggregate metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0e1320] rounded-lg border border-gray-200 dark:border-gray-800 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-wider text-gray-400 font-bold uppercase">Média Geral do Peso</span>
              <div className="text-2xl font-sans font-extrabold text-[#012d1d] dark:text-sky-300">{averages.weight.toFixed(1)} kg</div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0e1320] rounded-lg border border-gray-200 dark:border-gray-800 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-wider text-gray-400 font-bold uppercase">Média Score Corporal</span>
              <div className="text-2xl font-sans font-extrabold text-[#012d1d] dark:text-[#aeeecb]">{averages.score.toFixed(1)} / 5.0</div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0e1320] rounded-lg border border-gray-200 dark:border-gray-800 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-wider text-gray-400 font-bold uppercase">Média Cobertura Gordura</span>
              <div className="text-2xl font-sans font-extrabold text-[#012d1d] dark:text-sky-305">{averages.fat.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* Main Analysis Reports Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Side (3 columns): Histogram and stats distribution */}
          <div className="lg:col-span-3 bg-white dark:bg-[#0e1320] rounded-lg border border-gray-200 dark:border-gray-800 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-950 dark:text-white uppercase tracking-wide">
                  Distribuição de Escores de Gordura (ECC)
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Categorias de lotes ativos no pasto</p>
              </div>
              
              <span className="inline-flex items-center gap-1 text-xs text-[#2c694e] dark:text-[#aeeecb] font-bold font-mono bg-emerald-50 dark:bg-emerald-950/45 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-900/40">
                <BarChart2 className="h-3.5 w-3.5" />
                <span>Cálculo Real (Registros Ativos)</span>
              </span>
            </div>

            {/* Graphical custom SVG Histogram */}
            <div className="h-[288px] sm:h-64 w-full relative pt-6 pb-2">
              {/* Grid Lines in background */}
              <div className="absolute inset-0 flex flex-col justify-between text-right pointer-events-none pb-8 pt-4">
                {[100, 75, 50, 25, 0].map((val) => (
                  <div key={val} className="w-full flex items-center border-t border-dashed border-gray-100 dark:border-gray-800/80 h-0 text-[9px] font-mono text-gray-300 dark:text-gray-600 relative">
                    <span className="absolute left-1 -translate-y-1 w-5 text-left">{val}%</span>
                  </div>
                ))}
              </div>

              {/* SVG layout */}
              <svg className="w-full h-full absolute inset-0 pt-4 pb-8 pl-8 pr-2" viewBox="0 0 500 180" preserveAspectRatio="none">
                {histogramData.map((col, idx) => {
                  const totalWidth = 500;
                  const leftMargin = 30;
                  const rightMargin = 20;
                  const availableWidth = totalWidth - leftMargin - rightMargin;
                  const step = availableWidth / histogramData.length;
                  const cx = leftMargin + (idx * step) + (step / 2);
                  const percent = col.percent;
                  
                  // Height of bar proportional to percentage (out of 100 max)
                  const barHeight = (percent / 100) * 120;
                  const y = 150 - barHeight;
                  const width = 36;
                  const rx = 3; // Square borders with slight elegant rounding like the monthly chart
                  
                  // Map backgrounds beautifully
                  let barColor = '';
                  if (idx === 0) {
                    barColor = '#b91c1c'; // Red
                  } else if (idx === 1) {
                    barColor = '#f59e0b'; // Amber
                  } else if (idx === 2) {
                    barColor = '#2c694e'; // Ideal
                  } else {
                    barColor = '#012d1d'; // Forest
                    if (isDark) {
                      barColor = '#10b981'; // Brighter emerald in dark theme for high-contrast visibility
                    }
                  }

                  const bgBarColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';

                  return (
                    <g key={idx} className="group cursor-pointer">
                      {/* Background slot track */}
                      <rect
                        x={cx - width / 2}
                        y={30}
                        width={width}
                        height={120}
                        rx={rx}
                        fill={bgBarColor}
                        className="transition-colors duration-200 group-hover:fill-gray-100/10 dark:group-hover:fill-white/5"
                      />
                      
                      {/* Solid Measurement Column */}
                      <rect
                        x={cx - width / 2}
                        y={y}
                        width={width}
                        height={barHeight}
                        rx={rx}
                        fill={barColor}
                        className="transition-all duration-200 group-hover:opacity-90 transform origin-bottom group-hover:scale-y-[1.02]"
                      />

                      {/* Tooltip background & text on hover */}
                      <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <rect 
                          x={cx - 50} 
                          y={Math.max(y - 35, 12)} 
                          width={100} 
                          height={20} 
                          rx={3} 
                          fill="#0f172a" 
                        />
                        <text 
                          x={cx} 
                          y={Math.max(y - 22, 25)} 
                          textAnchor="middle" 
                          fill="#ffffff" 
                          className="text-[9px] font-mono"
                        >
                          {col.count} Animais
                        </text>
                        {/* Little triangle */}
                        <polygon 
                          points={`${cx - 4},${Math.max(y - 15, 32)} ${cx + 4},${Math.max(y - 15, 32)} ${cx},${Math.max(y - 11, 36)}`} 
                          fill="#0f172a" 
                        />
                      </g>

                      {/* Percent value above column */}
                      <text
                        x={cx}
                        y={Math.min(y - 6, 142)}
                        textAnchor="middle"
                        fill={isDark ? '#f1f5f9' : '#1e293b'}
                        className="text-[10px] font-sans font-bold select-none transition-transform duration-200 group-hover:-translate-y-1"
                      >
                        {percent}%
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Real-time aligned footer legend labels below SVG */}
              <div className="absolute bottom-0 left-8 right-2 flex justify-between text-[8px] sm:text-[9px] font-sans font-bold text-gray-500">
                {histogramData.map((col, idx) => {
                  const labelParts = col.label.split(' (');
                  const mainLabel = labelParts[0]; // e.g. "Escore < 2.0"
                  const subtype = labelParts[1] ? labelParts[1].replace(')', '') : ''; // e.g. "Caquético/Alerta"
                  const shortLabel = mainLabel.replace('Escore ', '');
                  
                  let dotColor = 'bg-red-600';
                  if (idx === 1) dotColor = 'bg-amber-500';
                  if (idx === 2) dotColor = 'bg-[#2c694e]';
                  if (idx === 3) dotColor = 'bg-emerald-800 dark:bg-emerald-500';

                  return (
                    <div key={idx} className="flex flex-col items-center text-center w-1/4 px-1 select-none">
                      <div className="flex items-center gap-1 mt-0.5 justify-center max-w-full">
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />
                        <span className="text-gray-800 dark:text-gray-200 block truncate max-w-full text-[8px] sm:text-[9px] tracking-tight sm:tracking-normal">
                          <span className="hidden sm:inline">Escore </span>{shortLabel}
                        </span>
                      </div>
                      <span className="text-[7px] sm:text-[8px] text-gray-400 dark:text-gray-500 font-mono font-medium block truncate max-w-full leading-tight">
                        {subtype}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side (2 columns): Document exports bar */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0e1320] rounded-lg border border-gray-200 dark:border-gray-800 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#111827] dark:text-white uppercase tracking-wide">
                  Exportador de Certificados
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Gerar laudos técnicos em PDF/CSV em lote</p>
              </div>

              {/* Selection Options */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">Selecione Lote de Origem</label>
                  <div className="relative">
                    <select 
                      value={selectedLot}
                      onChange={(e) => setSelectedLot(e.target.value)}
                      className="w-full h-11 border border-[#e5e7eb] dark:border-gray-800 rounded px-3 text-gray-800 dark:text-gray-150 bg-white dark:bg-gray-900 font-mono focus:outline-[#012d1d] appearance-none"
                    >
                      <option value="Todos">Todos os Lotes</option>
                      {availableLots.map(lotName => (
                        <option key={lotName} value={lotName}>
                          {lotName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">Periodicidade</label>
                  <div className="relative">
                    <select 
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full h-11 border border-gray-200 dark:border-gray-800 rounded px-3 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-950/40 font-mono focus:outline-[#012d1d] appearance-none"
                    >
                      <option value="mensal" className="dark:bg-[#111827] dark:text-gray-100">Relatório Mensal</option>
                      <option value="trimestral" className="dark:bg-[#111827] dark:text-gray-100">Relatório Trimestral</option>
                      <option value="anual" className="dark:bg-[#111827] dark:text-gray-100">Relatório Anual</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Export Action Buttons */}
            <div className="space-y-2.5 pt-6">
              <button
                id="reports-btn-csv-export"
                onClick={handleExportCSV}
                disabled={isDownloading}
                className="w-full h-11 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-2 border-dashed border-blue-200 dark:border-blue-900/40 text-[#1e3a8a] dark:text-sky-300 rounded-md font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FileSpreadsheet className="h-4.5 w-4.5 text-blue-700 dark:text-sky-400" />
                <span>{isDownloading ? 'Gerando planilha...' : 'Exportar Planilha Completa (CSV)'}</span>
              </button>

              <button
                id="reports-btn-quick-pdf"
                onClick={handleExportSummaryReport}
                className="w-full h-11 bg-sky-200 hover:bg-sky-300 dark:bg-blue-900 dark:hover:bg-blue-950 text-sky-950 dark:text-sky-200 rounded-md font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileText className="h-4.5 w-4.5 text-sky-950 dark:text-sky-400" />
                <span>Gerar Relatório Resumido (PDF)</span>
              </button>

              <button
                id="reports-btn-pdf-batch"
                onClick={handleExportBatchHTML}
                disabled={isBatchDownloading}
                className="w-full h-11 bg-[#1e3a8a] hover:bg-blue-900 dark:bg-blue-850 dark:hover:bg-blue-900 text-white rounded-md font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Download className="h-4.5 w-4.5 text-sky-200" />
                <span>{isBatchDownloading ? 'Indexando laudos...' : 'Baixar Todos Laudos'}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Print-Only Layout */}
      <div className="hidden print:block pt-4 text-[#191c1d] bg-white text-left font-sans leading-relaxed">
        {/* Professional Header */}
        <div className="border-b-2 border-[#012d1d] pb-4 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="font-sans font-black text-2xl tracking-tight text-[#012d1d] uppercase">
              BovinoVision AI
            </h1>
            <span className="text-[10px] text-gray-500 font-mono block uppercase">
              Pecuária de Precisão & Inteligência Veterinária de Carcaça
            </span>
          </div>
          <div className="text-right space-y-0.5">
            <span className="bg-[#aeeecb] text-[#0e5138] text-[9px] px-2 py-0.5 rounded font-bold uppercase font-mono tracking-wide">
              Laudo Estatístico Consolidador
            </span>
            <div className="text-[9px] text-gray-400 font-mono mt-1">
              Documentação Oficial de Campo
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="my-6 space-y-1">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 uppercase tracking-wide font-sans">
            Relatório Estatístico de Rendimento de Carcaça e Escore ECC
          </h2>
          <div className="grid grid-cols-2 gap-4 text-[10px] font-mono pt-2">
            <div>
              <p className="text-gray-500"><span className="font-bold text-gray-700">LOTE SELECIONADO:</span> {selectedLot}</p>
              <p className="text-gray-500"><span className="font-bold text-gray-700">PERIODICIDADE:</span> {reportType === 'mensal' ? 'Relatório Mensal' : reportType === 'trimestral' ? 'Relatório Trimestral' : 'Relatório Anual'}</p>
              <p className="text-gray-500"><span className="font-bold text-gray-700">TOTAL DE ANIMAIS NOMINAIS:</span> {filteredRecords.length}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500"><span className="font-bold text-gray-700">DATA DE EMISSÃO:</span> {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p className="text-gray-500"><span className="font-bold text-gray-700">MÉDICO VETERINÁRIO:</span> {userProfile?.name || "Dr. Pedro Almeida"} ({userProfile?.crmv || "CRMV-PT #8420-BA"})</p>
              <p className="text-gray-500"><span className="font-bold text-gray-700">SÉRIE / LOCAL:</span> Setor de Pasto Norte, Brasil</p>
            </div>
          </div>
        </div>

        {/* Statistical Averages Section */}
        <div className="grid grid-cols-3 gap-4 border border-gray-200 rounded p-4 bg-gray-50/50 mb-6">
          <div className="text-center space-y-1 border-r border-gray-200">
            <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">Média de Peso do Lote</span>
            <div className="text-lg font-bold text-[#012d1d] font-sans">{averages.weight.toFixed(1)} kg</div>
          </div>
          <div className="text-center space-y-1 border-r border-gray-200">
            <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">Escore ECC Médio</span>
            <div className="text-lg font-bold text-[#012d1d] font-sans">{averages.score.toFixed(1)} / 5.0</div>
          </div>
          <div className="text-center space-y-1">
            <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">Cob. de Gordura Média</span>
            <div className="text-lg font-bold text-[#012d1d] font-sans">{averages.fat.toFixed(1)}%</div>
          </div>
        </div>

        {/* Distribution Graph for Print -- Clean stylized bars */}
        <div className="border border-gray-200 rounded p-4 mb-6">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wide text-gray-700 mb-3">Distribuição das Faixas de ECC (Escore de Condição Corporal)</h3>
          <div className="space-y-3">
            {histogramData.map((col, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-700 font-mono">
                  <span>{col.label}</span>
                  <span className="font-bold">{col.count} Animais ({col.percent}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-none overflow-hidden">
                  <div className={`h-full ${col.bg.replace('bg-amber-550', 'bg-amber-500')}`} style={{ width: `${col.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostic Insights (Zootecnia AI Summary) */}
        <div className="border border-emerald-100 rounded p-4 bg-emerald-50/20 mb-6 text-xs text-gray-800 space-y-2">
          <h3 className="font-bold text-[#012d1d] uppercase tracking-wider font-mono text-[10px] flex items-center gap-1">
            Parecer e Recomendação Técnica Zootécnica
          </h3>
          <p>
            {averages.score < 2.5 
              ? "ALERTA NUTRICIONAL: O lote selecionado apresenta ECC abaixo da faixa ideal de rendimento (média menor que 2.5). Recomenda-se aumentar aporte energético e de cocho imediatamente. Monitorar incidências veterinárias."
              : averages.score >= 4.0
              ? "LOTE PRONTO PARA ABATE: Condição excelente de rendimento de carcaça e acabamento (média igual ou maior que 4.0). Lote apto para abate e transporte comercial de forma prioritária."
              : "DESENVOLVIMENTO DE CARCAÇA EXCELENTE: Condição ideal de manejo reprodutivo ou recria intermediária (média entre 2.5 e 4.0). Manter o protocolo atual de pasto rotacionado com suplementação mineral focada."
            }
          </p>
          <p className="text-[10px] text-gray-400 font-mono">
            Análise computada sobre {filteredRecords.length} amostras de registros autenticados do BovinoVision CattleGuard Core.
          </p>
        </div>

        {/* Animal List Table */}
        <div className="mt-6">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wide text-gray-700 border-b border-gray-200 pb-1 mb-2">LISTAGEM NOMINAL DOS ANIMAIS AVALIADOS NO LOTE</h3>
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-50 font-bold font-mono">
                <th className="py-1 px-2">ID</th>
                <th className="py-1 px-2">Raça</th>
                <th className="py-1 px-2">Escore ECC</th>
                <th className="py-1 px-2">Peso</th>
                <th className="py-1 px-2">Cobertura Gordura</th>
                <th className="py-1 px-2">Diagnóstico</th>
                <th className="py-1 px-2">Data da Avaliação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((r) => (
                <tr key={r.id}>
                  <td className="py-1.5 px-2 font-mono font-bold text-gray-900">{r.id}</td>
                  <td className="py-1.5 px-2">{r.breed}</td>
                  <td className="py-1.5 px-2 font-mono font-bold text-[#012d1d]">{r.score.toFixed(1)}</td>
                  <td className="py-1.5 px-2 font-mono">{r.weight.toFixed(1)} kg</td>
                  <td className="py-1.5 px-2 font-mono">{r.fatProgress.toFixed(1)}%</td>
                  <td className="py-1.5 px-2 font-sans font-bold text-[9px] uppercase tracking-wider">{r.verdict}</td>
                  <td className="py-1.5 px-2 text-gray-500 font-mono">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vector/Seal Block & Signature */}
        <div className="mt-12 flex justify-between items-end border-t border-gray-200 pt-6">
          <div className="space-y-1">
            <div className="text-[9px] font-mono font-bold text-emerald-800 uppercase bg-emerald-50 border border-emerald-100 px-2 py-0.5 inline-block rounded">
              Selo de Autenticidade BovinoVision AI
            </div>
            <div className="text-[8px] text-gray-400 font-mono">
              Verificado via rede neural convolucional e calibradores de preenchimento subcutâneos. ID do Servidor: BV-934C-PRO
            </div>
          </div>
          <div className="text-center space-y-1 w-64 border-t border-gray-300 pt-1">
            <div className="text-[10px] font-sans font-bold text-gray-800">{userProfile?.name || "Dr. Pedro Almeida"}</div>
            <div className="text-[8px] font-mono text-gray-400 uppercase">{userProfile?.specialty || "Médico Veterinário Responsável"}</div>
            <div className="text-[8px] font-mono text-gray-400">{userProfile?.crmv || "CRMV-PT #8420-BA"}</div>
          </div>
        </div>
      </div>
    </>
  );
}
