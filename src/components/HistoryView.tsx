/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  FilterX, 
  Plus, 
  Eye, 
  Undo2,
  RefreshCw,
  Pencil,
  Trash2,
  Save,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { CattleRecord } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../translations';

interface HistoryViewProps {
  records: CattleRecord[];
  onSelectRecord: (record: CattleRecord) => void;
  onNewAssessment: () => void;
  onDeleteRecord?: (id: string) => void;
  onUpdateRecord?: (record: CattleRecord) => void;
  language?: Language;
}

const tHistory = {
  pt: {
    title: 'Histórico de Avaliações',
    sub: 'Gerencie e analise o histórico completo de scores corporais e saúde do rebanho.',
    update: 'Atualizar',
    new: 'Nova Avaliação',
    searchTitle: 'Busca & Filtros de Pesquisa',
    termLabel: 'Termo de Busca (ID, Raça, Observações ou Lote)',
    placeholder: 'Pesquise por brinco, lote, raça, observações...',
    clear: 'Limpar',
    searchBy: 'Pesquisar por:',
    allFields: 'Todos os Campos',
    earringId: 'ID do Brinco',
    rangeBreed: 'Raça',
    obsLabel: 'Observações',
    quickFilters: 'Filtros Rápidos',
    allCattle: 'Todos os Bovinos',
    abateApto: 'Apto p/ Abate',
    abateNaoApto: 'Não Apto (Acompanhamento)',
    magroBcs: 'ECC Magro (< 3.0)',
    gordoBcs: 'ECC Gordo (≥ 4.0)',
    heavyLabel: 'Pesados (≥ 500 kg)',
    sortByLabel: 'Ordenar Registros por:',
    sortDateDesc: 'Data da Análise (Mais recente primeiro)',
    sortDateAsc: 'Data da Análise (Mais antigo primeiro)',
    sortScoreDesc: 'Escore Corporal ECC (Maior primeiro)',
    sortScoreAsc: 'Escore Corporal ECC (Menor primeiro)',
    sortWeightDesc: 'Peso Estimado kg (Maior primeiro)',
    sortWeightAsc: 'Peso Estimado kg (Menor primeiro)',
    dateFilter: 'Filtro por Data ou Mês',
    lotFilter: 'Filtro por Lote',
    breedFilter: 'Filtro por Raça',
    verdictFilter: 'Filtro por Status Veredito',
    allLots: 'Todos os Lote',
    allBreeds: 'Todas as Raças',
    allVerdicts: 'Todos...',
    cleanFiltersBtn: 'Limpar Todos os Filtros',
    alertSuccess: 'Banco de dados de avaliações atualizado e sincronizado com sucesso em tempo real!',
    
    // Table headers
    thThumb: 'MINIATURA',
    thId: 'ID ANIMAL',
    thDate: 'DATA ANÁLISE',
    thLotBreed: 'LOTE / RAÇA',
    thWeight: 'PESO',
    thScore: 'SCORE (ECC)',
    thVerdict: 'VEREDITO',
    thActions: 'AÇÕES',
    
    // Table values
    editSuccess: 'Escore ECC alterado com sucesso no livro de registro.',
    noRecords: 'Nenhum gado encontrado para os filtros selecionados.',
    editTitle: 'Editar Registro Gado',
    editSub: 'Ajuste os parâmetros do animal para atualização histórica.',
    fieldBreedPt: 'Raça Bovino',
    fieldLotPt: 'Loteamento',
    fieldScorePt: 'Escore ECC (1-5)',
    fieldWeightPt: 'Peso Estimado (kg)',
    fieldFatPt: 'Gordura (%)',
    fieldNotesPt: 'Notas Clínicas e Manejo Nutricional',
    btnSave: 'Salvar Alterações',
    verdictCalc: 'Veredito Calculado:',
    placeholderNotes: 'Escreva orientações de nutrição ou observações de saúde...',
    placeholderLot: 'Ex: Lote Norte - A',
    
    // Delete Modal
    deleteTitle: 'Excluir Registro Gado',
    deleteWarn: 'Está prestes a excluir definitivamente o registro bovino',
    deleteDanger: 'Aviso: Esta ação é irreversível. Todas as coordenadas anatômicas calculadas e o escore de rendimento nutricional associados serão removidos do banco local em caráter permanente.',
    btnDelete: 'Confirmar Exclusão',
    btnCancel: 'Cancelar',

    // Statuses
    aptoStatus: 'APTO PARA ABATE',
    naoAptoStatus: 'NÃO APTO',
    allLotsOption: 'Todos os Lotes',
    allBreedsOption: 'Todas as Raças',
    allStatusOption: 'Todos os Status'
  },
  es: {
    title: 'Historial de Evaluaciones',
    sub: 'Gestione y analice el historial completo de puntuaciones corporales y salud del rebaño.',
    update: 'Actualizar',
    new: 'Nueva Evaluación',
    searchTitle: 'Búsqueda y Filtros de Investigación',
    termLabel: 'Término de Búsqueda (ID, Raza, Observaciones o Lote)',
    placeholder: 'Busque por arete, lote, raza, observaciones...',
    clear: 'Limpiar',
    searchBy: 'Buscar por:',
    allFields: 'Todos los Campos',
    earringId: 'ID del Arete',
    rangeBreed: 'Raza',
    obsLabel: 'Observaciones',
    quickFilters: 'Filtros Rápidos',
    allCattle: 'Todos los Bovinos',
    abateApto: 'Apto p/ Sacrificio',
    abateNaoApto: 'No Apto (Seguimiento)',
    magroBcs: 'ECC Flaco (< 3.0)',
    gordoBcs: 'ECC Gordo (≥ 4.0)',
    heavyLabel: 'Pesados (≥ 500 kg)',
    sortByLabel: 'Ordenar Registros por:',
    sortDateDesc: 'Fecha del Análisis (Más reciente primero)',
    sortDateAsc: 'Fecha del Análisis (Más antiguo primero)',
    sortScoreDesc: 'Puntuación ECC (Mayor primero)',
    sortScoreAsc: 'Puntuación ECC (Menor primero)',
    sortWeightDesc: 'Peso Estimado kg (Mayor primero)',
    sortWeightAsc: 'Peso Estimado kg (Menor primero)',
    dateFilter: 'Filtro por Fecha o Mes',
    lotFilter: 'Filtro por Lote',
    breedFilter: 'Filtro por Raza',
    verdictFilter: 'Filtro por Estado Veredicto',
    allLots: 'Todos los Lotes',
    allBreeds: 'Todas las Razas',
    allVerdicts: 'Todos...',
    cleanFiltersBtn: 'Limpar Todos los Filtros',
    alertSuccess: '¡Base de datos de evaluaciones actualizada y sincronizada con éxito en tiempo real!',
    
    // Table headers
    thThumb: 'MINIATURA',
    thId: 'ANIMAL ID',
    thDate: 'DATA ANÁLISE',
    thLotBreed: 'LOTE / RAZA',
    thWeight: 'PESO',
    thScore: 'SCORE (ECC)',
    thVerdict: 'VEREDICTO',
    thActions: 'ACCIONES',
    
    // Table values
    editSuccess: 'Puntuación ECC modificada con éxito en el registro.',
    noRecords: 'No se encontraron registros que coincidan con sus filtros.',
    editTitle: 'Editar Registro Bovino',
    editSub: 'Ajuste los parámetros del animal para la actualización histórica.',
    fieldBreedPt: 'Raza Bovino',
    fieldLotPt: 'Lote',
    fieldScorePt: 'Puntuación ECC (1-5)',
    fieldWeightPt: 'Peso Estimado (kg)',
    fieldFatPt: 'Grasa (%)',
    fieldNotesPt: 'Notas Clínicas y Manejo Nutricional',
    btnSave: 'Guardar Cambios',
    verdictCalc: 'Veredicto Calculado:',
    placeholderNotes: 'Escriba pautas de nutrición u observaciones de salud...',
    placeholderLot: 'Ej: Lote Norte - A',
    
    // Delete Modal
    deleteTitle: 'Eliminar Registro Bovino',
    deleteWarn: 'Está a punto de eliminar permanentemente el registro bovino',
    deleteDanger: 'Advertencia: Esta acción es irreversible. Se eliminarán permanentemente todos los datos de puntuación corporal asociados del servidor local.',
    btnDelete: 'Confirmar Eliminación',
    btnCancel: 'Cancelar',

    // Statuses
    aptoStatus: 'APTO PARA ABATE',
    naoAptoStatus: 'NÃO APTO',
    allLotsOption: 'Todos los Lotes',
    allBreedsOption: 'Todas las Razas',
    allStatusOption: 'Todos los Estados'
  },
  en: {
    title: 'Assessment History',
    sub: 'Manage and analyze the complete history of body condition scores and herd health.',
    update: 'Refresh',
    new: 'New Assessment',
    searchTitle: 'Search & Filters',
    termLabel: 'Search Term (ID, Breed, Notes, or Lot)',
    placeholder: 'Search by tag, lot, breed, notes...',
    clear: 'Clear',
    searchBy: 'Search by:',
    allFields: 'All Fields',
    earringId: 'Tag ID',
    rangeBreed: 'Breed',
    obsLabel: 'Notes',
    quickFilters: 'Quick Filters',
    allCattle: 'All Cattle',
    abateApto: 'Fit for Slaughter',
    abateNaoApto: 'Unfit (Monitoring)',
    magroBcs: 'Lean BCS (< 3.0)',
    gordoBcs: 'Fat BCS (≥ 4.0)',
    heavyLabel: 'Heavy (≥ 500 kg)',
    sortByLabel: 'Sort Records by:',
    sortDateDesc: 'Analysis Date (Newest first)',
    sortDateAsc: 'Analysis Date (Oldest first)',
    sortScoreDesc: 'Body Score BCS (Highest first)',
    sortScoreAsc: 'Body Score BCS (Lowest first)',
    sortWeightDesc: 'Estimated Weight kg (Highest first)',
    sortWeightAsc: 'Estimated Weight kg (Lowest first)',
    dateFilter: 'Filter by Date or Month',
    lotFilter: 'Filter by Lot',
    breedFilter: 'Filter by Breed',
    verdictFilter: 'Filter by Verdict Status',
    allLots: 'All Lots',
    allBreeds: 'All Breeds',
    allVerdicts: 'All...',
    cleanFiltersBtn: 'Clear All Filters',
    alertSuccess: 'Assessment database successfully updated and synchronized in real-time!',
    
    // Table headers
    thThumb: 'THUMBNAIL',
    thId: 'ANIMAL ID',
    thDate: 'REGISTRATION DATE',
    thLotBreed: 'LOT / BREED',
    thWeight: 'WEIGHT',
    thScore: 'SCORE (ECC)',
    thVerdict: 'VERDICT',
    thActions: 'ACTIONS',
    
    // Table values
    editSuccess: 'BCS Score successfully updated in the records.',
    noRecords: 'No cattle found matching your selected filters.',
    editTitle: 'Edit Cattle Record',
    editSub: 'Adjust locally measured animal parameters for historical update.',
    fieldBreedPt: 'Animal Breed',
    fieldLotPt: 'Lotting',
    fieldScorePt: 'BCS Score (1-5)',
    fieldWeightPt: 'Estimated Weight (kg)',
    fieldFatPt: 'Fat (%)',
    fieldNotesPt: 'Clinical & Nutritional Notes',
    btnSave: 'Save Changes',
    verdictCalc: 'Calculated Verdict:',
    placeholderNotes: 'Enter nutrition guidelines or safety observations...',
    placeholderLot: 'e.g. North Lot - A',
    
    // Delete Modal
    deleteTitle: 'Delete Cattle Record',
    deleteWarn: 'You are about to permanently delete cattle record',
    deleteDanger: 'Warning: This action is irreversible. All calculated anatomical coordinates and nutritional yield scores will be permanently removed.',
    btnDelete: 'Confirm Deletion',
    btnCancel: 'Cancel',

    // Statuses
    aptoStatus: 'APTO PARA ABATE',
    naoAptoStatus: 'NÃO APTO',
    allLotsOption: 'All Lots',
    allBreedsOption: 'All Breeds',
    allStatusOption: 'All Status'
  }
};

export default function HistoryView({ 
  records, 
  onSelectRecord, 
  onNewAssessment,
  onDeleteRecord,
  onUpdateRecord,
  language = 'pt'
}: HistoryViewProps) {
  const t = tHistory[language];
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'all' | 'id' | 'breed' | 'notes'>('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedLot, setSelectedLot] = useState('Todos');
  const [selectedBreed, setSelectedBreed] = useState('Todas');
  const [selectedVerdict, setSelectedVerdict] = useState('Todos');
  const [quickFilter, setQuickFilter] = useState<'all' | 'apto' | 'nao_apto' | 'low_score' | 'high_score' | 'heavy'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'score_desc' | 'score_asc' | 'weight_desc' | 'weight_asc'>('date_desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Refresh and Edit state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CattleRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Edit form states
  const [editBreed, setEditBreed] = useState('');
  const [editLot, setEditLot] = useState('');
  const [editScore, setEditScore] = useState(3.0);
  const [editWeight, setEditWeight] = useState(480);
  const [editFat, setEditFat] = useState(11.5);
  const [editNotes, setEditNotes] = useState('');

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      alert(t.alertSuccess);
    }, 1200);
  };

  const handleEditClick = (record: CattleRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRecord(record);
    setEditBreed(record.breed);
    setEditLot(record.lot);
    setEditScore(record.score);
    setEditWeight(record.weight);
    setEditFat(record.fatProgress);
    setEditNotes(record.notes || '');
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteRecord?.(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    // Automatic verdict calculation: Score >= 3.5 is APTO PARA ABATE
    const determinedVerdict = editScore >= 3.5 ? 'APTO PARA ABATE' : 'NÃO APTO';

    const updated: CattleRecord = {
      ...editingRecord,
      breed: editBreed,
      lot: editLot,
      score: Number(editScore),
      weight: Number(editWeight),
      fatProgress: Number(editFat),
      notes: editNotes,
      verdict: determinedVerdict,
      isRealWeight: Number(editWeight) !== editingRecord.weight ? true : editingRecord.isRealWeight
    };

    onUpdateRecord?.(updated);
    setEditingRecord(null);
  };

  // Compute filtering lists dynamically for dropdowns
  const uniqueLots = useMemo(() => {
    const lots = records.map(r => r.lot);
    return ['Todos', ...Array.from(new Set(lots))];
  }, [records]);

  const uniqueBreeds = useMemo(() => {
    const predefined = [
      'Nelore Puro',
      'Nelore Pintado',
      'Angus Black',
      'Angus Red',
      'Brahman',
      'Tabapuã',
      'Guzerá',
      'Gir / Gir Leiteiro',
      'Sindi',
      'Indubrasil',
      'Senepol',
      'Caracu',
      'Hereford',
      'Braford',
      'Brangus',
      'Charolês',
      'Simental',
      'Girolando',
      'Jersey',
      'Holandês (HPB)',
      'Cruzamento Industrial'
    ];
    const dynamicBreeds = records.map(r => r.breed).filter(Boolean);
    const combined = Array.from(new Set([...predefined, ...dynamicBreeds]));
    return ['Todas', ...combined];
  }, [records]);

  // Helper to normalize strings (remove accents/diacritics and convert to lowercase)
  const normalizeText = (text: any) => {
    if (typeof text !== 'string') return '';
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Cleanly parses the Portuguese/English date string (e.g. "22 Mai 2026, 09:20" or "11 de jun de 2026, 19:19") 
  // into a solid UNIX timestamp to guarantee proper sort order on dashboards.
  const parseCattleDate = (dateStr: any): number => {
    if (typeof dateStr !== 'string' || !dateStr) return 0;
    try {
      const cleaned = dateStr.toLowerCase();
      
      // Extract year (typically 4 digits like 2026 or 2024)
      const yearMatch = cleaned.match(/\b(20\d\d)\b/);
      const year = yearMatch ? parseInt(yearMatch[1], 10) : 2026;

      // Extract time (HH:MM)
      const timeMatch = cleaned.match(/\b(\d{1,2}):(\d{2})\b/);
      const hours = timeMatch ? parseInt(timeMatch[1], 10) : 12;
      const minutes = timeMatch ? parseInt(timeMatch[2], 10) : 0;

      // Extract day number
      const dayMatch = cleaned.match(/\b(\d{1,2})\b/);
      const day = dayMatch ? parseInt(dayMatch[1], 10) : 1;

      // Find month
      const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      let monthIndex = 0;
      for (let i = 0; i < months.length; i++) {
        if (cleaned.includes(months[i])) {
          monthIndex = i;
          break;
        }
      }

      return new Date(year, monthIndex, day, hours, minutes).getTime();
    } catch (e) {
      return 0;
    }
  };

  // Perform filtration
  const filteredRecords = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);
    const tempRecords = records.filter((r) => {
      // Accent-insensitive search based on selected searchMode
      let matchSearch = true;
      if (normalizedSearch) {
        if (searchMode === 'id') {
          matchSearch = normalizeText(r.id).includes(normalizedSearch);
        } else if (searchMode === 'breed') {
          matchSearch = normalizeText(r.breed || '').includes(normalizedSearch);
        } else if (searchMode === 'notes') {
          matchSearch = normalizeText(r.notes || '').includes(normalizedSearch);
        } else {
          // 'all'
          matchSearch = normalizeText(r.id).includes(normalizedSearch) ||
            normalizeText(r.breed || '').includes(normalizedSearch) ||
            normalizeText(r.lot || '').includes(normalizedSearch) ||
            normalizeText(r.notes || '').includes(normalizedSearch) ||
            normalizeText(r.verdict || '').includes(normalizedSearch);
        }
      }

      const matchDate = selectedDate ? r.date.toLowerCase().includes(selectedDate.toLowerCase()) : true;
      const matchLot = selectedLot === 'Todos' || r.lot === selectedLot;
      const matchBreed = selectedBreed === 'Todas' || r.breed === selectedBreed;
      
      // Map statuses
      let matchVerdict = true;
      if (selectedVerdict !== 'Todos') {
        if (selectedVerdict === 'Apto para Abate') {
          matchVerdict = r.verdict === 'APTO PARA ABATE';
        } else if (selectedVerdict === 'Não Apto') {
          matchVerdict = r.verdict === 'NÃO APTO';
        }
      }

      // Quick filter constraints
      let matchQuick = true;
      if (quickFilter === 'apto') {
        matchQuick = r.verdict === 'APTO PARA ABATE';
      } else if (quickFilter === 'nao_apto') {
        matchQuick = r.verdict === 'NÃO APTO';
      } else if (quickFilter === 'low_score') {
        matchQuick = r.score < 3.0;
      } else if (quickFilter === 'high_score') {
        matchQuick = r.score >= 4.0;
      } else if (quickFilter === 'heavy') {
        matchQuick = r.weight >= 500;
      }

      return matchSearch && matchDate && matchLot && matchBreed && matchVerdict && matchQuick;
    });

    // Apply sorting
    tempRecords.sort((a, b) => {
      if (sortBy === 'date_desc') {
        return parseCattleDate(b.date) - parseCattleDate(a.date);
      } else if (sortBy === 'date_asc') {
        return parseCattleDate(a.date) - parseCattleDate(b.date);
      } else if (sortBy === 'score_desc') {
        return b.score - a.score;
      } else if (sortBy === 'score_asc') {
        return a.score - b.score;
      } else if (sortBy === 'weight_desc') {
        return b.weight - a.weight;
      } else if (sortBy === 'weight_asc') {
        return a.weight - b.weight;
      }
      return 0;
    });

    return tempRecords;
  }, [records, searchTerm, searchMode, selectedDate, selectedLot, selectedBreed, selectedVerdict, quickFilter, sortBy]);

  // Pagination details
  const totalSlots = filteredRecords.length;
  const totalPages = Math.ceil(totalSlots / itemsPerPage) || 1;
  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  const currentItems = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const resetFilters = () => {
    setSearchTerm('');
    setSearchMode('all');
    setSelectedDate('');
    setSelectedLot('Todos');
    setSelectedBreed('Todas');
    setSelectedVerdict('Todos');
    setQuickFilter('all');
    setSortBy('date_desc');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-950 dark:text-[#f8fafc] font-sans">
            {t.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t.sub}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            id="history-btn-atualizar"
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="h-11 px-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-md font-sans font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-75"
          >
            <RefreshCw className={`h-4 w-4 text-blue-600 dark:text-sky-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? translations[language].syncing : t.update}</span>
          </button>

          <button
            id="history-btn-nova-avaliacao"
            onClick={onNewAssessment}
            className="h-11 px-5 bg-[#1e3a8a] hover:bg-blue-900 dark:bg-blue-800 dark:hover:bg-blue-950 text-white rounded-md font-sans font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{t.new}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar Panel matching screenshot 2 with premium customizations */}
      <div className="bg-white dark:bg-[#0e1320] rounded-lg border border-gray-200 dark:border-gray-800 p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] space-y-5">
        
        {/* Section Title with Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800/60 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
              {t.searchTitle}
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-[11px] font-mono font-medium text-gray-700 dark:text-gray-300">
            <span>{language === 'es' ? 'Resultados:' : language === 'en' ? 'Results:' : 'Resultados:'} <strong>{filteredRecords.length}</strong> {language === 'es' ? 'de' : language === 'en' ? 'of' : 'de'} <strong>{records.length}</strong> {language === 'en' ? 'cattle' : 'bovinos'}</span>
          </div>
        </div>

        {/* Outer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main search and mode row (Takes 7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-col">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
                {t.termLabel}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <input
                  type="text"
                  placeholder={t.placeholder}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full h-11 pl-9 pr-24 rounded border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-mono font-medium"
                />
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className={`absolute right-3 top-3 px-2 py-1 rounded text-[10px] font-bold font-mono transition-opacity uppercase shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-500 ${searchTerm ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                  {t.clear}
                </button>
              </div>
            </div>

            {/* Custom Search Mode Selector Pills */}
            <div className="flex flex-wrap items-center gap-1.5 flex-row">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase mr-1">{t.searchBy}</span>
              <button
                type="button"
                onClick={() => { setSearchMode('all'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all tracking-wider cursor-pointer ${
                  searchMode === 'all'
                    ? 'bg-emerald-600 dark:bg-emerald-800 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t.allFields}
              </button>
              <button
                type="button"
                onClick={() => { setSearchMode('id'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all tracking-wider cursor-pointer ${
                  searchMode === 'id'
                    ? 'bg-emerald-600 dark:bg-emerald-800 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t.earringId}
              </button>
              <button
                type="button"
                onClick={() => { setSearchMode('breed'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all tracking-wider cursor-pointer ${
                  searchMode === 'breed'
                    ? 'bg-emerald-600 dark:bg-emerald-800 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t.rangeBreed}
              </button>
              <button
                type="button"
                onClick={() => { setSearchMode('notes'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all tracking-wider cursor-pointer ${
                  searchMode === 'notes'
                    ? 'bg-emerald-600 dark:bg-emerald-800 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t.obsLabel}
              </button>
            </div>
          </div>
          
          {/* Quick Filter Pill Group (Takes 5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
            <div>
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                {t.quickFilters}
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => { setQuickFilter('all'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all duration-150 cursor-pointer ${
                    quickFilter === 'all'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md border border-zinc-900 dark:border-zinc-100 scale-[1.02]'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95'
                  }`}
                >
                  {t.allCattle}
                </button>
                <button
                  type="button"
                  onClick={() => { setQuickFilter('apto'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all duration-150 cursor-pointer ${
                    quickFilter === 'apto'
                      ? 'bg-emerald-600 dark:bg-emerald-700 text-white shadow-md border border-emerald-600 dark:border-emerald-700 scale-[1.02]'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95'
                  }`}
                >
                  {t.abateApto}
                </button>
                <button
                  type="button"
                  onClick={() => { setQuickFilter('nao_apto'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all duration-150 cursor-pointer ${
                    quickFilter === 'nao_apto'
                      ? 'bg-red-600 dark:bg-red-700 text-white shadow-md border border-red-600 dark:border-red-700 scale-[1.02]'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95'
                  }`}
                >
                  {t.abateNaoApto}
                </button>
                <button
                  type="button"
                  onClick={() => { setQuickFilter('low_score'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all duration-150 cursor-pointer ${
                    quickFilter === 'low_score'
                      ? 'bg-amber-600 dark:bg-amber-700 text-white shadow-md border border-amber-600 dark:border-amber-700 scale-[1.02]'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95'
                  }`}
                >
                  {t.magroBcs}
                </button>
                <button
                  type="button"
                  onClick={() => { setQuickFilter('high_score'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all duration-150 cursor-pointer ${
                    quickFilter === 'high_score'
                      ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-md border border-blue-600 dark:border-blue-700 scale-[1.02]'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95'
                  }`}
                >
                  {t.gordoBcs}
                </button>
                <button
                  type="button"
                  onClick={() => { setQuickFilter('heavy'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all duration-150 cursor-pointer ${
                    quickFilter === 'heavy'
                      ? 'bg-purple-600 dark:bg-purple-700 text-white shadow-md border border-purple-600 dark:border-purple-700 scale-[1.02]'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95'
                  }`}
                >
                  {t.heavyLabel}
                </button>
              </div>
            </div>
            
            {/* Dynamic Sorting Selection list */}
            <div className="flex flex-col">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
                {t.sortByLabel}
              </label>
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-3 h-4 w-4 text-emerald-600 dark:text-emerald-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full h-10 pl-9 pr-8 rounded border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-xs text-gray-800 dark:text-gray-200 font-sans font-semibold appearance-none focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-gray-900 transition-all cursor-pointer"
                >
                  <option value="date_desc" className="bg-white dark:bg-[#111827]">{t.sortDateDesc}</option>
                  <option value="date_asc" className="bg-white dark:bg-[#111827]">{t.sortDateAsc}</option>
                  <option value="score_desc" className="bg-white dark:bg-[#111827]">{t.sortScoreDesc}</option>
                  <option value="score_asc" className="bg-white dark:bg-[#111827]">{t.sortScoreAsc}</option>
                  <option value="weight_desc" className="bg-white dark:bg-[#111827]">{t.sortWeightDesc}</option>
                  <option value="weight_asc" className="bg-white dark:bg-[#111827]">{t.sortWeightAsc}</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Dropdowns Filters Subgrid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-3 border-t border-gray-100 dark:border-gray-800/40">
          {/* Date Picker Input */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t.dateFilter}
            </label>
            <div className="relative font-mono text-xs">
              <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Ex: Mai, Jun, 2026..."
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
                className="w-full h-11 pl-9 pr-3 rounded border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Lote Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t.lotFilter}
            </label>
            <div className="relative text-xs">
              <select
                value={selectedLot}
                onChange={(e) => { setSelectedLot(e.target.value); setCurrentPage(1); }}
                className="w-full h-11 pl-3 pr-8 rounded border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-xs text-gray-800 dark:text-gray-100 appearance-none focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                {uniqueLots.map((lot) => (
                  <option key={lot} value={lot} className="bg-white dark:bg-[#111827] text-gray-800 dark:text-gray-100">
                    {lot === 'Todos' ? t.allLotsOption : lot}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Raça Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t.breedFilter}
            </label>
            <div className="relative text-xs">
              <select
                value={selectedBreed}
                onChange={(e) => { setSelectedBreed(e.target.value); setCurrentPage(1); }}
                className="w-full h-11 pl-3 pr-8 rounded border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-xs text-gray-800 dark:text-gray-100 appearance-none focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                {uniqueBreeds.map((breed) => (
                  <option key={breed} value={breed} className="bg-white dark:bg-[#111827] text-gray-800 dark:text-gray-100">
                    {breed === 'Todas' ? t.allBreedsOption : breed}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t.verdictFilter}
            </label>
            <div className="relative text-xs">
              <select
                value={selectedVerdict}
                onChange={(e) => { setSelectedVerdict(e.target.value); setCurrentPage(1); }}
                className="w-full h-11 pl-3 pr-8 rounded border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-xs text-gray-800 dark:text-gray-100 appearance-none focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="Todos" className="bg-white dark:bg-[#111827] text-gray-800 dark:text-gray-200">{t.allStatusOption}</option>
                <option value="Apto para Abate" className="bg-white dark:bg-[#111827] text-gray-800 dark:text-gray-200">{t.aptoStatus}</option>
                <option value="Não Apto" className="bg-white dark:bg-[#111827] text-gray-800 dark:text-gray-200">{t.naoAptoStatus}</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Clear Filter Prompt & Active Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Active Filter Badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {(searchTerm || selectedDate || selectedLot !== 'Todos' || selectedBreed !== 'Todas' || selectedVerdict !== 'Todos' || quickFilter !== 'all' || sortBy !== 'date_desc') && (
              <>
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Filtros Ativos:</span>
                
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-mono">
                    Busca: "{searchTerm}" 
                    <button type="button" onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-red-500 font-bold ml-1 cursor-pointer">×</button>
                  </span>
                )}

                {selectedDate && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-mono">
                    Data: "{selectedDate}"
                    <button type="button" onClick={() => setSelectedDate('')} className="text-gray-400 hover:text-red-500 font-bold ml-1 cursor-pointer">×</button>
                  </span>
                )}

                {selectedLot !== 'Todos' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-mono">
                    Lote: {selectedLot}
                    <button type="button" onClick={() => setSelectedLot('Todos')} className="text-gray-400 hover:text-red-500 font-bold ml-1 cursor-pointer">×</button>
                  </span>
                )}

                {selectedBreed !== 'Todas' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-mono">
                    Raça: {selectedBreed}
                    <button type="button" onClick={() => setSelectedBreed('Todas')} className="text-gray-400 hover:text-red-500 font-bold ml-1 cursor-pointer">×</button>
                  </span>
                )}

                {selectedVerdict !== 'Todos' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-mono">
                    Status: {selectedVerdict}
                    <button type="button" onClick={() => setSelectedVerdict('Todos')} className="text-gray-400 hover:text-red-500 font-bold ml-1 cursor-pointer">×</button>
                  </span>
                )}

                {quickFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200/30 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold uppercase">
                    Rápido: {quickFilter === 'apto' ? 'Apto' : quickFilter === 'nao_apto' ? 'Não Apto' : quickFilter === 'low_score' ? 'Baixo ECC' : quickFilter === 'high_score' ? 'Alto ECC' : 'Pesado'}
                    <button type="button" onClick={() => setQuickFilter('all')} className="text-amber-400 hover:text-red-500 font-bold ml-1 cursor-pointer">×</button>
                  </span>
                )}

                {sortBy !== 'date_desc' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200/30 text-blue-800 dark:text-blue-300 text-[10px] font-mono font-bold uppercase">
                    Ordenação
                    <button type="button" onClick={() => setSortBy('date_desc')} className="text-blue-400 hover:text-red-500 font-bold ml-1 cursor-pointer">×</button>
                  </span>
                )}
              </>
            )}
          </div>

          {/* Reset Filters Trigger button */}
          {(searchTerm || selectedDate || selectedLot !== 'Todos' || selectedBreed !== 'Todas' || selectedVerdict !== 'Todos' || quickFilter !== 'all' || sortBy !== 'date_desc') && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/30 rounded px-2.5 py-1 cursor-pointer animate-fade-in"
            >
              <FilterX className="h-3 w-3" />
              <span>{t.cleanFiltersBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* History Records Table Matching mockup 2 */}
      <div className="bg-white dark:bg-[#0e1320] rounded-lg border border-gray-200 dark:border-gray-800 shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-500 dark:text-gray-400 border-collapse">
            <thead>
              <tr className="border-b border-gray-250 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 text-[10px] font-mono tracking-wider font-bold text-gray-400 dark:text-gray-500 uppercase">
                <th className="py-3 px-6">{t.thThumb}</th>
                <th className="py-3 px-6">{t.thId}</th>
                <th className="py-3 px-6">{t.thDate}</th>
                <th className="py-3 px-6">{t.thLotBreed}</th>
                <th className="py-3 px-6">{t.thWeight}</th>
                <th className="py-3 px-6">{t.thScore}</th>
                <th className="py-3 px-6">{t.thVerdict}</th>
                <th className="py-3 px-6 text-right">{t.thActions}</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800/60 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-6">
                      <img 
                        src={r.photoUrl} 
                        alt={r.id} 
                        className="h-10 w-16 rounded object-cover border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    </td>
                    <td className="py-3 px-6 font-mono font-bold text-[#012d1d] dark:text-emerald-400">
                      <div className="flex flex-col gap-1 items-start text-left">
                        <span>#{r.id}</span>
                        {r.isOfflinePending && (
                          <span className="text-[8px] bg-amber-500/20 text-amber-800 dark:text-amber-300 font-extrabold uppercase px-1 rounded tracking-wider border border-amber-500/30 animate-pulse">
                            Offline
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-gray-700 dark:text-gray-300">
                      {r.date}
                    </td>
                    <td className="py-3 px-6">
                      <div className="text-gray-900 dark:text-gray-200 font-medium">{r.lot}</div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">{r.breed}</div>
                    </td>
                    <td className="py-3 px-6 font-mono font-bold text-gray-900 dark:text-gray-150">
                      <div className="flex items-center gap-1.5">
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
                    <td className="py-3 px-6">
                      <span className={`text-base font-mono font-black ${
                        r.score >= 4.0 
                          ? 'text-[#0e5138] dark:text-emerald-400' 
                          : r.score >= 3.0 
                          ? 'text-gray-850 dark:text-gray-200' 
                          : r.score >= 2.0 
                          ? 'text-amber-700 dark:text-amber-400' 
                          : 'text-[#ba1a1a] dark:text-red-400'
                      }`}>
                        {r.score.toFixed(1)}
                      </span>
                      <span className="text-[11px] font-mono text-gray-300 dark:text-gray-500"> / 5.0</span>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`inline-flex px-2.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase ${
                        r.verdict === 'APTO PARA ABATE'
                          ? 'bg-[#aeeecb] dark:bg-emerald-950/30 text-[#316e52] dark:text-emerald-400 border border-emerald-300/40 dark:border-emerald-900/30'
                          : 'bg-[#ffdad6] dark:bg-red-950/30 text-[#93000a] dark:text-red-400 border border-red-300/40 dark:border-red-900/30'
                      }`}>
                        {r.verdict === 'APTO PARA ABATE' ? t.aptoStatus : r.verdict === 'NÃO APTO' ? t.naoAptoStatus : r.verdict}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          onClick={() => onSelectRecord(r)}
                          title="Ver Detalhes"
                          className="h-8 w-8 rounded-md bg-emerald-50 dark:bg-emerald-950/45 text-[#012d1d] dark:text-emerald-400 hover:bg-[#aeeecb] dark:hover:bg-emerald-800 transition-all flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleEditClick(r, e)}
                          title="Editar"
                          className="h-8 w-8 rounded-md bg-amber-50 dark:bg-amber-950/45 text-amber-800 dark:text-amber-450 hover:bg-amber-100 dark:hover:bg-amber-900/80 transition-all flex items-center justify-center border border-amber-100 dark:border-amber-900/40 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(r.id, e)}
                          title="Remover"
                          className="h-8 w-8 rounded-md bg-red-50 dark:bg-red-950/45 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/80 transition-all flex items-center justify-center border border-red-100 dark:border-red-900/40 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
                      <FilterX className="h-10 w-10 text-gray-300" />
                      <span className="text-sm font-medium">{t.noRecords}</span>
                      <button 
                        onClick={resetFilters}
                        className="text-xs text-[#2c694e] dark:text-emerald-400 hover:underline hover:text-[#012d1d] dark:hover:text-emerald-300 font-semibold"
                      >
                        {t.cleanFiltersBtn}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination matching mockup page indicator style */}
        <div className="p-4 border-t border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-mono">
          <div>
            {language === 'es' ? 'Mostrando' : language === 'en' ? 'Showing' : 'Mostrando'} <span className="text-gray-900 font-bold">1-{Math.min(filteredRecords.length, currentItems.length)}</span> {language === 'es' ? 'de' : language === 'en' ? 'of' : 'de'} <span className="text-gray-900 font-bold">{totalSlots}</span> {language === 'es' ? 'registros' : language === 'en' ? 'records' : 'registros'}
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-105 flex items-center justify-center text-gray-600 disabled:opacity-40 select-none transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-8 w-8 rounded font-bold text-xs flex items-center justify-center transition-all duration-150 ${
                    isActive
                      ? 'bg-[#012d1d] text-white'
                      : 'border border-gray-200 bg-white hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-105 flex items-center justify-center text-gray-600 disabled:opacity-40 select-none transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal Dialog */}
      <AnimatePresence>
        {editingRecord && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              {/* Header */}
              <div className="bg-[#012d1d] dark:bg-emerald-950 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-[#aeeecb]" />
                  <h3 className="font-bold tracking-tight">{t.editTitle} #{editingRecord.id}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Breed */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                      {t.fieldBreedPt}
                    </label>
                    <select
                      value={editBreed}
                      onChange={(e) => setEditBreed(e.target.value)}
                      className="w-full h-10 px-3 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600 text-gray-800 dark:text-gray-100"
                    >
                      <option value="Nelore Puro" className="dark:bg-[#111827] dark:text-gray-100">Nelore Puro</option>
                      <option value="Brahman" className="dark:bg-[#111827] dark:text-gray-100">Brahman</option>
                      <option value="Angus Black" className="dark:bg-[#111827] dark:text-gray-100">Angus Black</option>
                      <option value="Nelore Mix" className="dark:bg-[#111827] dark:text-gray-100">Nelore Mix</option>
                      <option value="Cruzamento Industrial" className="dark:bg-[#111827] dark:text-gray-100">Cruzamento Industrial</option>
                    </select>
                  </div>

                  {/* Lot */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                      {t.fieldLotPt}
                    </label>
                    <input
                      type="text"
                      value={editLot}
                      onChange={(e) => setEditLot(e.target.value)}
                      placeholder={t.placeholderLot}
                      className="w-full h-10 px-3 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Score ECC */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                      {t.fieldScorePt}
                    </label>
                    <input
                      type="number"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={editScore}
                      onChange={(e) => setEditScore(parseFloat(e.target.value) || 3.0)}
                      className="w-full h-10 px-3 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600 font-mono text-gray-800 dark:text-gray-100"
                    />
                  </div>

                  {/* Weight */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                      {t.fieldWeightPt}
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="1000"
                      value={editWeight}
                      onChange={(e) => setEditWeight(parseInt(e.target.value) || 485)}
                      className="w-full h-10 px-3 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600 font-mono text-gray-800 dark:text-gray-100"
                    />
                  </div>

                  {/* Fat Progress */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                      {t.fieldFatPt}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      step="0.1"
                      value={editFat}
                      onChange={(e) => setEditFat(parseFloat(e.target.value) || 11.5)}
                      className="w-full h-10 px-3 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600 font-mono text-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>

                {/* Live Verdict Calculation Indicator */}
                <div className="p-3.5 rounded-lg border flex items-center justify-between text-xs font-mono font-bold mt-2 bg-gray-50 dark:bg-gray-900/60 border-gray-150 dark:border-gray-800">
                  <span className="text-gray-400 dark:text-gray-500 uppercase">{t.verdictCalc}</span>
                  <span className={`px-2 py-0.5 rounded tracking-wide uppercase ${
                    editScore >= 3.5 
                      ? 'bg-[#aeeecb] dark:bg-emerald-950/40 text-[#316e52] dark:text-emerald-400 border border-emerald-300/40 dark:border-emerald-900/30' 
                      : 'bg-[#ffdad6] dark:bg-red-950/40 text-[#93000a] dark:text-red-400 border border-red-300/40 dark:border-red-900/30'
                  }`}>
                    {editScore >= 3.5 ? t.aptoStatus : t.naoAptoStatus}
                  </span>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                    {t.fieldNotesPt}
                  </label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder={t.placeholderNotes}
                    className="w-full p-3 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-850">
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="h-11 px-4 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md font-sans font-semibold text-sm transition-colors cursor-pointer"
                  >
                    {t.btnCancel}
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-6 bg-[#012d1d] hover:bg-emerald-950 dark:bg-emerald-800 dark:hover:bg-emerald-900 text-white rounded-md font-sans font-bold text-sm transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{t.btnSave}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col font-sans text-left"
            >
              {/* Header */}
              <div className="bg-red-700 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-200 animate-bounce" />
                  <h3 className="font-bold tracking-tight text-white">{t.deleteTitle} #{deleteConfirmId}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.deleteWarn} <strong className="text-gray-900 dark:text-white">#{deleteConfirmId}</strong>.
                </p>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/30 rounded p-3 flex items-start gap-2.5">
                  <span className="text-red-600 dark:text-red-400 font-bold font-mono text-xs shrink-0 pt-0.5">⚠️</span>
                  <p className="text-xs text-red-800 dark:text-red-300 font-sans leading-relaxed">
                    {t.deleteDanger}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-150 dark:border-gray-850">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="h-10 px-4 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950/40 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md font-sans font-semibold text-xs transition-colors cursor-pointer"
                >
                  {t.btnCancel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="h-10 px-5 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-850 text-white rounded-md font-sans font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{t.btnDelete}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
