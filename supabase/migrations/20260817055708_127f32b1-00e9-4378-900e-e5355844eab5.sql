-- Internal trigger-only function: no app role should be able to call it directly
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Leaderboard: aggregate, non-sensitive stats. Signed-in users only.
REVOKE ALL ON FUNCTION public.get_leaderboard(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(integer) TO authenticated;