import { useState, useCallback } from 'react';
import { sd_pb } from '../lib/sd_pocketbase';
import type { sd_Athlete } from '../types/sd_types';
import { z } from 'zod';

const sd_AthleteSchema = z.object({
  id: z.string(),
  coach_id: z.string(),
  name: z.string(),
  goal: z.string(),
  start_weight: z.number().optional(),
  target_weight: z.number().optional(),
  status: z.enum(['active', 'paused', 'archived', 'lead']).default('active'),
  is_coach_self: z.boolean().optional(),
  notes: z.string().optional(),
}).passthrough();

export const useSdAthletes = () => {
  const [sd_athletes, sd_setAthletes] = useState<sd_Athlete[]>([]);
  const [sd_isLoading, sd_setIsLoading] = useState(false);
  const [sd_error, sd_setError] = useState<string | null>(null);

  const sd_fetchAthletes = useCallback(async () => {
    sd_setIsLoading(true);
    sd_setError(null);
    try {
      const sd_res = await sd_pb.collection('athletes').getList(1, 100);

      const sd_validAthletes = sd_res.items.map(sd_item => {
        try {
          return sd_AthleteSchema.parse(sd_item) as unknown as sd_Athlete;
        } catch (sd_err) {
          console.error('[sd_useAthletes] Validation error for athlete:', sd_item.id, sd_err);
          // Return raw item if strictly needed, or filter it out. 
          // For now, we cast it back but log the error.
          return sd_item as unknown as sd_Athlete;
        }
      });

      sd_setAthletes(sd_validAthletes);
    } catch (sd_err: unknown) {
      const sd_message = sd_err instanceof Error ? sd_err.message : 'Ошибка загрузки атлетов';
      sd_setError(sd_message);
      console.error('[sd_useAthletes] Fetch error details:', sd_err);
    } finally {
      sd_setIsLoading(false);
    }
  }, []);

  return {
    sd_athletes,
    sd_isLoading,
    sd_error,
    sd_fetchAthletes
  };
};
