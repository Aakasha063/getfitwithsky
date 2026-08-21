-- Fields collected by the onboarding flow that didn't have a home yet.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sex TEXT CHECK (sex IN ('male', 'female')),
  ADD COLUMN IF NOT EXISTS activity_level NUMERIC;

-- The onboarding gate (added in the app at the same time as this migration) is keyed off
-- onboarding_completed, which every pre-existing profile already has defaulted to false.
-- Without this backfill, every current user would be dropped into onboarding on their next
-- login. Only accounts created from this point forward should actually see it.
UPDATE public.profiles SET onboarding_completed = true WHERE onboarding_completed = false;
