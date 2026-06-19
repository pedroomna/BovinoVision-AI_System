/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  BarChart3, 
  HelpCircle, 
  LogOut, 
  PlusCircle, 
  ChevronRight,
  ShieldAlert,
  X
} from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';
import { translations, Language } from '../translations';

interface SidebarProps {
  activeTab?: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  currentSection: string;
  setCurrentSection: (section: string) => void;
  onNewAssessment: () => void;
  geminiActive: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
  language?: Language;
  userProfile?: UserProfile;
}

export default function Sidebar({ 
  activeTab,
  setActiveTab,
  currentSection, 
  setCurrentSection, 
  onNewAssessment, 
  geminiActive,
  isOpen,
  onClose,
  onLogout,
  language = 'pt',
  userProfile
}: SidebarProps) {
  
  const t = translations[language];
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);

  // Synchronize local fallback cache
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bovinovision_profile');
      if (stored) {
        setLocalProfile(JSON.parse(stored) as UserProfile);
      }
    } catch (e) {
      console.error("Local storage profile read error", e);
    }
  }, [userProfile]);

  // Priority: Prop value -> Cached local state -> Default professional metadata
  const activeProfile = userProfile || localProfile || {
    name: "Dr. Pedro Almeida",
    crmv: "CRMV-PT #8530",
    specialty: "Clínico de Grandes Animais",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=clamp&w=150&h=150&q=80",
    email: "pedro@bovinovision.ai",
    division: "Pecuária de Precisão",
    location: "Fazenda Laranjal",
    license: "Escore de Carcaça Regularizado"
  };

  const mainNavItems = [
    { id: 'overview', label: t.sideOverview, icon: LayoutDashboard },
    { id: 'health', label: t.sideHealth, icon: Activity },
    { id: 'analytics', label: t.sideAnalytics, icon: BarChart3 },
  ];

  const supportNavItems = [
    { id: 'support', label: t.sideTechnical, icon: HelpCircle },
  ];

  const handleSelect = (id: string) => {
    setCurrentSection(id);
    onClose?.();
  };

  const handleNewAssessmentClick = () => {
    onNewAssessment();
    onClose?.();
  };

  return (
    <>
      {/* Background Overlay for mobile drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden transition-all duration-300"
          onClick={onClose}
          id="sidebar-overlay"
        />
      )}

      <aside className={`fixed md:sticky top-0 md:top-16 left-0 h-full md:h-[calc(100vh-64px)] w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1320] flex flex-col justify-between shrink-0 z-50 transition-all duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      }`} id="sidebar-container">
        
        {/* Top Scrollable Navigation Container */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin">
          
          {/* Mobile Drawer Header with Close Button */}
          <div className="flex md:hidden items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800" id="sidebar-mobile-header">
            <span className="font-sans font-bold text-[#1e3a8a] dark:text-sky-300 flex items-center gap-2 uppercase tracking-wider text-xs">
              <Activity className="h-4.5 w-4.5 text-blue-600 dark:text-sky-400 shrink-0" />
              {t.mobileMenuLabel}
            </span>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer active:scale-95 transition-all"
              aria-label="Minimizar menu"
              id="sidebar-close-btn"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Mobile-only Main App Tabs */}
          {activeTab && setActiveTab && (
            <div className="md:hidden space-y-2.5" id="sidebar-mobile-tabs">
              <span className="text-[10px] uppercase tracking-widest font-mono text-gray-400 dark:text-gray-500 font-bold block">
                {t.modulesLabel}
              </span>
              <div className="grid grid-cols-2 gap-2">
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
                      onClick={() => {
                        setActiveTab(tab);
                        onClose?.();
                      }}
                      className={`py-2.5 px-2 text-center font-bold font-sans rounded-xl text-xs leading-tight transition-all duration-150 border cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] dark:bg-blue-700 dark:text-white dark:border-blue-700 shadow-sm'
                          : 'bg-white dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-850'
                      }`}
                      id={`sidebar-mobile-tab-${tab}`}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>
              <div className="border-b border-gray-100 dark:border-gray-800/80 my-4" />
            </div>
          )}

          {/* Nova Avaliação Button Section */}
          <div className="pt-1" id="sidebar-action-container">
            <button
              id="sidebar-btn-new-assessment"
              onClick={handleNewAssessmentClick}
              className="w-full h-11 bg-[#1e3a8a] hover:bg-[#1a3275] dark:bg-blue-700 dark:hover:bg-blue-600 text-white transition-all flex items-center justify-center gap-2 rounded-xl font-semibold text-xs tracking-wider uppercase font-sans shadow-md hover:shadow-lg hover:shadow-blue-500/10 active:scale-98 cursor-pointer relative overflow-hidden group border border-[#1e3a8a] dark:border-blue-600"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <PlusCircle className="h-4 w-4 text-sky-200 group-hover:scale-110 transition-transform duration-200 shrink-0" />
              <span>{t.newAssessment}</span>
            </button>
          </div>

          {/* Navigation Group 1: Telemetry & Monitoring */}
          <div className="space-y-2" id="sidebar-group-monitor">
            <span className="text-[10px] uppercase tracking-widest font-mono text-gray-400 dark:text-gray-500 font-bold block px-2">
              {t.mainNavigation}
            </span>
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const IconComp = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-item-${item.id}`}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] transition-all duration-200 group relative cursor-pointer active:scale-[0.99] ${
                      isActive
                        ? 'bg-[#1e3a8a]/8 dark:bg-[#1e3a8a]/20 text-[#1e3a8a] dark:text-sky-300 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850/60 hover:text-[#1e3a8a] dark:hover:text-sky-300'
                    }`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#1e3a8a] dark:bg-sky-400 rounded-r-md" />
                    )}

                    <div className="flex items-center gap-3">
                      <IconComp 
                        className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                          isActive 
                            ? 'text-[#1e3a8a] dark:text-sky-300' 
                            : 'text-gray-400 group-hover:text-[#1e3a8a] dark:group-hover:text-sky-300'
                        }`} 
                      />
                      <span>{item.label}</span>
                    </div>

                    <ChevronRight className={`h-3.5 w-3.5 text-gray-300 dark:text-gray-600 transition-transform ${
                      isActive ? 'text-[#1e3a8a]/70 dark:text-sky-400/70 translate-x-0.5' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Group 2: Support */}
          <div className="space-y-2" id="sidebar-group-support">
            <span className="text-[10px] uppercase tracking-widest font-mono text-gray-400 dark:text-gray-500 font-bold block px-2">
              Atendimento e Ajuda
            </span>
            <div className="space-y-1">
              {supportNavItems.map((item) => {
                const IconComp = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-item-${item.id}`}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] transition-all duration-200 group relative cursor-pointer active:scale-[0.99] ${
                      isActive
                        ? 'bg-[#1e3a8a]/8 dark:bg-[#1e3a8a]/20 text-[#1e3a8a] dark:text-sky-300 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850/60 hover:text-[#1e3a8a] dark:hover:text-sky-300'
                    }`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#1e3a8a] dark:bg-sky-400 rounded-r-md" />
                    )}

                    <div className="flex items-center gap-3">
                      <IconComp 
                        className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                          isActive 
                            ? 'text-[#1e3a8a] dark:text-sky-300' 
                            : 'text-gray-400 group-hover:text-[#1e3a8a] dark:group-hover:text-sky-300'
                        }`} 
                      />
                      <span>{item.label}</span>
                    </div>

                    <ChevronRight className={`h-3.5 w-3.5 text-gray-300 dark:text-gray-600 transition-transform ${
                      isActive ? 'text-[#1e3a8a]/70 dark:text-sky-400/70 translate-x-0.5' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Section: Premium Account Profile Card */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/25 flex flex-col gap-2" id="sidebar-footer">
          
          {/* User Information Interactive Card */}
          <div 
            onClick={() => handleSelect('account')}
            className={`w-full flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer group ${
              currentSection === 'account' 
                ? 'bg-[#1e3a8a]/10 dark:bg-blue-900/30 ring-1 ring-[#1e3a8a]/20 dark:ring-blue-500/20' 
                : 'hover:bg-gray-150/70 dark:hover:bg-gray-850'
            }`}
            id="sidebar-profile-card"
            title={t.sideMyAccount}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img 
                  src={activeProfile.photoUrl} 
                  alt={activeProfile.name} 
                  className="h-9 w-9 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-inner group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#0e1320]" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-gray-950 dark:text-white truncate max-w-[120px] tracking-tight">
                  {activeProfile.name}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono truncate max-w-[120px]">
                  {activeProfile.crmv || "Sem Registro"}
                </p>
              </div>
            </div>

            {/* Account Settings Shortcut Icon */}
            <ChevronRight className={`h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:translate-x-0.5 transition-transform shrink-0 ${
              currentSection === 'account' ? 'text-[#1e3a8a] dark:text-sky-300' : ''
            }`} />
          </div>

          {/* Quick Signout Button */}
          <button
            id="sidebar-item-logout"
            onClick={() => {
              onLogout?.();
              onClose?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/25 active:scale-98 transition-all duration-150 cursor-pointer border border-transparent hover:border-red-100 dark:hover:border-red-950/40"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            <span>{t.sideLogout}</span>
          </button>

        </div>
      </aside>
    </>
  );
}
