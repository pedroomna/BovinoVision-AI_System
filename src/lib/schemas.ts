/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

export const CattleRecordSchema = z.object({
  id: z.string().min(1, "O ID é obrigatório"),
  photoUrl: z.string().optional().default(''),
  date: z.string().optional().default(''),
  lot: z.string().optional().default(''),
  breed: z.string().optional().default(''),
  score: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number({
      required_error: "O campo 'score' (ECC) é obrigatório",
      invalid_type_error: "O campo 'score' (ECC) deve ser um número válido"
    })
    .min(1.0, "O escore ECC mínimo permitido é 1.0")
    .max(5.0, "O escore ECC máximo permitido é 5.0")
  ),
  weight: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number({
      required_error: "O campo 'weight' (Peso) é obrigatório",
      invalid_type_error: "O campo 'weight' (Peso) deve ser um número válido"
    })
    .positive("O campo 'weight' (Peso) deve receber um valor positivo e maior que zero")
  ),
  fatProgress: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? 0 : Number(val)),
    z.number().optional().default(0)
  ),
  verdict: z.enum(['APTO PARA ABATE', 'NÃO APTO']),
  landmarkPoints: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
      label: z.string(),
      type: z.enum(['muscle', 'fat', 'skeleton'])
    })
  ).optional(),
  aiConfidence: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  notes: z.string().optional().default(''),
  userId: z.string().optional(),
  isOfflinePending: z.boolean().optional(),
  offlineStoredImage: z.string().optional()
});

/**
 * Validates a cattle record payload fully before database persistence.
 * Throws clean, localized error messages for invalid weight or score entries.
 */
export function validateCattleRecord(data: unknown) {
  try {
    return CattleRecordSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => `${err.path.join('.') || 'campo'}: ${err.message}`).join('\n');
      console.error("[Schema Validation Error] Invalid registry input:", messages);
      throw new Error(`Falha de Validação do Registro:\n${messages}`);
    }
    throw error;
  }
}
