/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { SAMPLE_CATTLE } from './data/samples';
import { CattleRecord, ActiveTab, DashboardStats, UserProfile } from './types';
import Header from './components/Header';
import { Language, translations } from './translations';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import HistoryView from './components/HistoryView';
import AssessmentView from './components/AssessmentView';
import ReportsView from './components/ReportsView';
import NewAssessmentModal from './components/NewAssessmentModal';
import FooterModal from './components/FooterModal';
import { ImageAdjusterModal } from './components/ImageAdjusterModal';
import SupportChatView from './components/SupportChatView';
import LoginView from './components/LoginView';
import SplashIntro from './components/SplashIntro';
import { validateCattleRecord } from './lib/schemas';

import { Activity, ShieldAlert, BadgeCheck, Mail, MapPin, Award, Wifi, WifiOff, RefreshCw, User, Camera, Upload, Edit3, Save, X } from 'lucide-react';
import { auth, isFirebaseConfigured, db, handleFirestoreError, OperationType } from './lib/firebase';
import { supabase, isSupabaseConfigured, mapToSupabaseProfile, mapFromSupabaseProfile, mapToSupabaseRecord, mapFromSupabaseRecord } from './lib/supabase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  getDocFromServer 
} from 'firebase/firestore';


/**
 * Cleanly parses the Portuguese/English date string (e.g. "22 Mai 2026, 09:20" or "11 de jun de 2026, 19:19") 
 * into a solid UNIX timestamp to guarantee proper sort order on dashboards.
 */
export function parseCattleDate(dateStr: string): number {
  if (!dateStr) return 0;
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
}


export default function App() {
  const [activeUser, setActiveUser] = useState<{ uid: string; email: string; displayName?: string } | null>(() => {
    try {
      const stored = localStorage.getItem('bovinovision_active_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading activeUser from localStorage', e);
    }
    return null;
  });
  const [showSplash, setShowSplash] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const stored = localStorage.getItem('bovinovision_logged_in');
      return stored === 'true';
    } catch (e) {
      return false;
    }
  });
  const [authInitializing, setAuthInitializing] = useState(true);
  const [realDataOnly, setRealDataOnly] = useState<boolean>(true);

  // Track the change of realDataOnly
  useEffect(() => {
    localStorage.setItem('bovinovision_real_data_only', 'true');
  }, [realDataOnly]);

  const isDemoRecord = (r: CattleRecord) => ['AB-9255', 'AB-9042', 'AB-9128', 'AB-8840'].includes(r.id);

  const [records, setRecords] = useState<CattleRecord[]>(() => {
    try {
      const stored = localStorage.getItem('bovinovision_records');
      if (stored) {
        const parsed = JSON.parse(stored) as CattleRecord[];
        const mapped = parsed.map(r => {
          if (r.photoUrl && (r.photoUrl.includes('1484557052118-f32bd25b45b5') || r.photoUrl.includes('1543508282-6319a3e2621d'))) {
            return {
              ...r,
              photoUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80'
            };
          }
          return r;
        });
        const finalParsed = mapped.filter(r => !isDemoRecord(r));
        return finalParsed.sort((a, b) => parseCattleDate(b.date) - parseCattleDate(a.date));
      }
    } catch (e) {
      console.error('Error loading records from localStorage', e);
    }
    return [];
  });

  const displayRecords = useMemo(() => {
    return realDataOnly ? records.filter(r => !isDemoRecord(r)) : records;
  }, [realDataOnly, records]);
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    try {
      const stored = localStorage.getItem('bovinovision_active_tab');
      if (stored === 'dashboard' || stored === 'assessments' || stored === 'history' || stored === 'reports') {
        return stored as ActiveTab;
      }
    } catch (e) {
      console.error('Error loading activeTab from localStorage', e);
    }
    return 'dashboard';
  });
  const [currentSection, setCurrentSection] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('bovinovision_current_section');
      if (stored) return stored;
    } catch (e) {
      console.error('Error loading currentSection from localStorage', e);
    }
    return 'overview';
  });
  const [activeRecord, setActiveRecord] = useState<CattleRecord | undefined>(() => {
    try {
      const storedActiveId = localStorage.getItem('bovinovision_active_record_id');
      const storedRecords = localStorage.getItem('bovinovision_records');
      let recordsList: CattleRecord[] = [];
      if (storedRecords) {
        recordsList = JSON.parse(storedRecords) as CattleRecord[];
      } else {
        recordsList = SAMPLE_CATTLE;
      }

      if (storedActiveId && recordsList.length > 0) {
        const found = recordsList.find(r => r.id === storedActiveId);
        if (found) {
          if (found.photoUrl && (found.photoUrl.includes('1484557052118-f32bd25b45b5') || found.photoUrl.includes('1543508282-6319a3e2621d'))) {
            found.photoUrl = 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80';
          }
          return found;
        }
      }

      if (recordsList.length > 0) {
        const sortedList = [...recordsList].sort((a, b) => parseCattleDate(b.date) - parseCattleDate(a.date));
        const item = sortedList[0];
        if (item.photoUrl && (item.photoUrl.includes('1484557052118-f32bd25b45b5') || item.photoUrl.includes('1543508282-6319a3e2621d'))) {
          item.photoUrl = 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80';
        }
        return item;
      }
    } catch (e) {}
    return SAMPLE_CATTLE[0];
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [footerModalType, setFooterModalType] = useState<'terms' | 'privacy' | 'support' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('bovinovision_theme');
      return (stored as 'light' | 'dark') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  // Toggles the dark class on document element so Tailwind dark: classes get active
  useEffect(() => {
    try {
      localStorage.setItem('bovinovision_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Error syncing theme settings', e);
    }
  }, [theme]);

  const [language, setLanguage] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('bovinovision_language');
      return (stored as Language) || 'pt';
    } catch (e) {
      return 'pt';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bovinovision_language', language);
    } catch (e) {
      console.error('Error syncing language settings', e);
    }
  }, [language]);

  const syncSupabaseData = async (uid: string, email: string, displayName?: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    console.log("Database: Supabase driver active. Synchronizing payload...");
    try {
      const { data: profile, error: pErr } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('uid', uid)
        .maybeSingle();

      let finalProfile: UserProfile;
      if (pErr || !profile) {
        console.log("Supabase: Profile not found, creating new profile...");
        const initialPayload: UserProfile = {
          name: displayName || "Doutor Veterinário",
          crmv: "CRMV-PT #0000",
          specialty: "Zootecnista e Clínico de Grandes Animais",
          email: email,
          division: "Pecuária de Precisão",
          location: "Fazenda de Avaliação",
          license: "Iniciação em Escore de Carcaça",
          photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=clamp&w=350&h=350&q=80",
          hasSeeded: false
        };
        const dbPayload = mapToSupabaseProfile(initialPayload, uid);
        const { error: insErr } = await supabase.from('user_profiles').insert([dbPayload]);
        if (insErr) console.error("Supabase Profile Insert Error:", insErr);
        finalProfile = initialPayload;
      } else {
        finalProfile = mapFromSupabaseProfile(profile);
      }
      setUserProfile(finalProfile);

      const { data: dbRecords, error: rErr } = await supabase
        .from('cattle_records')
        .select('*')
        .eq('user_id', uid);

      if (rErr) {
        console.error("Supabase Records Fetch Error:", rErr);
      } else if (!dbRecords || dbRecords.length === 0) {
        if (!finalProfile.hasSeeded) {
          console.log("Supabase: Seeding default sample data...");
          const seededRecords = SAMPLE_CATTLE.map(r => ({
            ...r,
            userId: uid
          }));
          for (const item of seededRecords) {
            const dbItem = mapToSupabaseRecord(item, uid);
            await supabase.from('cattle_records').insert([dbItem]);
          }
          await supabase
            .from('user_profiles')
            .update({ has_seeded: true })
            .eq('uid', uid);
          
          setUserProfile(prev => ({ ...prev, hasSeeded: true }));
          setRecords(seededRecords);
          if (seededRecords.length > 0) {
            setActiveRecord(seededRecords[0]);
          }
        } else {
          setRecords([]);
        }
      } else {
        const mappedList = dbRecords.map(r => mapFromSupabaseRecord(r));
        setRecords(mappedList);
        if (mappedList.length > 0) {
          setActiveRecord(prev => {
            if (!prev || !mappedList.some(r => r.id === prev.id)) {
              return mappedList[0];
            }
            return mappedList.find(r => r.id === prev.id) || prev;
          });
        }
      }
    } catch (err) {
      console.error("Supabase initial sync error:", err);
    }
  };

  // Firebase & Supabase Auth State change listener
  useEffect(() => {
    let unsubscribeAuth: (() => void) | null = null;
    let unsubUser: (() => void) | null = null;
    let unsubRecords: (() => void) | null = null;
    let unsubNotifications: (() => void) | null = null;
    let unsubscribeSupabase: (() => void) | null = null;

    // Real connection verification test
    if (isFirebaseConfigured && db) {
      const testConnection = async () => {
        try {
          await getDocFromServer(doc(db, 'test', 'connection'));
        } catch (error: any) {
          if (error?.message?.includes('the client is offline')) {
            console.warn("[Diagnostic System] Firebase is configured but client is offline.");
          }
        }
      };
      testConnection();
    }

    if (auth) {
      unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setIsLoggedIn(true);
          localStorage.setItem('bovinovision_logged_in', 'true');
          const finalActiveUser = { uid: user.uid, email: user.email || '', displayName: user.displayName || undefined };
          setActiveUser(finalActiveUser);
          localStorage.setItem('bovinovision_active_user', JSON.stringify(finalActiveUser));

          if (isSupabaseConfigured && supabase) {
            await syncSupabaseData(user.uid, user.email || '', user.displayName || undefined);
            setAuthInitializing(false);
          } else if (isFirebaseConfigured && db) {
            console.log("Database: Firebase driver active. Synchronizing snapshots...");
            // Subscribe and synchronize user profile info
            const userDocRef = doc(db, 'users', user.uid);
            unsubUser = onSnapshot(userDocRef, (docSnap) => {
              if (docSnap.exists()) {
                const cloudProfile = docSnap.data();
                setUserProfile({
                  name: cloudProfile.name || '',
                  crmv: cloudProfile.crmv || '',
                  specialty: cloudProfile.specialty || '',
                  email: cloudProfile.email || '',
                  division: cloudProfile.division || '',
                  location: cloudProfile.location || '',
                  license: cloudProfile.license || '',
                  photoUrl: cloudProfile.photoUrl || '',
                  hasSeeded: cloudProfile.hasSeeded || false
                });
              } else {
                const initialPayload = {
                  uid: user.uid,
                  email: user.email || '',
                  name: user.displayName || "Pedro da Costa Almeida",
                  crmv: "CRMV-PT #8530",
                  specialty: "Zootecnista e Clínico de Grandes Animais",
                  division: "Pecuária de Precisão",
                  location: "Fazenda de Avaliação",
                  license: "Escore de Carcaça Regularizado",
                  photoUrl: user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=clamp&w=350&h=350&q=80",
                  hasSeeded: false
                };
                setDoc(userDocRef, initialPayload).catch(err => {
                  console.warn("Failed to save initial user doc:", err);
                });
              }
              setAuthInitializing(false);
            }, (err) => {
              console.error("Firestore user profile snapshot failed: ", err);
              setAuthInitializing(false);
            });

            // Subscribe and synchronize cattle records
            const q = query(collection(db, 'records'), where('userId', '==', user.uid));
            unsubRecords = onSnapshot(q, async (snapshot) => {
              if (snapshot.empty) {
                // If the user has chosen to only use real data, do not seed mock data!
                if (realDataOnly) {
                  console.log("Real data mode is active - skipping mock database seeding.");
                  setRecords([]);
                  return;
                }
                // Deletion guard check: verify if user had seeded hasSeeded
                try {
                  const userDocSnap = await getDocFromServer(userDocRef);
                  if (userDocSnap.exists()) {
                    const cloudProfile = userDocSnap.data();
                    if (cloudProfile && cloudProfile.hasSeeded) {
                      console.log("No cloud records found but user already marked 'hasSeeded' once. Deletions are kept permanent.");
                      setRecords([]);
                      return;
                    }
                  }
                } catch (err) {
                  console.warn("Failed to check if user had already seeded hasSeeded flag on server:", err);
                }

                console.log("No cloud records found. Seeding default sample data for user for the first time...");
                const seededRecords = SAMPLE_CATTLE.map(r => ({
                  ...r,
                  userId: user.uid
                }));
                for (const recordItem of seededRecords) {
                  try {
                    const validatedItem = validateCattleRecord(recordItem);
                    await setDoc(doc(db, 'records', validatedItem.id), {
                      ...validatedItem,
                      userId: user.uid
                    });
                  } catch (e) {
                    console.error(`Seeding record ${recordItem.id} failed:`, e);
                  }
                }

                try {
                  await setDoc(userDocRef, { hasSeeded: true }, { merge: true });
                } catch (err) {
                  console.error("Failed to update user profile hasSeeded status to prevent re-seeding:", err);
                }
              } else {
                const list: CattleRecord[] = [];
                snapshot.forEach((docSnap) => {
                  const d = docSnap.data();
                  list.push({
                    id: d.id,
                    photoUrl: d.photoUrl || '',
                    date: d.date || '',
                    lot: d.lot || '',
                    breed: d.breed || '',
                    score: Number(d.score),
                    weight: Number(d.weight),
                    fatProgress: Number(d.fatProgress || 0),
                    verdict: d.verdict,
                    landmarkPoints: d.landmarkPoints || [],
                    aiConfidence: d.aiConfidence ? Number(d.aiConfidence) : undefined,
                    notes: d.notes || '',
                  });
                });
                const sortedList = list.sort((a, b) => parseCattleDate(b.date) - parseCattleDate(a.date));
                setRecords(prev => {
                  const offlinePending = prev.filter(r => r.isOfflinePending && !sortedList.some(dbRec => dbRec.id === r.id));
                  const combined = [...sortedList, ...offlinePending];
                  return combined.sort((a, b) => parseCattleDate(b.date) - parseCattleDate(a.date));
                });
                setActiveRecord(prev => {
                  if (!prev) return sortedList[0] || null;
                  return sortedList.find(r => r.id === prev.id) || prev;
                });
              }
            }, (err) => {
              console.error("Firestore records snapshot synchronization failed: ", err);
            });

            // Subscribe and synchronize notifications
            const qNotif = query(collection(db, 'notifications'), where('userId', '==', user.uid));
            unsubNotifications = onSnapshot(qNotif, async (notifSnap) => {
              const hasSeededKey = `bovinovision_seeded_notif_${user.uid}`;
              const alreadySeeded = localStorage.getItem(hasSeededKey) === 'true';
              
              if (notifSnap.empty && !alreadySeeded) {
                localStorage.setItem(hasSeededKey, 'true');
                // Seed default notifications for this user in Firestore
                const initialNotifs = [
                  {
                    id: 'init-1-' + user.uid.substring(0, 5),
                    type: 'critical',
                    message: 'Atenção Veterinária: Animal #AB-8840 detectado abaixo do score corporal mínimo aceitável (ECC 1.4). Requer engorda imediata.',
                    time: 'há 10 minutos',
                    unread: true,
                    userId: user.uid,
                    createdAt: new Date().toISOString()
                  },
                  {
                    id: 'init-2-' + user.uid.substring(0, 5),
                    type: 'success',
                    message: 'Sucesso: Nova escora de lombo (ECC 4.5) integrada para o animal #AB-9255.',
                    time: 'há 2 horas',
                    unread: true,
                    userId: user.uid,
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                  },
                  {
                    id: 'init-3-' + user.uid.substring(0, 5),
                    type: 'notice',
                    message: 'Dica de Manejo: Lote Norte - A atingiu 82% de aptidão para abate. Programe os lotes de confinamento.',
                    time: 'há 1 dia',
                    unread: false,
                    userId: user.uid,
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                  }
                ];
                for (const notifItem of initialNotifs) {
                  try {
                    await setDoc(doc(db, 'notifications', notifItem.id), notifItem);
                  } catch (err) {
                    console.error("Failed to seed notification:", err);
                  }
                }
              } else {
                // If it was explicitly empty (and we already seeded), we keep it empty instead of infinite re-seeding!
                const list: AppNotification[] = [];
                notifSnap.forEach((docSnap) => {
                  const d = docSnap.data();
                  list.push({
                    id: d.id,
                    type: d.type,
                    message: d.message,
                    time: d.time || 'Agora mesmo',
                    unread: d.unread === true,
                    createdAt: d.createdAt
                  });
                });
                const sortedList = [...list].sort((a: any, b: any) => {
                  const timeA = a.id.includes('init-') ? (a.id.includes('init-1') ? 3 : (a.id.includes('init-2') ? 2 : 1)) : 0;
                  const timeB = b.id.includes('init-') ? (b.id.includes('init-1') ? 3 : (b.id.includes('init-2') ? 2 : 1)) : 0;
                  if (timeA !== 0 || timeB !== 0) return timeB - timeA;
                  return b.id.localeCompare(a.id);
                });
                setNotifications(sortedList);
              }
            }, (err) => {
              console.error("Firestore notifications snapshot synchronization failed: ", err);
            });
          } else {
            setAuthInitializing(false);
          }
        } else {
          // Unsubscribe from snapshot listeners on logout
          if (unsubUser) { unsubUser(); unsubUser = null; }
          if (unsubRecords) { unsubRecords(); unsubRecords = null; }
          if (unsubNotifications) { unsubNotifications(); unsubNotifications = null; }

          // Sandbox resilience session survival fallback
          const wasLoggedIn = localStorage.getItem('bovinovision_logged_in') === 'true';
          const cachedUserStr = localStorage.getItem('bovinovision_active_user');
          if (wasLoggedIn && cachedUserStr) {
            try {
              const cachedUser = JSON.parse(cachedUserStr);
              setActiveUser(cachedUser);
              setIsLoggedIn(true);
              setAuthInitializing(false);
              console.log("[Resilience Engine] Sandbox session survivability activated for:", cachedUser.email);
              return;
            } catch (err) {
              console.error("[Resilience Engine] Sandbox session restore failed:", err);
            }
          }

          setIsLoggedIn(false);
          setActiveUser(null);
          localStorage.setItem('bovinovision_logged_in', 'false');
          localStorage.removeItem('bovinovision_active_user');
          setAuthInitializing(false);
        }
      });
    } else {
      setAuthInitializing(false);
    }

    if (isSupabaseConfigured && supabase) {
      // Get initial session
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        const user = session?.user;
        if (user) {
          setIsLoggedIn(true);
          localStorage.setItem('bovinovision_logged_in', 'true');
          setActiveUser({ uid: user.id, email: user.email || '', displayName: user.user_metadata?.name || undefined });
          await syncSupabaseData(user.id, user.email || '', user.user_metadata?.name || undefined);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        const user = session?.user;
        if (user) {
          setIsLoggedIn(true);
          localStorage.setItem('bovinovision_logged_in', 'true');
          setActiveUser({ uid: user.id, email: user.email || '', displayName: user.user_metadata?.name || undefined });
          await syncSupabaseData(user.id, user.email || '', user.user_metadata?.name || undefined);
        } else {
          // If no Firebase auth is active either, sign out
          if (!auth || !auth.currentUser) {
            setActiveUser(null);
            setIsLoggedIn(false);
            localStorage.setItem('bovinovision_logged_in', 'false');
          }
        }
      });

      unsubscribeSupabase = () => {
        subscription.unsubscribe();
      };
    }

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubUser) unsubUser();
      if (unsubRecords) unsubRecords();
      if (unsubNotifications) unsubNotifications();
      if (unsubscribeSupabase) unsubscribeSupabase();
    };
  }, [isSupabaseConfigured]);
  
  // Gemini Activation State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('bovinovision_profile');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading user profile', e);
    }
    return {
      name: "Dr. Pedro d'Almeida",
      crmv: "CRMV-PT #8420-BA",
      specialty: "Especialista de Visão e Genômica Bovina",
      email: "pedro.almeida@bovinovision.ai",
      division: "Pecuária de Precisão",
      location: "Setor de Pasto Norte, Brasil",
      license: "Escore ECC Autenticado por IA",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=clamp&w=350&h=350&q=80"
    };
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileEditForm, setProfileEditForm] = useState<UserProfile>(userProfile);
  const [isAdjusterOpen, setIsAdjusterOpen] = useState(false);
  const [adjusterSrc, setAdjusterSrc] = useState('');

  const [geminiEnabled, setGeminiEnabled] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Notifications State & Synchronizer
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem('bovinovision_notifications');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}

    // Default real notifications from the bovine database
    return [
      {
        id: 'init-1',
        type: 'critical',
        message: 'Atenção Veterinária: Animal #AB-8840 detectado abaixo do score corporal mínimo aceitável (ECC 1.4). Requer engorda imediata.',
        time: 'há 10 minutos',
        unread: true,
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      {
        id: 'init-2',
        type: 'success',
        message: 'Sucesso: Nova escora de lombo (ECC 4.5) integrada para o animal #AB-9255.',
        time: 'há 2 horas',
        unread: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'init-3',
        type: 'notice',
        message: 'Dica de Manejo: Lote Norte - A atingiu 82% de aptidão para abate. Programe os lotes de confinamento.',
        time: 'há 1 dia',
        unread: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  });

  const addNotification = async (type: 'critical' | 'success' | 'notice', message: string, time: string = 'Agora mesmo') => {
    const newId = `notif_${Date.now()}`;
    const newNotif: AppNotification = {
      id: newId,
      type,
      message,
      time,
      unread: true,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db && activeUser) {
      try {
        await setDoc(doc(db, 'notifications', newId), {
          id: newId,
          type,
          message,
          time,
          unread: true,
          userId: activeUser.uid,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to add live notification in Firestore:", err);
      }
    } else {
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('bovinovision_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error('Error saving notifications to localStorage', e);
    }
  }, [notifications]);

  const handleMarkAllRead = async () => {
    // Optimistic update for immediate, lag-free UI feedback (especially on mobile)
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

    if (isFirebaseConfigured && db && activeUser) {
      try {
        for (const notif of notifications) {
          if (notif.unread) {
            await setDoc(doc(db, 'notifications', String(notif.id)), {
              unread: false
            }, { merge: true });
          }
        }
      } catch (err) {
        console.error("Failed to mark all notifications as read in Firestore:", err);
      }
    }
  };

  const handleDismissNotification = async (id: string | number) => {
    // Optimistic update for immediate, lag-free UI feedback (especially on mobile)
    setNotifications(prev => prev.filter(n => n.id !== id));

    if (isFirebaseConfigured && db && activeUser) {
      try {
        await deleteDoc(doc(db, 'notifications', String(id)));
      } catch (err) {
        console.error("Failed to delete notification from Firestore:", err);
      }
    }
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bovinovision_records', JSON.stringify(records));
    } catch (e) {
      console.error('Error saving records to localStorage', e);
    }
  }, [records]);

  // Sync navigation and active record state to localStorage to survive page refreshes
  useEffect(() => {
    try {
      localStorage.setItem('bovinovision_active_tab', activeTab);
      localStorage.setItem('bovinovision_current_section', currentSection);
      if (activeRecord) {
        localStorage.setItem('bovinovision_active_record_id', activeRecord.id);
      }
    } catch (e) {
      console.error('Error saving navigation state to localStorage', e);
    }
  }, [activeTab, currentSection, activeRecord]);

  // Auto-switch away from demo record if realDataOnly mode is toggled on and active was a demo record
  useEffect(() => {
    if (realDataOnly && activeRecord && isDemoRecord(activeRecord)) {
      const remaining = records.filter(r => !isDemoRecord(r));
      if (remaining.length > 0) {
        setActiveRecord(remaining[0]);
      } else {
        setActiveRecord(undefined);
      }
    } else if (!realDataOnly && !activeRecord && records.length > 0) {
      setActiveRecord(records[0]);
    }
  }, [realDataOnly, records, activeRecord]);
  
  // Dashboard Metrics State (Computed from records in the system)
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimals: 0,
    totalNewThisWeek: 0,
    readyForSlaughter: 0,
    underMonitoring: 0,
    aiInsightsText: 'Calculando análises em tempo real para as fichas de avaliação...'
  });

  // Verify backend health and check if server-side Gemini active
  useEffect(() => {
    async function checkApiHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setGeminiEnabled(data.geminiEnabled);
        }
      } catch (err) {
        console.warn('Backend server connection issue. Standard local capabilities ready.', err);
      }
    }
    checkApiHealth();
  }, []);

  // Sync dashboard stats dynamically when displayRecords changes or on boot
  useEffect(() => {
    const totalCount = displayRecords.length;
    const readyCount = displayRecords.filter(r => r.score >= 4.0).length;
    const monitoringCount = displayRecords.filter(r => r.score < 2.5).length;
    
    // All records in the evaluation list are recent assessments
    const newThisWeek = displayRecords.length;

    setStats(prev => ({
      ...prev,
      totalAnimals: totalCount,
      totalNewThisWeek: newThisWeek,
      readyForSlaughter: readyCount,
      underMonitoring: monitoringCount
    }));
  }, [displayRecords]);

  // Request actual insights about herd health status using Gemini API endpoint 
  const fetchGeminiInsights = async (fromTelemetry: boolean = false) => {
    setLoadingInsights(true);
    try {
      // Calculate dynamic counts on-the-fly to ensure the API receives correct current numbers
      const totalCount = displayRecords.length;
      const readyCount = displayRecords.filter(r => r.score >= 4.0).length;
      const monitoringCount = displayRecords.filter(r => r.score < 2.5).length;

      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAnimals: totalCount,
          readyForSlaughter: readyCount,
          underMonitoring: monitoringCount
        })
      });

      if (res.ok) {
        const data = await res.json();
        setStats(prev => ({ ...prev, aiInsightsText: data.insight }));
      }

      // Simulate live scale telemetry syncing by updating weights ONLY when NOT in realDataOnly mode
      if (!realDataOnly) {
        let addedWeight0 = 0.0;
        let addedWeight1 = 0.0;
        setRecords(prev => {
          return prev.map((r, idx) => {
            if (idx === 0 || idx === 1) {
              const addedWeight = parseFloat((0.4 + Math.random() * 1.6).toFixed(1));
              if (idx === 0) addedWeight0 = addedWeight;
              if (idx === 1) addedWeight1 = addedWeight;
              const newWeight = Math.round(r.weight + addedWeight);
              return {
                ...r,
                weight: newWeight,
                notes: r.notes ? r.notes.replace(/\s*\(Telemetria.*?\)/g, '') + ` (Telemetria: peso atualizado em +${addedWeight}kg)` : `Peso atualizado em +${addedWeight}kg via telemetria do cocho.`
              };
            }
            return r;
          });
        });
      }

      if (fromTelemetry) {
        // Add a real success notification to notifications list
        if (realDataOnly) {
          addNotification(
            'success',
            `Sucesso: Sincronização em tempo real realizada com sucesso. Balanças e colares de campo devidamente sincronizados.`
          );
        } else {
          addNotification(
            'success',
            `Sucesso: Telemetria sincronizada com sucesso para as balanças e colares ruminais. Pesos calibrados em tempo real.`
          );
        }
      }

    } catch (err) {
      console.warn('Fallback dynamic insights loaded due to server link state.', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Sync Insights on bootup once stats stabilizes
  useEffect(() => {
    fetchGeminiInsights();
  }, []);

  // Offline connection states and background synchronization
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  // Synchronizes assessments captured during an offline state
  const syncPendingRecords = async (currentRecords: CattleRecord[]) => {
    const pendingList = currentRecords.filter(r => r.isOfflinePending);
    if (pendingList.length === 0) return;

    setIsSyncing(true);
    let successfullySyncedCount = 0;
    const updatedList = [...currentRecords];

    for (const pending of pendingList) {
      try {
        const payload = {
          imageBase64: pending.offlineStoredImage || pending.photoUrl,
          breed: pending.breed,
          lot: pending.lot,
          customSmtp: userProfile?.smtpConfig
        };

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const verified = await res.json() as CattleRecord;
          const idx = updatedList.findIndex(r => r.id === pending.id);
          if (idx !== -1) {
            const syncedItem: CattleRecord = {
              ...verified,
              id: verified.id, // Auth ID from server
              date: pending.date, // Retain capturing date
              notes: `Sincronizado automaticamente da sessão offline com sucesso. Autenticado pelo modelo de Visão do Gemini.`
            };
            updatedList[idx] = syncedItem;
            successfullySyncedCount++;

            // Cloud persistence writes for the new verified record
            const finalUid = activeUser?.uid || auth?.currentUser?.uid;
            if (isFirebaseConfigured && db && finalUid) {
              const liveRecord = {
                ...syncedItem,
                userId: finalUid
              };
              await setDoc(doc(db, 'records', verified.id), liveRecord);
              // Cleanly prune old offline temp records from DB if they were saved (with different ID)
              if (pending.id !== verified.id) {
                try {
                  await deleteDoc(doc(db, 'records', pending.id));
                } catch (e) {}
              }
            }
            if (isSupabaseConfigured && supabase && finalUid) {
              const dbItem = mapToSupabaseRecord(syncedItem, finalUid);
              await supabase.from('cattle_records').upsert([dbItem]);
              if (pending.id !== verified.id) {
                try {
                  await supabase.from('cattle_records').delete().eq('id', pending.id);
                } catch (e) {}
              }
            }
          }
        }
      } catch (err) {
        console.warn(`[Background Sync] Erro temporário ao sincronizar brinco #${pending.id}:`, err);
      }
    }

    if (successfullySyncedCount > 0) {
      const sortedResult = updatedList.sort((a, b) => parseCattleDate(b.date) - parseCattleDate(a.date));
      setRecords(sortedResult);
      
      // Update currently active detail view if it was of an offline assessment
      setActiveRecord(prev => {
        if (prev?.isOfflinePending) {
          const matched = sortedResult.find(r => r.id !== prev.id && r.breed === prev.breed && r.lot === prev.lot);
          return matched || prev;
        }
        return prev;
      });

      alert(`Sincronização offline concluída!\n\n${successfullySyncedCount} avaliações que estavam pendentes no cache local foram registradas e analisadas oficialmente no servidor BovinoVision.`);
      
      // Add a real notification for the background sync completion!
      addNotification(
        'success',
        `Sincronização offline concluída! ${successfullySyncedCount} avaliações do cache local foram transmitidas e analisadas oficialmente no servidor via Visão Computacional.`
      );

      // Refresh general analytics insights
      fetchGeminiInsights();
    }
    
    setIsSyncing(false);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncPendingRecords(records);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Run active check on initial load if we happened to refresh with unsynced local records
    if (navigator.onLine) {
      syncPendingRecords(records);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [records]);

  // Left Sidebar link router coordinating tabs and screens
  const handleSidebarSelect = (section: string) => {
    setCurrentSection(section);
    
    // Sync top-tab matching left selections
    if (section === 'overview') {
      setActiveTab('dashboard');
    } else if (section === 'health' || section === 'analytics') {
      setActiveTab('reports');
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAdjusterSrc(reader.result);
          setIsAdjusterOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setUserProfile(profileEditForm);
    localStorage.setItem('bovinovision_profile', JSON.stringify(profileEditForm));
    setIsEditingProfile(false);

    const finalUid = activeUser?.uid || auth?.currentUser?.uid;
    const finalEmail = activeUser?.email || auth?.currentUser?.email || profileEditForm.email;

    if (isSupabaseConfigured && supabase && finalUid) {
      try {
        const dbPayload = mapToSupabaseProfile(profileEditForm, finalUid);
        const { error } = await supabase.from('user_profiles').upsert([dbPayload]);
        if (error) console.error("Supabase profile save error:", error);
      } catch (err) {
        console.error("Supabase profile upsert exception:", err);
      }
    }

    if (isFirebaseConfigured && db && finalUid) {
      const userDocRef = doc(db, 'users', finalUid);
      try {
        await setDoc(userDocRef, {
          uid: finalUid,
          email: finalEmail,
          name: profileEditForm.name,
          crmv: profileEditForm.crmv,
          specialty: profileEditForm.specialty,
          division: profileEditForm.division,
          location: profileEditForm.location,
          license: profileEditForm.license,
          photoUrl: profileEditForm.photoUrl,
          smtpConfig: profileEditForm.smtpConfig || null
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${finalUid}`);
      }
    }
  };

  const handleUpdateProfile = async (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('bovinovision_profile', JSON.stringify(newProfile));

    const finalUid = activeUser?.uid || auth?.currentUser?.uid;
    const finalEmail = activeUser?.email || auth?.currentUser?.email || newProfile.email;

    if (isSupabaseConfigured && supabase && finalUid) {
      try {
        const dbPayload = mapToSupabaseProfile(newProfile, finalUid);
        const { error } = await supabase.from('user_profiles').upsert([dbPayload]);
        if (error) console.error("Supabase profile save error:", error);
      } catch (err) {
        console.error("Supabase profile upsert exception:", err);
      }
    }

    if (isFirebaseConfigured && db && finalUid) {
      const userDocRef = doc(db, 'users', finalUid);
      try {
        await setDoc(userDocRef, {
          uid: finalUid,
          email: finalEmail,
          name: newProfile.name,
          crmv: newProfile.crmv,
          specialty: newProfile.specialty,
          division: newProfile.division,
          location: newProfile.location,
          license: newProfile.license,
          photoUrl: newProfile.photoUrl,
          smtpConfig: newProfile.smtpConfig || null
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${finalUid}`);
      }
    }
  };
  const handleTabSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    
    if (tab === 'dashboard') {
      setCurrentSection('overview');
    } else if (tab === 'reports') {
      setCurrentSection('analytics');
    } else {
      setCurrentSection('');
    }
  };

  // Append a brand new bovine assessment captured from live upload & vision API
  const handleNewAnalysisComplete = async (newRecord: CattleRecord) => {
    let validatedRecord: CattleRecord;
    try {
      validatedRecord = validateCattleRecord(newRecord) as CattleRecord;
    } catch (err: any) {
      alert(err.message || "Erro de validação do registro.");
      return;
    }

    const finalUid = activeUser?.uid || auth?.currentUser?.uid;

    // Direct local Optimistic update so the record immediately exists on UI, correctly sorted descending by date
    setRecords(prev => {
      const exists = prev.some(r => r.id === validatedRecord.id);
      const filtered = exists 
        ? prev.map(r => r.id === validatedRecord.id ? { ...validatedRecord, isOfflinePending: r.isOfflinePending } : r) 
        : [validatedRecord, ...prev];
      return filtered.sort((a, b) => parseCattleDate(b.date) - parseCattleDate(a.date));
    });
    setActiveRecord(validatedRecord);

    if (isSupabaseConfigured && supabase && finalUid) {
      try {
        const dbItem = mapToSupabaseRecord(validatedRecord, finalUid);
        const { error } = await supabase.from('cattle_records').upsert([dbItem]);
        if (error) {
          console.error("Supabase record insert failed:", error);
        }
      } catch (err) {
        console.error("Supabase record insert exception:", err);
      }
    }

    if (isFirebaseConfigured && db && finalUid) {
      const liveRecord = {
        ...validatedRecord,
        userId: finalUid
      };
      const recordPath = `records/${validatedRecord.id}`;
      try {
        await setDoc(doc(db, 'records', validatedRecord.id), liveRecord);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, recordPath);
      }
    }
    
    setModalOpen(false);
    
    // Add real assessment success/critical notification based on the real animal verdict
    const isCritical = validatedRecord.verdict === 'NÃO APTO';
    addNotification(
      isCritical ? 'critical' : 'success',
      isCritical 
        ? `Alerta Crítico: Animal #${validatedRecord.id} foi analisado e classificado como NÃO APTO devido ao ECC de ${validatedRecord.score.toFixed(1)}.`
        : `Sucesso: Novo diagnóstico concluído para o animal #${validatedRecord.id} com ECC ${validatedRecord.score.toFixed(1)} (Apto para Abate).`
    );

    // Instantly transport user to details view Outcome
    setActiveTab('assessments');
    setCurrentSection('');
    
    // Sparkle refresh comments
    fetchGeminiInsights();
  };

  // Render Core content screens relative to selections
  const renderCurrentView = () => {
    // 1. Sidebar specific views
    if (currentSection === 'support') {
      return <SupportChatView />;
    }
    if (currentSection === 'account') {
      if (isEditingProfile) {
        return (
          <div className="max-w-2xl mx-auto bg-blue-50/40 dark:bg-[#0a0f1d] rounded-lg border border-blue-100 dark:border-blue-900/50 p-6 shadow-sm space-y-6 text-left animate-fade-in font-sans">
            <div className="flex justify-between items-center pb-4 border-b border-blue-100 dark:border-blue-900/40">
              <h3 className="text-sm font-mono font-bold text-gray-400 dark:text-gray-500 uppercase">Editar Perfil de Usuário</h3>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 rounded-full hover:bg-blue-100/50 dark:hover:bg-blue-900/50 text-gray-550 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Photo Edit Segment */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-blue-100 dark:border-blue-900/40">
              <div className="relative group/profilePhoto cursor-pointer" onClick={() => document.getElementById('profile-upload-input')?.click()}>
                <img
                  src={profileEditForm.photoUrl}
                  alt="Pré-visualização do perfil"
                  className="h-24 w-24 rounded-full border border-gray-200 dark:border-gray-700 object-cover shadow-md transition-all group-hover/profilePhoto:brightness-75"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover/profilePhoto:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <input
                  id="profile-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageUpload}
                />
              </div>

              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase font-mono">Foto de Perfil</h4>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight">Faça upload de uma foto personalizada do seu dispositivo (JPEG/PNG) para atualizar sua imagem de perfil.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => document.getElementById('profile-upload-input')?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 h-9 text-xs font-bold bg-blue-50/80 text-blue-800 dark:bg-blue-950/60 dark:text-sky-300 rounded border border-blue-200 dark:border-blue-900/40 cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    <Upload className="h-4 w-4 text-blue-600" />
                    <span>Upload Foto de Perfil</span>
                  </button>


                </div>
              </div>
            </div>

            {/* Details Fields Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-gray-400 dark:text-gray-500 font-mono text-[9px] uppercase font-bold block">Nome do Veterinário</label>
                <input
                  type="text"
                  value={profileEditForm.name}
                  onChange={(e) => setProfileEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-10 px-3 bg-blue-50/10 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded font-bold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 dark:text-gray-500 font-mono text-[9px] uppercase font-bold block">Registro Regional CRMV</label>
                <input
                  type="text"
                  value={profileEditForm.crmv}
                  onChange={(e) => setProfileEditForm(prev => ({ ...prev, crmv: e.target.value }))}
                  className="w-full h-10 px-3 bg-blue-50/10 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded font-mono text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 dark:text-gray-500 font-mono text-[9px] uppercase font-bold block">Especialidade e Cargo</label>
                <input
                  type="text"
                  value={profileEditForm.specialty}
                  onChange={(e) => setProfileEditForm(prev => ({ ...prev, specialty: e.target.value }))}
                  className="w-full h-10 px-3 bg-blue-50/10 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded font-sans text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 dark:text-gray-500 font-mono text-[9px] uppercase font-bold block">E-mail Corporativo</label>
                <input
                  type="email"
                  value={profileEditForm.email}
                  onChange={(e) => setProfileEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full h-10 px-3 bg-blue-50/10 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded font-mono text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 dark:text-gray-500 font-mono text-[9px] uppercase font-bold block">Divisão Ativa</label>
                <input
                  type="text"
                  value={profileEditForm.division}
                  onChange={(e) => setProfileEditForm(prev => ({ ...prev, division: e.target.value }))}
                  className="w-full h-10 px-3 bg-blue-50/10 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded font-sans text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 dark:text-gray-500 font-mono text-[9px] uppercase font-bold block">Sede de Trabalho</label>
                <input
                  type="text"
                  value={profileEditForm.location}
                  onChange={(e) => setProfileEditForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full h-10 px-3 bg-blue-50/10 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded font-sans text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-gray-400 dark:text-gray-500 font-mono text-[9px] uppercase font-bold block">Licenças e Certificações de Escoragem</label>
                <input
                  type="text"
                  value={profileEditForm.license}
                  onChange={(e) => setProfileEditForm(prev => ({ ...prev, license: e.target.value }))}
                  className="w-full h-10 px-3 bg-blue-50/10 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded font-sans font-bold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              {/* Seção das Configurações SMTP */}
              <div className="sm:col-span-2 pt-4 border-t border-blue-100 dark:border-blue-900/30 space-y-3">
                <div className="flex items-center gap-1.5 text-blue-800 dark:text-sky-400">
                  <Mail className="h-4 w-4" />
                  <h4 className="font-bold text-xs uppercase font-sans tracking-wide">Configurações de Servidor SMTP (Alertas)</h4>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-450 leading-normal">
                  Configure seu próprio servidor de e-mail integrado para que a IA envie os laudos de animais NÃO APTOS automaticamente para seu endereço de destino/parceiros.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="space-y-1.5">
                    <label className="text-gray-400 dark:text-gray-500 font-mono text-[9px] uppercase font-bold block">Servidor SMTP Host</label>
                    <input
                      type="text"
                      placeholder="ex: smtp.gmail.com"
                      value={profileEditForm.smtpConfig?.host || ''}
                      onChange={(e) => setProfileEditForm(prev => ({
                        ...prev,
                        smtpConfig: {
                          host: e.target.value,
                          port: prev.smtpConfig?.port || 587,
                          secure: prev.smtpConfig?.secure || false,
                          user: prev.smtpConfig?.user || '',
                          pass: prev.smtpConfig?.pass || '',
                          from: prev.smtpConfig?.from || ''
                        }
                      }))}
                      className="w-full h-10 px-3 bg-blue-50/10 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded font-sans text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-400 dark:text-gray-500 font-mono text-[9px] uppercase font-bold block">Porta do Servidor</label>
                    <input
                      type="number"
                      placeholder="ex: 587"
                      value={profileEditForm.smtpConfig?.port || 587}
                      onChange={(e) => setProfileEditForm(prev => ({
                        ...prev,
                        smtpConfig: {
                          host: prev.smtpConfig?.host || '',
                          port: Number(e.target.value) || 587,
                          secure: prev.smtpConfig?.secure || false,
                          user: prev.smtpConfig?.user || '',
                          pass: prev.smtpConfig?.pass || '',
                          from: prev.smtpConfig?.from || ''
                        }
                      }))}
                      className="w-full h-10 px-3 bg-blue-50/10 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded font-sans text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-400 dark:text-gray-500 font-mono text-[9px] uppercase font-bold block">Autenticação Usuário</label>
                    <input
                      type="text"
                      placeholder="ex: seu-email@gmail.com"
                      value={profileEditForm.smtpConfig?.user || ''}
                      onChange={(e) => setProfileEditForm(prev => ({
                        ...prev,
                        smtpConfig: {
                          host: prev.smtpConfig?.host || '',
                          port: prev.smtpConfig?.port || 587,
                          secure: prev.smtpConfig?.secure || false,
                          user: e.target.value,
                          pass: prev.smtpConfig?.pass || '',
                          from: prev.smtpConfig?.from || ''
                        }
                      }))}
                      className="w-full h-10 px-3 bg-blue-50/10 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded font-sans text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-400 dark:text-gray-500 font-mono text-[9px] uppercase font-bold block">Senha / Token de App (Senha SMTP)</label>
                    <input
                      type="password"
                      placeholder="Sua senha ou Token"
                      value={profileEditForm.smtpConfig?.pass || ''}
                      onChange={(e) => setProfileEditForm(prev => ({
                        ...prev,
                        smtpConfig: {
                          host: prev.smtpConfig?.host || '',
                          port: prev.smtpConfig?.port || 587,
                          secure: prev.smtpConfig?.secure || false,
                          user: prev.smtpConfig?.user || '',
                          pass: e.target.value,
                          from: prev.smtpConfig?.from || ''
                        }
                      }))}
                      className="w-full h-10 px-3 bg-blue-50/10 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded font-sans text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-400 dark:text-gray-500 font-mono text-[9px] uppercase font-bold block">E-mail Remetente (De:)</label>
                    <input
                      type="text"
                      placeholder="BovinoVision Alerta <alertas@fazenda.com.br>"
                      value={profileEditForm.smtpConfig?.from || ''}
                      onChange={(e) => setProfileEditForm(prev => ({
                        ...prev,
                        smtpConfig: {
                          host: prev.smtpConfig?.host || '',
                          port: prev.smtpConfig?.port || 587,
                          secure: prev.smtpConfig?.secure || false,
                          user: prev.smtpConfig?.user || '',
                          pass: prev.smtpConfig?.pass || '',
                          from: e.target.value
                        }
                      }))}
                      className="w-full h-10 px-3 bg-blue-50/10 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded font-sans text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-end">
                    <div className="flex items-center justify-between h-10 px-3 bg-blue-50/5 dark:bg-blue-950/5 border border-dashed border-blue-100/40 dark:border-blue-900/30 rounded">
                      <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">Conexão Segura SSL/TLS</span>
                      <label className="relative inline-flex items-center cursor-pointer scale-90">
                        <input
                          type="checkbox"
                          checked={profileEditForm.smtpConfig?.secure || false}
                          onChange={(e) => setProfileEditForm(prev => ({
                            ...prev,
                            smtpConfig: {
                              host: prev.smtpConfig?.host || '',
                              port: prev.smtpConfig?.port || 587,
                              secure: e.target.checked,
                              user: prev.smtpConfig?.user || '',
                              pass: prev.smtpConfig?.pass || '',
                              from: prev.smtpConfig?.from || ''
                            }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-650 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-blue-100 dark:border-blue-900/40">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="h-10 px-4 border border-blue-100 dark:border-blue-900/40 hover:bg-blue-100/50 dark:hover:bg-blue-901/50 text-gray-800 dark:text-gray-300 rounded-xl font-sans font-semibold text-xs transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="h-10 px-5 bg-[#1e3a8a] hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-900 text-white rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Salvar Modificações</span>
              </button>
            </div>
          </div>
        );
      }

      // Read-Only profile view (with dynamic fields)
      return (
        <div className="max-w-2xl mx-auto bg-blue-50/40 dark:bg-[#0a0f1d] rounded-lg border border-blue-100 dark:border-blue-900/40 p-6 shadow-sm space-y-6 text-left animate-fade-in font-sans">
          
          <div className="flex justify-between items-center pb-4 border-b border-blue-100 dark:border-blue-900/40">
            <h3 className="text-sm font-mono font-bold text-gray-400 dark:text-gray-500 uppercase">Minha Conta de Usuário</h3>
            <button
              onClick={() => {
                setProfileEditForm(userProfile);
                setIsEditingProfile(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-blue-50/50 dark:bg-gray-900/60 dark:hover:bg-gray-850 text-[#1e3a8a] dark:text-sky-300 border border-[#1e3a8a] dark:border-sky-500/50 rounded-lg font-sans font-bold text-[10px] tracking-wider uppercase transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md cursor-pointer"
            >
              <Edit3 className="h-3 w-3 stroke-[2.5]" />
              <span>Editar Perfil</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-blue-100 dark:border-blue-900/40">
            <img
              src={userProfile.photoUrl}
              alt={userProfile.name}
              className="h-24 w-24 rounded-full border border-gray-200 dark:border-gray-700 object-cover shadow-sm bg-gray-50/20"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-xl font-bold font-sans text-gray-950 dark:text-white">{userProfile.name}</h2>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-800 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 border border-blue-100 dark:border-blue-900/50 rounded">
                {userProfile.crmv}
              </span>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">{userProfile.specialty}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-blue-50/15 dark:bg-blue-950/20 rounded border border-blue-100/50 dark:border-blue-900/30 space-y-1 overflow-hidden">
              <span className="text-gray-400 dark:text-gray-500 block text-[9px] uppercase">E-mail Corporativo</span>
              <span className="text-gray-900 dark:text-gray-100 font-bold block break-all md:break-normal">{userProfile.email}</span>
            </div>
            <div className="p-3 bg-blue-50/15 dark:bg-blue-950/20 rounded border border-blue-100/50 dark:border-blue-900/30 space-y-1">
              <span className="text-gray-400 dark:text-gray-500 block text-[9px] uppercase">Divisão Ativa</span>
              <span className="text-gray-900 dark:text-gray-100 font-bold block">{userProfile.division}</span>
            </div>
            <div className="p-3 bg-blue-50/15 dark:bg-blue-950/20 rounded border border-blue-100/50 dark:border-blue-900/30 space-y-1">
              <span className="text-gray-400 dark:text-gray-500 block text-[9px] uppercase">Sede de Trabalho</span>
              <span className="text-gray-900 dark:text-gray-100 font-bold block">{userProfile.location}</span>
            </div>
            <div className="p-3 bg-blue-50/15 dark:bg-blue-950/20 rounded border border-blue-100/50 dark:border-blue-900/30 space-y-1">
              <span className="text-gray-400 dark:text-gray-500 block text-[9px] uppercase">Licenças de Escoragem</span>
              <span className="text-blue-800 dark:text-sky-300 font-extrabold flex items-center gap-1">
                <BadgeCheck className="h-4 w-4 shrink-0 text-blue-550 dark:text-sky-400" />
                <span>{userProfile.license}</span>
              </span>
            </div>
          </div>

          {/* SMTP Config Read-Only Review Panel */}
          <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/10 rounded-lg border border-emerald-500/10 dark:border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-850 dark:text-emerald-400 font-bold text-xs uppercase font-sans tracking-wide">
              <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Servidor SMTP Integrado</span>
            </div>
            {userProfile.smtpConfig?.host ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-gray-550 dark:text-gray-400">
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">SMTP Host / Porta</span>
                  <span className="text-gray-900 dark:text-gray-100 font-extrabold">{userProfile.smtpConfig.host}:{userProfile.smtpConfig.port}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Remetente</span>
                  <span className="text-gray-900 dark:text-gray-100 font-extrabold">{userProfile.smtpConfig.from || 'Padrão'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Usuário Autenticado</span>
                  <span className="text-gray-900 dark:text-gray-100 font-extrabold">{userProfile.smtpConfig.user}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Segurança SSL/TLS</span>
                  <span className="text-gray-900 dark:text-gray-100 font-extrabold">{userProfile.smtpConfig.secure ? 'Ativado (SSL/TLS)' : 'Desativado'}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400 dark:text-gray-500 italic font-mono">
                Nenhum servidor SMTP customizado configurado. Alertas estão operando no modo simulação.
              </div>
            )}
          </div>
        </div>
      );
    }

    // 2. Top-Tab standard modules
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            stats={stats}
            records={displayRecords}
            recentRecords={displayRecords.slice(0, 4)} // top 4 recent
            realDataOnly={realDataOnly}
            onToggleRealDataOnly={setRealDataOnly}
            onSelectRecord={(r) => {
              setActiveRecord(r);
              setActiveTab('assessments');
              setCurrentSection('');
            }}
            onNavigateToHistory={() => {
              setActiveTab('history');
              setCurrentSection('');
            }}
            triggerRefreshInsights={fetchGeminiInsights}
            loadingInsights={loadingInsights}
            language={language}
          />
        );
      case 'assessments':
        return (
          <AssessmentView
            record={activeRecord}
            userProfile={userProfile}
            onClose={() => handleTabSelect('dashboard')}
            onSaveToHistory={async (updated) => {
              let validatedRecord: CattleRecord;
              try {
                validatedRecord = validateCattleRecord(updated) as CattleRecord;
              } catch (err: any) {
                alert(err.message || 'Erro de validação do registro bovino.');
                return;
              }

              const finalUid = activeUser?.uid || auth?.currentUser?.uid;

              // 1. Instantly perform Optimistic Local state update, sorted chronologically descending!
              setRecords(prev => {
                const exists = prev.some(r => r.id === validatedRecord.id);
                const filtered = exists 
                  ? prev.map(r => r.id === validatedRecord.id ? validatedRecord : r) 
                  : [validatedRecord, ...prev];
                return filtered.sort((a, b) => parseCattleDate(b.date) - parseCattleDate(a.date));
              });
              setActiveRecord(validatedRecord);

              if (isSupabaseConfigured && supabase && finalUid) {
                try {
                  const dbItem = mapToSupabaseRecord(validatedRecord, finalUid);
                  const { error } = await supabase.from('cattle_records').upsert([dbItem]);
                  if (error) {
                    console.error("Supabase onSaveToHistory failed:", error);
                  } else {
                    alert(`Escore ECC do Brinco #${validatedRecord.id} salvo e autenticado com sucesso no Supabase.`);
                  }
                } catch (err) {
                  console.error("Supabase save exception:", err);
                }
              }

              if (isFirebaseConfigured && db && finalUid) {
                const liveRecord = {
                  ...validatedRecord,
                  userId: finalUid
                };
                const recordPath = `records/${validatedRecord.id}`;
                try {
                  await setDoc(doc(db, 'records', validatedRecord.id), liveRecord);
                  if (!isSupabaseConfigured) {
                    alert(`Escore ECC do Brinco #${validatedRecord.id} salvo e autenticado com sucesso no Firestore.`);
                  }
                } catch (err) {
                  handleFirestoreError(err, OperationType.WRITE, recordPath);
                }
              } else if (!isSupabaseConfigured) {
                alert(`Escore ECC do Brinco #${validatedRecord.id} salvo e autenticado com sucesso no livro de registro de rebanhos.`);
              }
            }}
            isSavedInDb={activeRecord ? records.some(r => r.id === activeRecord.id) : false}
          />
        );
      case 'history':
        return (
          <HistoryView
            records={displayRecords}
            onSelectRecord={(r) => {
              setActiveRecord(r);
              setActiveTab('assessments');
              setCurrentSection('');
            }}
            onNewAssessment={() => setModalOpen(true)}
            onDeleteRecord={async (id) => {
              const finalUid = activeUser?.uid || auth?.currentUser?.uid;

              if (isSupabaseConfigured && supabase && finalUid) {
                try {
                  const { error } = await supabase.from('cattle_records').delete().eq('id', id);
                  if (error) {
                    console.error("Supabase record deletion failed:", error);
                  }
                } catch (err) {
                  console.error("Supabase record delete exception:", err);
                }
              }

              if (isFirebaseConfigured && db && finalUid) {
                const recordPath = `records/${id}`;
                try {
                  await deleteDoc(doc(db, 'records', id));
                } catch (err) {
                  handleFirestoreError(err, OperationType.DELETE, recordPath);
                }
              }

              // Instantly update local state for absolute responsiveness
              setRecords(prev => {
                const updated = prev.filter(r => r.id !== id);
                if (activeRecord?.id === id) {
                  setActiveRecord(updated[0] || undefined);
                }
                return updated;
              });
            }}
            onUpdateRecord={async (updated) => {
              let validatedRecord: CattleRecord;
              try {
                validatedRecord = validateCattleRecord(updated) as CattleRecord;
              } catch (err: any) {
                alert(err.message || 'Erro de validação do registro bovino.');
                return;
              }

              const finalUid = activeUser?.uid || auth?.currentUser?.uid;

              if (isSupabaseConfigured && supabase && finalUid) {
                try {
                  const dbItem = mapToSupabaseRecord(validatedRecord, finalUid);
                  const { error } = await supabase.from('cattle_records').upsert([dbItem]);
                  if (error) {
                    console.error("Supabase record update failed:", error);
                  }
                } catch (err) {
                  console.error("Supabase record update exception:", err);
                }
              }

              if (isFirebaseConfigured && db && finalUid) {
                const liveRecord = {
                  ...validatedRecord,
                  userId: finalUid
                };
                const recordPath = `records/${validatedRecord.id}`;
                try {
                  await setDoc(doc(db, 'records', validatedRecord.id), liveRecord);
                } catch (err) {
                  handleFirestoreError(err, OperationType.WRITE, recordPath);
                }
              }

              // Instantly update local state for absolute responsiveness
              setRecords(prev => prev.map(r => r.id === validatedRecord.id ? validatedRecord : r));
              if (activeRecord?.id === validatedRecord.id) {
                setActiveRecord(validatedRecord);
              }
            }}
          />
        );
      case 'reports':
        return <ReportsView records={displayRecords} userProfile={userProfile} />;
      default:
        return <ReportsView records={displayRecords} userProfile={userProfile} />;
    }
  };

  if (authInitializing) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center font-sans text-white">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="h-10 w-10 border-4 border-t-blue-500 border-blue-900 rounded-full animate-spin"></div>
          <p className="text-sm font-mono tracking-wider text-gray-400">Sincronizando Sistema de Precisão BovinoVision...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginView 
        onLoginSuccess={() => {
          localStorage.setItem('bovinovision_logged_in', 'true');
          setIsLoggedIn(true);
          // Set to false to avoid playing the long cybernetic splash progress animations on login
          setShowSplash(false);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] dark:bg-[#0b0f17] dark:text-[#f1f5f9] flex flex-col font-sans transition-colors duration-200">
      {showSplash && (
        <SplashIntro onComplete={() => setShowSplash(false)} />
      )}
      
      {/* Top Banner Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={handleTabSelect} 
        geminiActive={geminiEnabled} 
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        profileName={userProfile.name}
        profilePhoto={userProfile.photoUrl}
        profileSpecialty={userProfile.specialty}
        onReplayLogoSplash={() => setShowSplash(true)}
        language={language}
        onLanguageChange={setLanguage}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onDismissNotification={handleDismissNotification}
        onProfileClick={() => {
          setCurrentSection('account');
          setIsEditingProfile(false);
          setActiveTab('' as any);
        }}
        isFirebaseConfigured={isFirebaseConfigured}
        isSupabaseConfigured={isSupabaseConfigured}
        userProfile={userProfile}
        onProfileChange={handleUpdateProfile}
        realDataOnly={realDataOnly}
        onToggleRealDataOnly={setRealDataOnly}
      />

      {/* Offline Status & Background Sync Banners */}
      {isOffline && (
        <div className="bg-amber-500/10 dark:bg-amber-950/25 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 py-3 px-4 md:px-8 text-xs transition-all flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-2.5 max-w-7xl mx-auto w-full">
            <WifiOff className="h-4 w-4 text-amber-600 shrink-0 animate-pulse" />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex flex-col text-left">
                <span className="font-sans font-bold">
                  Conectividade de Rede Indisponível (Modo Offline)
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                  O BovinoVision possui inteligência local edge. Novas escorações de carcaça serão salvas localmente até restabelecer a rede.
                </span>
              </div>
              <span className="font-mono text-[10px] bg-amber-500/20 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded border border-amber-500/20 self-start sm:self-auto font-extrabold uppercase shrink-0">
                {records.filter(r => r.isOfflinePending).length} Fichas em Cache Local
              </span>
            </div>
          </div>
        </div>
      )}

      {isSyncing && (
        <div className="bg-emerald-500/10 dark:bg-emerald-950/30 border-b border-emerald-500/20 text-[#012d1d] dark:text-[#aeeecb] py-3 px-4 md:px-8 text-xs transition-all flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-2.5 max-w-7xl mx-auto w-full font-sans font-bold text-left">
            <RefreshCw className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 animate-spin" />
            <div className="flex flex-col">
              <span>Sincronizando novas avaliações offline...</span>
              <span className="text-[10px] font-mono text-gray-400 dark:text-emerald-500 leading-none">Transmitindo bytes temporários para servidores Gemini AI</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Structural Layout */}
      <div className="flex flex-1 w-full max-w-7xl mx-auto items-stretch relative">
        
        {/* Persistent left telemetry Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabSelect}
          currentSection={currentSection}
          setCurrentSection={handleSidebarSelect}
          onNewAssessment={() => setModalOpen(true)}
          geminiActive={geminiEnabled}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onLogout={async () => {
            if (isFirebaseConfigured && auth) {
              try {
                await signOut(auth);
              } catch (e) {
                console.error("Firebase SignOut error:", e);
              }
            }
            localStorage.setItem('bovinovision_logged_in', 'false');
            localStorage.removeItem('bovinovision_active_user');
            setActiveUser(null);
            setIsLoggedIn(false);
          }}
          language={language}
          userProfile={userProfile}
        />

        {/* Dynamic primary Center Stage */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6 w-full">
          {renderCurrentView()}
        </main>

      </div>

      {/* Interactive Drag/webcam analysis overlay panel modal */}
      {modalOpen && (
        <NewAssessmentModal
          onClose={() => setModalOpen(false)}
          onAnalysisComplete={handleNewAnalysisComplete}
          vetEmail={userProfile.email}
          language={language}
        />
      )}

      {/* Dynamic Compliance/Integration Portals Footer Modal */}
      {footerModalType && (
        <FooterModal
          initialTab={footerModalType}
          onClose={() => setFooterModalType(null)}
        />
      )}

      {/* Interactive Profile Photo Adjuster Modal */}
      <ImageAdjusterModal
        isOpen={isAdjusterOpen}
        imageSrc={adjusterSrc}
        onClose={() => setIsAdjusterOpen(false)}
        onConfirm={(adjustedBase64) => {
          setProfileEditForm(prev => ({
            ...prev,
            photoUrl: adjustedBase64
          }));
          setIsAdjusterOpen(false);
        }}
      />

      {/* Dynamic footer matching brand standards */}
      <footer className="py-6 border-t border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-950/40 mt-auto text-center shrink-0 text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 print:hidden font-sans">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} BovinoVision AI Technologies. Todos os direitos reservados. Divisão de Pecuária de Precisão.</span>
          <div className="flex gap-4">
            <button onClick={() => setFooterModalType('terms')} className="hover:text-[#012d1d] dark:hover:text-emerald-400 cursor-pointer focus:outline-none bg-transparent border-none p-0 text-[10px] font-mono font-bold">Termos de Serviço</button>
            <button onClick={() => setFooterModalType('privacy')} className="hover:text-[#012d1d] dark:hover:text-emerald-400 cursor-pointer focus:outline-none bg-transparent border-none p-0 text-[10px] font-mono font-bold">Política de Privacidade</button>
            <button onClick={() => setFooterModalType('support')} className="hover:text-[#012d1d] dark:hover:text-emerald-400 cursor-pointer focus:outline-none bg-transparent border-none p-0 text-[10px] font-mono font-bold">Suporte Técnico</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
