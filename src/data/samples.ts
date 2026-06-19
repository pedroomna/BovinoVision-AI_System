/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CattleRecord } from '../types';

export const SAMPLE_CATTLE: CattleRecord[] = [
  {
    id: 'AB-9255',
    photoUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80',
    date: '22 Mai 2026, 09:20',
    lot: 'Lote Norte - A',
    breed: 'Brahman',
    score: 4.5,
    weight: 542.4,
    fatProgress: 14.2,
    verdict: 'APTO PARA ABATE',
    aiConfidence: 98.4,
    notes: 'Animal atingiu os parâmetros ideais de rendimento de carcaça e acabamento subcutâneo. Pronto para embarque imediato.',
    landmarkPoints: [
      { x: 32, y: 44, label: 'Paleta (Cavidade Escapular)', type: 'skeleton' },
      { x: 42, y: 38, label: 'Lombo (Gordura Dorsal)', type: 'fat' },
      { x: 55, y: 36, label: 'Garupa (Área do Lombo)', type: 'muscle' },
      { x: 68, y: 28, label: 'Garupa (Coxa posterior)', type: 'muscle' },
      { x: 74, y: 37, label: 'Cabeça da Cauda (Prega)', type: 'fat' },
      { x: 48, y: 55, label: 'Costelas (Cobertura)', type: 'fat' },
      { x: 58, y: 62, label: 'Linha de Flanco', type: 'skeleton' }
    ]
  },
  {
    id: 'AB-9042',
    photoUrl: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&w=800&q=80',
    date: '24 Abr 2026, 08:30',
    lot: 'Lote Norte - A',
    breed: 'Nelore Puro',
    score: 3.5,
    weight: 512.5,
    fatProgress: 12.8,
    verdict: 'APTO PARA ABATE',
    aiConfidence: 95.2,
    notes: 'Condição corporal saudável e dentro das médias esperadas para o lote nesta estação.',
    landmarkPoints: [
      { x: 30, y: 46, label: 'Articulação de Ombro', type: 'skeleton' },
      { x: 45, y: 39, label: 'Alinhamento de Vértebras', type: 'skeleton' },
      { x: 60, y: 38, label: 'Inserção de Garupa', type: 'muscle' },
      { x: 70, y: 31, label: 'Garupa Traseira', type: 'muscle' },
      { x: 76, y: 39, label: 'Garupa Baixa', type: 'fat' },
      { x: 50, y: 56, label: 'Arqueamento de Costela', type: 'fat' }
    ]
  },
  {
    id: 'AB-9128',
    photoUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80',
    date: '23 Mar 2026, 15:45',
    lot: 'Setor Sul - B',
    breed: 'Angus Black',
    score: 2.1,
    weight: 465.0,
    fatProgress: 8.5,
    verdict: 'NÃO APTO',
    aiConfidence: 89.1,
    notes: 'Exibe cobertura de gordura insatisfatória nas costelas e garupa. Monitorar ingestão calórica e alimentação de cocho.',
    landmarkPoints: [
      { x: 34, y: 48, label: 'Cavidade Torácica', type: 'skeleton' },
      { x: 48, y: 42, label: 'Linha Posterior de Ribs', type: 'skeleton' },
      { x: 62, y: 40, label: 'Depressão Sacral', type: 'skeleton' },
      { x: 75, y: 42, label: 'Isquios Expostos', type: 'skeleton' },
      { x: 52, y: 59, label: 'Região de Vazios', type: 'muscle' }
    ]
  },
  {
    id: 'AB-8840',
    photoUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=800&q=80',
    date: '23 Fev 2026, 11:10',
    lot: 'Confinamento 04',
    breed: 'Nelore Mix',
    score: 1.4,
    weight: 395.2,
    fatProgress: 5.1,
    verdict: 'NÃO APTO',
    aiConfidence: 94.7,
    notes: 'Paciente exibe quadro de magreza severa (Score corporal abaixo de 2.0). Risco de desnutrição crônica. Encaminhar para baia de engorda intensiva imediata.',
    landmarkPoints: [
      { x: 33, y: 49, label: 'Ombro Altamente Esquelético', type: 'skeleton' },
      { x: 49, y: 41, label: 'Vértebras Visíveis', type: 'skeleton' },
      { x: 58, y: 39, label: 'Ossos do Quadril Salientes', type: 'skeleton' },
      { x: 74, y: 44, label: 'Traseiro Profundo S/ Gordura', type: 'skeleton' },
      { x: 48, y: 58, label: 'Costelas Totalmente Expostas', type: 'skeleton' }
    ]
  }
];

export const MONTHLY_AVERAGES = [
  { month: 'JAN', bcs: 2.9 },
  { month: 'FEV', bcs: 3.1 },
  { month: 'MAR', bcs: 3.4 },
  { month: 'ABR', bcs: 3.8 },
  { month: 'MAI', bcs: 4.1 }
];

export const OTHER_SAMPLE_IMAGES = [
  {
    name: 'Nelore em Pasto Seco',
    url: 'https://images.unsplash.com/photo-1527153857715-3904f14ad496?auto=format&fit=crop&w=800&q=80',
    breed: 'Nelore Puro',
    defaultLot: 'Lote Norte - A'
  },
  {
    name: 'Garrote em Confinamento',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    breed: 'Cruzamento Industrial',
    defaultLot: 'Confinamento 04'
  },
  {
    name: 'Novilha Angus em Nutrição',
    url: 'https://images.unsplash.com/photo-1543163359-1e45b3000cc5?auto=format&fit=crop&w=800&q=80',
    breed: 'Angus Black',
    defaultLot: 'Setor Sul - B'
  }
];
