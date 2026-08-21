-- Neck/hip are needed to recompute a U.S. Navy body-fat estimate, but were only ever
-- used transiently (onboarding, the Body page calculator) and discarded. Persist them
-- so a returning user's calculator can be pre-filled from their last measurement.
ALTER TABLE public.body_metrics
  ADD COLUMN IF NOT EXISTS neck_cm NUMERIC,
  ADD COLUMN IF NOT EXISTS hip_cm NUMERIC;
