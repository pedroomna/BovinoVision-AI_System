/**
 * Translation Dictionary for BovinoVision AI
 * Supports Portuguese (pt), Spanish (es), and English (en)
 */

export type Language = 'pt' | 'es' | 'en';

export const translations = {
  pt: {
    // Header & Brand
    appSub: 'Sistema de Análise da Condição Corporal de Bovinos para Determinar o Momento Ideal de Abate Utilizando Visão Computacional',
    serverAiOnline: 'IA Servidor Online',
    localAiActive: 'IA Local Ativa',
    notifTitle: 'Notificações Veterinárias',
    markRead: 'Marcar lidas',
    closePanel: 'Fechar Painel',
    vetSpecialty: 'Veterinário Chefe',
    
    // Tabs & Navigation
    dashboard: 'Painel',
    assessments: 'Avaliações',
    history: 'Histórico',
    reports: 'Relatórios',
    sideOverview: 'Visão Geral',
    sideHealth: 'Dados de Saúde',
    sideAnalytics: 'Análise do Rebanho',
    sideTechnical: 'Suporte Técnico',
    sideMyAccount: 'Minha Conta',
    sideLogout: 'Sair (Logout)',
    newAssessment: 'Nova Avaliação',
    mobileMenuLabel: 'Menu Lateral',
    modulesLabel: 'Módulos BovinoVision',
    mainNavigation: 'Navegação Principal',

    // Settings Modal
    settingsTitle: 'Configurações de Parâmetros',
    cameraCalib: 'Calibração Óptica e Alinhamento',
    cameraCalibSub: 'Autocompensar distorção analítica de lente e luz campestre',
    minConfidence: 'Mapeamento de Precisão Biométrica',
    minConfidenceSub: 'Descartar diagnósticos abaixo deste valor',
    minPct: '% MÍN.',
    criticalEcc: 'Notificações Críticas de ECC',
    criticalEccSub: 'Enviar alertas automáticos para o celular do manejador',
    standardWeight: 'Unidade de Peso Padrão',
    weightKg: 'Quilos (kg)',
    weightArroba: 'Arroba (@)',
    cancel: 'Cancelar',
    saveSettings: 'Salvar Ajustes',
    saved: 'Salvo!',

    // Language Selector
    langSelectTitle: 'Idioma do Sistema',
    langPt: 'Português',
    langEs: 'Espanhol',
    langEn: 'Inglês',
    langSelectLabel: 'Selecionar Idioma',

    // Offline / Status
    offlineMode: 'Modo Offline (Simulação)',
    onlineMode: 'IA Real Ativa',

    // Dashboard View
    herdSummary: 'Resumo do Rebanho',
    herdSummarySub: 'Monitoramento em tempo real do Setor de Pasto Norte e escoragem inteligente',
    syncTelemetry: 'Sincronizar Telemetria',
    syncing: 'Sincronizando...',
    totalAnimals: 'Total de Animais',
    readySlaughter: 'Prontos para Abate',
    bcsAverage: 'Média de ECC do Rebanho',
    newThisWeek: 'novos esta semana',
    idealCarcass: 'animais com carcaça ideal',
    optimalBcs: 'escore ótimo (3.2 a 3.7)',
    recentAssessments: 'Últimas Avaliações',
    viewFullHistory: 'Visualizar Todo Histórico',
    lotTag: 'Lote / Brinco',
    finalBcs: 'ECC Final',
    aiDiag: 'Diagnóstico IA',
    status: 'Status',
    predictiveAi: 'Análise Preditiva por IA',
    recommendedInsights: 'Insights recomendados por BovinoVision IA',
    generateReportCsv: 'Gerar Relatório CSV',
  },
  es: {
    // Header & Brand
    appSub: 'Sistema de Análisis de la Condición Corporal de Bovinos para Determinar el Momento Ideal de Sacrificio Utilizando Visión Computacional',
    serverAiOnline: 'IA de Servidor Online',
    localAiActive: 'IA Local Activa',
    notifTitle: 'Notificaciones Veterinarias',
    markRead: 'Marcar como leídas',
    closePanel: 'Cerrar Panel',
    vetSpecialty: 'Veterinario Jefe',

    // Tabs & Navigation
    dashboard: 'Tablero',
    assessments: 'Evaluaciones',
    history: 'Historial',
    reports: 'Reportes',
    sideOverview: 'Vista General',
    sideHealth: 'Datos de Salud',
    sideAnalytics: 'Análisis del Rebaño',
    sideTechnical: 'Soporte Técnico',
    sideMyAccount: 'Mi Cuenta',
    sideLogout: 'Salir (Cerrar Sesión)',
    newAssessment: 'Nueva Evaluación',
    mobileMenuLabel: 'Menú Lateral',
    modulesLabel: 'Módulos BovinoVision',
    mainNavigation: 'Navegación Principal',

    // Settings Modal
    settingsTitle: 'Configuración del Sistema',
    cameraCalib: 'Calibración Óptica y Alineación',
    cameraCalibSub: 'Autocompensar distorsión analítica de lente y luz campestre',
    minConfidence: 'Mapeo de Precisión Biométrica',
    minConfidenceSub: 'Descartar diagnósticos por debajo de este valor',
    minPct: '% MÍN.',
    criticalEcc: 'Notificaciones Críticas de ECC',
    criticalEccSub: 'Enviar alertas automáticas al celular del encargado',
    standardWeight: 'Unidad de Peso Estándar',
    weightKg: 'Kilos (kg)',
    weightArroba: 'Arroba (@)',
    cancel: 'Cancelar',
    saveSettings: 'Guardar Ajustes',
    saved: '¡Guardado!',

    // Language Selector
    langSelectTitle: 'Idioma del Sistema',
    langPt: 'Portugués',
    langEs: 'Español',
    langEn: 'Inglés',
    langSelectLabel: 'Seleccionar Idioma',

    // Offline / Status
    offlineMode: 'Modo Offline (Simulación)',
    onlineMode: 'IA Real Activa',

    // Dashboard View
    herdSummary: 'Resumen del Rebaño',
    herdSummarySub: 'Monitoreo en tiempo real del Sector de Pasto Norte y puntuación inteligente',
    syncTelemetry: 'Sincronizar Telemetría',
    syncing: 'Sincronizando...',
    totalAnimals: 'Total de Animales',
    readySlaughter: 'Listos para Sacrificio',
    bcsAverage: 'Media de ECC del Rebaño',
    newThisWeek: 'nuevos esta semana',
    idealCarcass: 'animales con canal ideal',
    optimalBcs: 'puntuación óptima (3.2 a 3.7)',
    recentAssessments: 'Últimas Evaluaciones',
    viewFullHistory: 'Ver Todo el Historial',
    lotTag: 'Lote / Arete',
    finalBcs: 'ECC Final',
    aiDiag: 'Diagnóstico IA',
    status: 'Estado',
    predictiveAi: 'Análisis Predictivo por IA',
    recommendedInsights: 'Insights recomendados por BovinoVision IA',
    generateReportCsv: 'Generar Reporte CSV',
  },
  en: {
    // Header & Brand
    appSub: 'Bovine Body Condition Analysis System to Determine the Ideal Slaughter Point Using Computer Vision',
    serverAiOnline: 'Server AI Online',
    localAiActive: 'Local AI Active',
    notifTitle: 'Veterinary Notifications',
    markRead: 'Mark as read',
    closePanel: 'Close Panel',
    vetSpecialty: 'Chief Veterinarian',

    // Tabs & Navigation
    dashboard: 'Dashboard',
    assessments: 'Assessments',
    history: 'History',
    reports: 'Reports',
    sideOverview: 'Overview',
    sideHealth: 'Health Data',
    sideAnalytics: 'Herd Analytics',
    sideTechnical: 'Technical Support',
    sideMyAccount: 'My Account',
    sideLogout: 'Logout',
    newAssessment: 'New Assessment',
    mobileMenuLabel: 'Side Menu',
    modulesLabel: 'BovinoVision Modules',
    mainNavigation: 'Main Navigation',

    // Settings Modal
    settingsTitle: 'System Settings',
    cameraCalib: 'Optical Lens Calibration',
    cameraCalibSub: 'Auto-compensate analytic lens and field lighting distortion',
    minConfidence: 'Biometric Analysis Precision',
    minConfidenceSub: 'Discard diagnostics below this value',
    minPct: '% MIN.',
    criticalEcc: 'Critical BCS Notifications',
    criticalEccSub: 'Send automatic alerts to the handler\'s mobile phone',
    standardWeight: 'Standard Weight Unit',
    weightKg: 'Kilograms (kg)',
    weightArroba: 'Arroba (@)',
    cancel: 'Cancel',
    saveSettings: 'Save Settings',
    saved: 'Saved!',

    // Language Selector
    langSelectTitle: 'System Language',
    langPt: 'Portuguese',
    langEs: 'Spanish',
    langEn: 'English',
    langSelectLabel: 'Select Language',

    // Offline / Status
    offlineMode: 'Offline Mode (Simulation)',
    onlineMode: 'Real AI Active',

    // Dashboard View
    herdSummary: 'Herd Summary',
    herdSummarySub: 'Real-time monitoring of North Pasture sector and smart scoring',
    syncTelemetry: 'Synchronize Telemetry',
    syncing: 'Synchronizing...',
    totalAnimals: 'Total Animals',
    readySlaughter: 'Ready for Slaughter',
    bcsAverage: 'Herd BCS Average',
    newThisWeek: 'new this week',
    idealCarcass: 'animals with ideal carcass',
    optimalBcs: 'optimal score (3.2 to 3.7)',
    recentAssessments: 'Recent Assessments',
    viewFullHistory: 'View Full History',
    lotTag: 'Lot / Tag',
    finalBcs: 'Final BCS',
    aiDiag: 'AI Diagnostic',
    status: 'Status',
    predictiveAi: 'Predictive AI Analysis',
    recommendedInsights: 'Insights recommended by BovinoVision AI',
    generateReportCsv: 'Generate CSV Report',
  }
};
