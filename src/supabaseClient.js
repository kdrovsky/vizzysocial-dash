// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = "https://xhegppvlqrotnpejsiyc.supabase.co";
// const supabaseAnonKey =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZWdwcHZscXJvdG5wZWpzaXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI3NjMzMzMsImV4cCI6MTk4ODMzOTMzM30.WsabppnozNrpKem6xBUd9eq8bkC5cRFcc-rDGtJH-W8";
// const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZWdwcHZscXJvdG5wZWpzaXljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3Mjc2MzMzMywiZXhwIjoxOTg4MzM5MzMzfQ.3c2HtQvnQ8F8m5viFZWFS04hYYDUog0Lvl10YIvdY6A';

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);


// // export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
// // export const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);









import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);