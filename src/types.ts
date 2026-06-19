/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Landmark {
  x: number; // percentage width (0-100)
  y: number; // percentage height (0-100)
  label: string;
  type: 'muscle' | 'fat' | 'skeleton';
}

export type VerdictType = 'APTO PARA ABATE' | 'NÃO APTO';

export interface CattleRecord {
  id: string; // e.g. 'AB-9042'
  photoUrl: string; // URL of image
  date: string; // formatted date, e.g. '24 Out 2024, 08:30'
  lot: string; // e.g. 'Lote Norte - A'
  breed: string; // e.g. 'Nelore Puro'
  score: number; // ECC e.g. 3.5
  weight: number; // e.g. 542.4
  fatProgress: number; // percentage e.g. 14.2
  verdict: VerdictType;
  extractionFocus?: string; // 'Visão Geral' | 'Features Geométricas (Lombo, Garupa, Dorso)'
  landmarkPoints?: Landmark[];
  aiConfidence?: number; // percentage, e.g. 98.4
  notes?: string;
  isOfflinePending?: boolean; // Indicates record was created in offline mode and needs syncing
  offlineStoredImage?: string; // Statically holds base64 file data for offline queue and subsequent sync uploads
  isRealWeight?: boolean; // Indicates the weight was manually entered/confirmed from a real physical scale
  emailAlert?: {
    success: boolean;
    sent: boolean;
    recipient: string;
    etherealUrl?: string;
    error?: string;
    bccStatus?: 'CRITICAL' | 'NORMAL';
  };
}

export type ActiveTab = 'dashboard' | 'assessments' | 'history' | 'reports';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export interface UserProfile {
  name: string;
  crmv: string;
  specialty: string;
  email: string;
  division: string;
  location: string;
  license: string;
  photoUrl: string;
  hasSeeded?: boolean;
  smtpConfig?: SmtpConfig;
}

export interface DashboardStats {
  totalAnimals: number;
  totalNewThisWeek: number;
  readyForSlaughter: number;
  underMonitoring: number;
  monthlyBcs: { month: string; bcs: number }[];
  aiInsightsText: string;
}

export interface AppNotification {
  id: string | number;
  type: 'critical' | 'success' | 'notice';
  message: string;
  time: string;
  unread: boolean;
  createdAt?: string;
}
