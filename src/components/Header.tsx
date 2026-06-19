/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Settings, HelpCircle, Activity, Menu, X, Check, Eye, SunDim, Moon, Sparkles, Play, RefreshCw } from 'lucide-react';
import { ActiveTab, AppNotification, UserProfile } from '../types';
import { translations, Language } from '../translations';

function formatNotificationTime(notif: AppNotification): string {
  let date: Date | null = null;
  
  if (notif.createdAt) {
    const parsed = new Date(notif.createdAt);
    if (!isNaN(parsed.getTime())) {
      date = parsed;
    }
  } else if (typeof notif.id === 'string' && notif.id.startsWith('notif_')) {
    const timestampStr = notif.id.split('_')[1];
    if (timestampStr) {
      const timestampVal = parseInt(timestampStr, 10);
      if (!isNaN(timestampVal)) {
        date = new Date(timestampVal);
      }
    }
  } else if (typeof notif.id === 'string' && notif.id.startsWith('init-')) {
    // Retorna os valores corretos predefinidos da semeadura inicial
    if (notif.id.includes('init-1')) {
      return 'há 10 minutos';
    } else if (notif.id.includes('init-2')) {
      return 'há 2 horas';
    } else if (notif.id.includes('init-3')) {
      return 'há 1 dia';
    }
  }

  if (!date) {
    return notif.time || 'Agora mesmo';
  }

  const diffMs = Date.now() - date.getTime();
  
  if (diffMs < 5000) {
    return 'Agora mesmo';
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) {
    return 'Agora mesmo';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? 'há 1 minuto' : `há ${diffMinutes} minutos`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? 'há 1 hora' : `há ${diffHours} horas`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return diffDays === 1 ? 'há 1 dia' : `há ${diffDays} dias`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return diffMonths === 1 ? 'há 1 mês' : `há ${diffMonths} meses`;
  }

  const diffYears = Math.floor(diffDays / 365);
  return diffYears === 1 ? 'há 1 ano' : `há ${diffYears} anos`;
}

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  geminiActive: boolean;
  onToggleMobileMenu?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  profileName?: string;
  profilePhoto?: string;
  profileSpecialty?: string;
  onReplayLogoSplash?: () => void;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onDismissNotification: (id: string | number) => void;
  onProfileClick?: () => void;
  isFirebaseConfigured?: boolean;
  isSupabaseConfigured?: boolean;
  userProfile?: UserProfile;
  onProfileChange?: (profile: UserProfile) => void;
  realDataOnly?: boolean;
  onToggleRealDataOnly?: (val: boolean) => void;
}

export default function Header({ 
  activeTab, 
  setActiveTab, 
  geminiActive,
  onToggleMobileMenu,
  theme,
  onToggleTheme,
  profileName = "Dr. Pedro Almeida",
  profilePhoto = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=clamp&w=150&h=150&q=80",
  profileSpecialty = "Veterinário Chefe",
  onReplayLogoSplash,
  language = 'pt',
  onLanguageChange = () => {},
  notifications = [],
  onMarkAllRead = () => {},
  onDismissNotification = () => {},
  onProfileClick,
  isFirebaseConfigured = false,
  isSupabaseConfigured = false,
  userProfile,
  onProfileChange = () => {},
  realDataOnly = false,
  onToggleRealDataOnly = () => {}
}: HeaderProps) {
  // Modal states
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const hasUnreadAlerts = notifications.some(notif => notif.unread);
  const unreadCount = notifications.filter(notif => notif.unread).length;

  // Settings states
  const [cameraCalibration, setCameraCalibration] = useState(true);
  const [aiConfidenceConfidence, setAiConfidenceConfidence] = useState(90);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'arroba'>('kg');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // SMTP Live integration states
  const [smtpHost, setSmtpHost] = useState(userProfile?.smtpConfig?.host || '');
  const [smtpPort, setSmtpPort] = useState(userProfile?.smtpConfig?.port || 587);
  const [smtpSecure, setSmtpSecure] = useState(userProfile?.smtpConfig?.secure || false);
  const [smtpUser, setSmtpUser] = useState(userProfile?.smtpConfig?.user || '');
  const [smtpPass, setSmtpPass] = useState(userProfile?.smtpConfig?.pass || '');
  const [smtpFrom, setSmtpFrom] = useState(userProfile?.smtpConfig?.from || '');

  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);

  useEffect(() => {
    if (userProfile?.smtpConfig) {
      setSmtpHost(userProfile.smtpConfig.host || '');
      setSmtpPort(userProfile.smtpConfig.port || 587);
      setSmtpSecure(userProfile.smtpConfig.secure || false);
      setSmtpUser(userProfile.smtpConfig.user || '');
      setSmtpPass(userProfile.smtpConfig.pass || '');
      setSmtpFrom(userProfile.smtpConfig.from || '');
    }
  }, [userProfile]);

  const t = translations[language];

  const renderFlag = (code: Language) => {
    switch (code) {
      case 'pt':
        return (
          <svg viewBox="0 0 720 504" className="w-full h-full object-cover">
            <rect width="720" height="504" fill="#009c3b" />
            <polygon points="360,40 648,252 360,464 72,252" fill="#ffdf00" />
            <circle cx="360" cy="252" r="115" fill="#002171" />
            <path d="M 245 252 A 115 115 0 0 0 475 252 A 115 115 0 0 1 245 252" fill="#ffffff" />
          </svg>
        );
      case 'es':
        return (
          <svg viewBox="0 0 750 500" className="w-full h-full object-cover">
            <rect width="750" height="500" fill="#c60b1e" />
            <rect y="125" width="750" height="250" fill="#fec60b" />
          </svg>
        );
      case 'en':
        return (
          <svg viewBox="0 0 741 390" className="w-full h-full object-cover">
            <rect width="741" height="390" fill="#ffffff" />
            <g fill="#b22234">
              <rect width="741" height="30" />
              <rect y="60" width="741" height="30" />
              <rect y="120" width="741" height="30" />
              <rect y="180" width="741" height="30" />
              <rect y="240" width="741" height="30" />
              <rect y="300" width="741" height="30" />
              <rect y="360" width="741" height="30" />
            </g>
            <rect width="296" height="210" fill="#3c3b6e" />
            <g fill="#ffffff">
              <circle cx="40" cy="30" r="6" />
              <circle cx="90" cy="30" r="6" />
              <circle cx="140" cy="30" r="6" />
              <circle cx="190" cy="30" r="6" />
              <circle cx="240" cy="30" r="6" />
              
              <circle cx="65" cy="65" r="6" />
              <circle cx="115" cy="65" r="6" />
              <circle cx="165" cy="65" r="6" />
              <circle cx="215" cy="65" r="6" />

              <circle cx="40" cy="100" r="6" />
              <circle cx="90" cy="100" r="6" />
              <circle cx="140" cy="100" r="6" />
              <circle cx="190" cy="100" r="6" />
              <circle cx="240" cy="100" r="6" />
              
              <circle cx="65" cy="135" r="6" />
              <circle cx="115" cy="135" r="6" />
              <circle cx="165" cy="135" r="6" />
              <circle cx="215" cy="135" r="6" />

              <circle cx="40" cy="170" r="6" />
              <circle cx="90" cy="170" r="6" />
              <circle cx="140" cy="170" r="6" />
              <circle cx="190" cy="170" r="6" />
              <circle cx="240" cy="170" r="6" />
            </g>
          </svg>
        );
      default:
        return null;
    }
  };

  const languageOptions: { code: Language; label: string }[] = [
    { code: 'pt', label: 'Português' },
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
  ];

  const handleSaveSettings = () => {
    if (userProfile) {
      onProfileChange({
        ...userProfile,
        smtpConfig: {
          host: smtpHost,
          port: Number(smtpPort),
          secure: smtpSecure,
          user: smtpUser,
          pass: smtpPass,
          from: smtpFrom || smtpUser,
        }
      });
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSettings(false);
    }, 1200);
  };

  const handleTestSmtpConnection = async () => {
    if (!smtpHost || !smtpUser || !smtpPass) {
      setSmtpTestResult({
        success: false,
        message: 'Preencha os campos "Servidor SMTP", "Usuário" e "Senha" para realizar o teste primário.'
      });
      return;
    }

    setSmtpTesting(true);
    setSmtpTestResult(null);

    try {
      const response = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          smtp: {
            host: smtpHost,
            port: Number(smtpPort),
            secure: smtpSecure,
            user: smtpUser,
            pass: smtpPass,
            from: smtpFrom || smtpUser
          },
          recipient: userProfile?.email || 'veterinario@bovinovision.com'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Falha na verificação SMTP.');
      }

      setSmtpTestResult({
        success: true,
        message: data.message,
        url: data.etherealUrl
      });
    } catch (err: any) {
      console.error('SMTP test error:', err);
      setSmtpTestResult({
        success: false,
        message: err.message || 'Falha de conexão SMTP. Verifique as credenciais.'
      });
    } finally {
      setSmtpTesting(false);
    }
  };

  return (
    <header className={`h-[104px] md:h-16 w-full border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-[#0e1320]/95 backdrop-blur-md sticky top-0 px-3 md:px-6 flex flex-col md:flex-row md:items-center md:justify-between transition-all duration-200 ${showSettings ? 'z-[100]' : 'z-40'}`} id="bv-header">
      {/* Row 1 (Mobile) or Left Aligned Branding on Desktop */}
      <div className="flex items-center justify-between w-full md:w-auto h-14 md:h-full" id="bv-header-row1">
        {/* Brand & Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-3" id="bv-header-brand-group">
          {/* Toggle Mobile Menu Hamburger (Visible on mobile/tablet) */}
          {onToggleMobileMenu && (
            <button 
              id="header-btn-hamburger"
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-[#1e3a8a] dark:hover:text-sky-350 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer"
              aria-label="Abrir menu lateral"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="flex flex-col text-left justify-center cursor-pointer select-none" onClick={() => setActiveTab('dashboard')} id="bv-header-logo-text">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap">
              <span className="font-sans font-extrabold text-sm sm:text-base md:text-lg lg:text-xl tracking-tight text-[#1e3a8a] dark:text-sky-400 leading-none whitespace-nowrap">
                BovinoVision AI
              </span>
              {isSupabaseConfigured && (
                <span className="bg-blue-500/10 text-blue-600 dark:text-sky-400 text-[8px] font-black px-1.5 py-0.5 rounded border border-blue-500/20 font-mono tracking-wider leading-none shadow-sm uppercase shrink-0">SUPABASE</span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] md:text-[11px] text-gray-400 dark:text-gray-500 font-sans font-medium tracking-wide mt-1 leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px] sm:max-w-none">
              Pecuária de Precisão Inteligente
            </span>
          </div>
        </div>

        {/* Mobile Brand utilities displayed ONLY on mobile/tablets */}
        <div className="flex md:hidden items-center gap-0.5 sm:gap-1.5 relative" id="bv-header-mobile-utilities">
          {/* Mobile Bell Notif */}
          <div className="relative">
            <button 
              id="header-btn-notifications-mobile"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettings(false);
              }}
              className={`p-1 sm:p-2 rounded-full transition-all duration-150 cursor-pointer active:scale-95 relative ${
                showNotifications ? 'bg-blue-50 dark:bg-blue-950/40 text-[#1e3a8a] dark:text-sky-300' : 'text-gray-500 dark:text-gray-400 hover:text-[#1e3a8a] dark:hover:text-sky-300 hover:bg-gray-50 dark:hover:bg-gray-850'
              }`}
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-rose-600 text-white font-sans text-[8px] font-black rounded-full ring-2 ring-white dark:ring-gray-900 shadow-sm leading-none animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Language Selector */}
          <div 
            id="mobile-language-container" 
            className="relative shrink-0 flex items-center transition-all duration-200"
            onMouseEnter={() => {
              setShowLanguageSelector(true);
              setShowNotifications(false);
            }}
            onMouseLeave={() => {
              setShowLanguageSelector(false);
            }}
          >
            <button 
              id="mobile-language-btn"
              onClick={() => {
                setShowLanguageSelector(!showLanguageSelector);
                setShowNotifications(false);
              }}
              className="p-1 sm:p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95"
              title={t.langSelectLabel}
            >
              <span className="w-5 h-5 rounded-full inline-flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-900 shadow-sm transition-transform hover:scale-105">
                {renderFlag(language)}
              </span>
            </button>
            
            {showLanguageSelector && (
              <div 
                id="mobile-language-dropdown" 
                className="absolute right-0 mt-8 w-44 bg-white dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden z-50 animate-fade-in text-left"
              >
                <div className="p-2.5 bg-gray-50 dark:bg-gray-950/60 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-[9px] font-mono uppercase tracking-widest font-black text-gray-400 dark:text-gray-505">{t.langSelectLabel}</span>
                </div>
                <div className="p-1 space-y-0.5 animate-slide-up">
                  {languageOptions.map((opt) => {
                    const isSelected = language === opt.code;
                    return (
                      <button
                        key={opt.code}
                        onClick={() => {
                          onLanguageChange(opt.code);
                          setShowLanguageSelector(false);
                        }}
                        className={`w-full flex items-center px-2.5 py-2 rounded-lg text-left text-[11px] font-semibold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-50/70 text-[#1e3a8a] dark:bg-blue-950/30 dark:text-sky-450 dark:text-sky-400 font-bold' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <span className="w-4 h-4 rounded-full inline-flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
                            {renderFlag(opt.code)}
                          </span>
                          <span>{opt.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Theme toggle */}
          <button 
            id="header-btn-theme-toggle-mobile"
            onClick={onToggleTheme}
            className="p-1 sm:p-2 text-gray-500 hover:text-[#1e3a8a] dark:text-gray-400 dark:hover:text-sky-300 rounded-full hover:bg-gray-55 dark:hover:bg-gray-850 transition-all duration-150 active:scale-95"
            title={theme === 'light' ? 'Tema Escuro' : 'Tema Claro'}
          >
            {theme === 'light' ? (
              <Moon className="h-4.5 w-4.5 text-gray-500 hover:text-[#1e3a8a] hover:rotate-12 transition-transform" />
            ) : (
              <SunDim className="h-4.5 w-4.5 text-gray-400 hover:text-amber-400 hover:rotate-45 transition-transform" />
            )}
          </button>

          {/* Mobile Settings */}
          <button 
            id="header-btn-settings-mobile"
            onClick={() => {
              setShowSettings(true);
              setShowNotifications(false);
            }}
            className="p-1 sm:p-2 text-gray-500 hover:text-[#1e3a8a] dark:text-gray-400 dark:hover:text-sky-350 rounded-full hover:bg-gray-50 dark:hover:bg-gray-850/80 transition-colors"
          >
            <Settings className="h-4.5 w-4.5" />
          </button>

          {/* Avatar image */}
          <button
            onClick={onProfileClick}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-full shrink-0 ml-1 transition-transform hover:scale-105 active:scale-95 duration-150 cursor-pointer"
            title="Ver Perfil"
          >
            <img
              src={profilePhoto}
              alt="Usuário Vet"
              className="h-7.5 w-7.5 rounded-full border border-gray-205 dark:border-gray-750 object-cover pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>

      {/* Row 2 (Mobile) or Center Stage on Desktop - Always Visible Navigation */}
      <nav id="header-navigation-tabs" className="flex items-center justify-between md:justify-center w-full md:w-auto h-11 md:h-full border-t md:border-t-0 border-gray-100 dark:border-gray-800/40 md:space-x-1 lg:space-x-3 px-1 md:my-0">
        {(['dashboard', 'assessments', 'history', 'reports'] as ActiveTab[]).map((tab) => {
          const isActive = activeTab === tab;
          const labels: Record<ActiveTab, string> = {
            dashboard: t.dashboard,
            assessments: t.assessments,
            history: t.history,
            reports: t.reports,
          };

          return (
            <button
              key={tab}
              id={`nav-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`h-full flex-1 md:flex-initial px-3 lg:px-4 flex items-center justify-center text-xs md:text-sm font-semibold transition-all relative cursor-pointer group active:scale-98 ${
                isActive 
                  ? 'text-[#1e3a8a] dark:text-sky-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-[#1e3a8a] dark:hover:text-sky-350 md:hover:bg-gray-50/80 dark:md:hover:bg-gray-850/40 md:rounded-xl md:h-10 my-auto'
              }`}
            >
              <span className="relative z-10">{labels[tab]}</span>
              {isActive && (
                <div 
                  className="absolute bottom-0 left-2.5 right-2.5 md:left-2 md:right-2 h-[3px] bg-[#1e3a8a] dark:bg-sky-400 rounded-full animate-fade-in" 
                  id={`nav-tab-underline-${tab}`}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Desktop-only right utilities */}
      <div className="hidden md:flex items-center gap-3 relative h-full" id="bv-header-desktop-utilities">
        {/* Bell Alert Notification */}
        <div className="relative">
          <button 
            id="header-btn-notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowSettings(false);
            }}
            className={`p-2 rounded-full transition-all duration-150 cursor-pointer active:scale-95 relative ${
              showNotifications ? 'bg-blue-50 dark:bg-blue-950/35 text-[#1e3a8a] dark:text-sky-300' : 'text-gray-500 dark:text-gray-400 hover:text-[#1e3a8a] dark:hover:text-sky-300 hover:bg-gray-50 dark:hover:bg-gray-850/60'
            }`}
          >
            <Bell className="h-4.8 w-4.8" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 flex items-center justify-center bg-rose-600 text-white font-sans text-[9px] font-black rounded-full ring-2 ring-white dark:ring-[#0e1320] shadow-sm leading-none animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Language Dropdown Selector in Header */}
        <div 
          id="header-language-container" 
          className="relative shrink-0 group py-1 transition-all duration-200"
          onMouseEnter={() => {
            setShowLanguageSelector(true);
            setShowNotifications(false);
          }}
          onMouseLeave={() => {
            setShowLanguageSelector(false);
          }}
        >
          <button 
            id="header-language-btn"
            onClick={() => {
              setShowLanguageSelector(!showLanguageSelector);
              setShowNotifications(false);
            }}
            className="p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-850/80 transition-all cursor-pointer flex items-center justify-center active:scale-95"
            title={t.langSelectLabel}
          >
            <span className="flag w-5 h-5 rounded-full inline-flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-800 text-xs leading-none transition-transform hover:scale-105 shadow-sm">
              {renderFlag(language)}
            </span>
          </button>
          
          {showLanguageSelector && (
            <div 
              id="header-language-dropdown" 
              className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden z-50 animate-fade-in text-left transition-all duration-200"
            >
              <div className="p-3 bg-gray-50 dark:bg-gray-950/60 border-b border-gray-200 dark:border-gray-800">
                <span className="text-[10px] font-mono uppercase tracking-widest font-black text-gray-400 dark:text-gray-500">{t.langSelectLabel}</span>
              </div>
              <div className="p-1.5 space-y-0.5 animate-slide-up">
                {languageOptions.map((opt) => {
                  const isSelected = language === opt.code;
                  return (
                    <button
                      key={opt.code}
                      onClick={() => {
                        onLanguageChange(opt.code);
                        setShowLanguageSelector(false);
                      }}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left text-xs font-semibold font-sans transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-50 text-[#1e3a8a] dark:bg-blue-950/30 dark:text-sky-300 font-bold' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 w-full">
                        <span className="flag w-4.5 h-4.5 rounded-full inline-flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-850 leading-none shrink-0">
                          {renderFlag(opt.code)}
                        </span>
                        <span>{opt.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

             {/* Theme Toggle Button */}
        <button 
          id="header-btn-theme-toggle"
          onClick={onToggleTheme}
          className="p-2 text-gray-500 hover:text-[#1e3a8a] dark:text-gray-400 dark:hover:text-sky-400 rounded-full hover:bg-gray-50 dark:hover:bg-gray-850/80 transition-all duration-150 cursor-pointer active:scale-95"
          title={theme === 'light' ? 'Alternar para Tema Escuro' : 'Alternar para Tema Claro'}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 text-gray-500 hover:text-[#1e3a8a] transition-all duration-300 hover:rotate-12 hover:scale-105" />
          ) : (
            <SunDim className="h-5 w-5 text-gray-400 hover:text-amber-400 transition-all duration-300 hover:rotate-45 hover:scale-105" />
          )}
        </button>

        {/* Settings Button */}
        <button 
          id="header-btn-settings"
          onClick={() => {
            setShowSettings(true);
            setShowNotifications(false);
          }}
          className="p-2 text-gray-500 hover:text-[#1e3a8a] dark:text-gray-400 dark:hover:text-sky-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-850/80 transition-all duration-150 active:scale-95 cursor-pointer"
          title="Configurações do Sistema"
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* User profile details & picture */}
        <button
          onClick={onProfileClick}
          className="flex items-center gap-3 pl-3.5 border-l border-gray-200 dark:border-gray-800 text-left cursor-pointer hover:opacity-95 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 group/avatar shrink-0 h-8"
          title="Ver Meu Perfil"
        >
          <div className="relative">
            <img
              src={profilePhoto}
              alt="Avatar do Usuário"
              className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-700 object-cover group-hover/avatar:border-blue-400 dark:group-hover/avatar:border-sky-450 transition-colors shadow-sm"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 h-2 w-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#0e1320]" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-100 group-hover/avatar:text-[#1e3a8a] dark:group-hover/avatar:text-sky-300 transition-colors leading-tight">{profileName}</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold font-sans tracking-wide leading-none mt-0.5">{profileSpecialty}</span>
          </div>
        </button>
      </div>
      {/* Notifications Drawer Anchor (For either top row or desktop utilities) */}
      {showNotifications && (
        <div className="absolute right-2 sm:right-4 top-14 md:top-16 w-[calc(100vw-16px)] sm:w-80 bg-white dark:bg-[#111827] rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 z-50 text-left overflow-hidden animate-fade-in">
          <div className="p-3 bg-[#1e3a8a] dark:bg-blue-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-sky-300 shrink-0" />
              <span className="font-bold text-xs font-sans tracking-wide uppercase truncate">Notificações Veterinárias</span>
            </div>
            {hasUnreadAlerts && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onMarkAllRead();
                }}
                className="text-[10px] font-mono text-sky-200 hover:text-white underline cursor-pointer bg-transparent border-0 shrink-0"
              >
                Marcar lidas
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 dark:text-gray-505 font-sans text-xs">
                Nenhuma notificação recente.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-3 text-xs space-y-1 transition-colors relative group/item ${
                    notif.unread ? 'bg-blue-50/40 dark:bg-blue-950/10' : 'bg-white dark:bg-[#111827]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[9px] font-mono font-bold uppercase rounded px-1.5 py-0.5 shrink-0 ${
                      notif.type === 'critical' 
                        ? 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400' 
                        : notif.type === 'success' 
                        ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-sky-400' 
                        : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400'
                    }`}>
                      {notif.type === 'critical' ? 'Alerta Crítico' : notif.type === 'success' ? 'Verificação' : 'Aviso'}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] text-gray-400 dark:text-gray-400 font-mono">
                        {formatNotificationTime(notif)}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onDismissNotification(notif.id);
                        }}
                        className="opacity-70 hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-650 dark:hover:text-gray-350 rounded shrink-0 cursor-pointer active:scale-90 transition-all"
                        title="Remover"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-normal pr-4">{notif.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 p-2 text-center bg-gray-50 dark:bg-gray-900/40">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(false);
              }}
              className="w-full text-center text-[11px] font-sans font-bold text-[#1e3a8a] dark:text-sky-303 hover:underline bg-transparent border-0 cursor-pointer"
            >
              Fechar Painel
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal (Overlay Dialogue box) */}
      {showSettings && createPortal(
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-transparent dark:border-gray-800 shadow-2xl w-full max-w-md flex flex-col text-left overflow-hidden max-h-[90vh] md:max-h-[85vh]">
            <div className="p-4 bg-[#1e3a8a] dark:bg-blue-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-sky-400 animate-spin-slow" />
                <h3 className="text-sm font-bold uppercase tracking-wider font-sans">{t.settingsTitle}</h3>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-blue-850 dark:hover:bg-blue-900 cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs dark:text-gray-300 overflow-y-auto flex-1">
              {/* Setting 1: Calibration */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="space-y-0.5 pr-2">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 font-sans">{t.cameraCalib}</h4>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">{t.cameraCalibSub}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={cameraCalibration} 
                    onChange={(e) => setCameraCalibration(e.target.checked)} 
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-650 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Setting 2: AI Confidence thresholds */}
              <div className="space-y-2 py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 font-sans">{t.minConfidence}</h4>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{t.minConfidenceSub}</p>
                  </div>
                  <span className="font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-sky-400 text-[10px] uppercase tracking-wider px-2 py-0.5 font-bold rounded border border-blue-100 dark:border-blue-900/30 font-sans">
                    {aiConfidenceConfidence}{t.minPct}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="80" 
                  max="99" 
                  value={aiConfidenceConfidence}
                  onChange={(e) => setAiConfidenceConfidence(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700/60 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                />
              </div>

              {/* Setting 3: SMS Alerts */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="space-y-0.5 pr-2">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 font-sans">{t.criticalEcc}</h4>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">{t.criticalEccSub}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={smsAlerts} 
                    onChange={(e) => setSmsAlerts(e.target.checked)} 
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-650 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Setting 4: Measurement Weights units */}
              <div className="space-y-2 py-1">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 font-sans">{t.standardWeight}</h4>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                    <input 
                      type="radio" 
                      name="weightUnit" 
                      value="kg"
                      checked={weightUnit === 'kg'}
                      onChange={() => setWeightUnit('kg')}
                      className="accent-[#1e3a8a] dark:accent-blue-500"
                    />
                    <span className="font-medium">{t.weightKg}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                    <input 
                      type="radio" 
                      name="weightUnit" 
                      value="arroba"
                      checked={weightUnit === 'arroba'}
                      onChange={() => setWeightUnit('arroba')}
                      className="accent-[#1e3a8a] dark:accent-blue-500"
                    />
                    <span className="font-medium">{t.weightArroba}</span>
                  </label>
                </div>
              </div>

              {/* Setting 5: Real SMTP Configuration */}
              <div className="space-y-3 py-3 border-t border-gray-100 dark:border-gray-800 mt-3 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                    <RefreshCw className="h-4 w-4 animate-spin-slow" />
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 font-sans uppercase tracking-wide text-[10px]">
                      Integração de Notificações SMTP (Real)
                    </h4>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      Substitua o simulador integrado por envio real diretamente para seu consultório.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 font-mono">
                      Servidor SMTP Host *
                    </label>
                    <input 
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="ex: smtp.gmail.com"
                      className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-950/60 border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none text-gray-950 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 font-mono">
                      Porta do Servidor *
                    </label>
                    <input 
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(Number(e.target.value))}
                      placeholder="ex: 587"
                      className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-950/60 border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none text-gray-950 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 font-mono">
                      Autenticação Usuário *
                    </label>
                    <input 
                      type="text"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="ex: seu-email@gmail.com"
                      className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-950/60 border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none text-gray-950 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 font-mono">
                      Senha / Token de App *
                    </label>
                    <input 
                      type="password"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder="••••••••••••••"
                      className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-950/60 border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none text-gray-950 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 font-mono">
                    E-mail de Envio / Remetente (De:)
                  </label>
                  <input 
                    type="text"
                    value={smtpFrom}
                    onChange={(e) => setSmtpFrom(e.target.value)}
                    placeholder="BovinoVision Alerta <alertas@fazenda.com.br>"
                    className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-950/60 border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none text-gray-950 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                    Utilizar Conexão Segura SSL/TLS
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={smtpSecure} 
                      onChange={(e) => setSmtpSecure(e.target.checked)} 
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-650 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTestSmtpConnection}
                    disabled={smtpTesting}
                    className="w-full py-2 bg-[#1e3a8a] dark:bg-blue-800 hover:bg-blue-900 dark:hover:bg-blue-900 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {smtpTesting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Autenticando Conexão...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        <span>Testar e Validar Conexão Real</span>
                      </>
                    )}
                  </button>
                </div>

                {smtpTestResult && (
                  <div className={`p-3 rounded-lg border-2 ${
                    smtpTestResult.success 
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-850 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-300' 
                      : 'bg-rose-50/70 border-rose-200 text-rose-850 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-300'
                  } text-xs font-sans text-left space-y-1.5 animate-fade-in`}>
                    <p className="font-bold flex items-center gap-2">
                      {smtpTestResult.success ? 'RECONHECIDO COM SUCESSO' : 'REJEITADO'}
                    </p>
                    <p className="text-[11px] leading-relaxed">{smtpTestResult.message}</p>
                    {smtpTestResult.url && (
                      <div className="pt-1 select-all font-mono text-[10px]">
                        <a 
                          href={smtpTestResult.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline font-bold dark:text-sky-400"
                        >
                          Ver mockup real disparado (Ethereal Sandbox)
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-[#0c101b] border-t border-gray-100 dark:border-gray-800/80 flex justify-end gap-2.5 shrink-0 text-[#191c1d] dark:text-[#f1f5f9]">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-sans font-bold cursor-pointer transition-colors"
              >
                {t.cancel}
              </button>
              <button 
                id="header-btn-save-settings"
                onClick={handleSaveSettings}
                className="px-5 py-2 bg-[#1e3a8a] dark:bg-blue-800 hover:bg-blue-900 dark:hover:bg-blue-900 text-white rounded-xl font-sans font-bold flex items-center justify-center gap-1.5 min-w-[120px] cursor-pointer transition-all active:scale-98"
              >
                {saveSuccess ? (
                  <>
                    <Check className="h-4 w-4 shrink-0 text-sky-305" />
                    <span>{t.saved}</span>
                  </>
                ) : (
                  <span>{t.saveSettings}</span>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
