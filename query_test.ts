import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYXV5ZXd0Y2VjY3hybmNtcWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMyNjU1MjIsImV4cCI6MjAzODg0MTUyMn0..."; // I will just use the project env file
