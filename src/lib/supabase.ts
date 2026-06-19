/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { UserProfile, CattleRecord } from '../types';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Detect if real Supabase credentials have been provided
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'placeholder-url' && 
  supabaseUrl.indexOf('http') === 0
);

// Lazy client setup
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Helpers to map camelCase Client Types to snake_case PostgreSQL Database columns

export function mapToSupabaseProfile(p: UserProfile, uid: string) {
  return {
    uid: uid,
    email: p.email,
    name: p.name,
    crmv: p.crmv,
    specialty: p.specialty,
    division: p.division,
    location: p.location,
    license: p.license,
    photo_url: p.photoUrl,
    has_seeded: p.hasSeeded || false
  };
}

export function mapFromSupabaseProfile(d: any): UserProfile {
  return {
    name: d.name || '',
    crmv: d.crmv || '',
    specialty: d.specialty || '',
    email: d.email || '',
    division: d.division || '',
    location: d.location || '',
    license: d.license || '',
    photoUrl: d.photo_url || '',
    hasSeeded: d.has_seeded || false
  };
}

export function mapToSupabaseRecord(r: CattleRecord, userId: string) {
  return {
    id: r.id,
    user_id: userId,
    photo_url: r.photoUrl || '',
    date: r.date || '',
    lot: r.lot || '',
    breed: r.breed || '',
    score: Number(r.score) || 3.0,
    weight: Number(r.weight) || 450.0,
    fat_progress: Number(r.fatProgress) || 0.0,
    verdict: r.verdict || 'NÃO APTO',
    ai_confidence: r.aiConfidence ? Number(r.aiConfidence) : null,
    notes: r.notes || '',
    landmark_points: r.landmarkPoints || []
  };
}

export function mapFromSupabaseRecord(d: any): CattleRecord {
  return {
    id: d.id,
    photoUrl: d.photo_url || '',
    date: d.date || '',
    lot: d.lot || '',
    breed: d.breed || '',
    score: Number(d.score) || 3.0,
    weight: Number(d.weight) || 450.0,
    fatProgress: Number(d.fat_progress) || 0.0,
    verdict: d.verdict || 'NÃO APTO',
    landmarkPoints: d.landmark_points || [],
    aiConfidence: d.ai_confidence ? Number(d.ai_confidence) : undefined,
    notes: d.notes || ''
  };
}
