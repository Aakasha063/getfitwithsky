import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = fs.readFileSync(".env", "utf8");
let supabaseUrl = "";
let supabaseKey = "";
for (const line of env.split("\n")) {
  if (line.trim().startsWith("VITE_SUPABASE_URL=")) {
    supabaseUrl = line.split("=")[1].trim().replace(/^"|"$/g, "");
  }
  if (line.trim().startsWith("VITE_SUPABASE_PUBLISHABLE_KEY=")) {
    supabaseKey = line.split("=")[1].trim().replace(/^"|"$/g, "");
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data } = await supabase.from("workout_sessions").select("*");
  console.log("Sessions:", data?.length);
  for (const s of data || []) {
    console.log(`Session ${s.id}: day_id=${s.day_id}, date=${s.session_date}, status=${s.status}`);
  }
  
  const { data: days } = await supabase.from("workout_days").select("*");
  console.log("\nDays:", days?.length);
  for (const d of days || []) {
    console.log(`Day ${d.id}: name=${d.name}, is_optional=${d.is_optional}`);
  }
}

test().catch(console.error);
