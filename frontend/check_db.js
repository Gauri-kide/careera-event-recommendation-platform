import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zudjkhtjuqjxpspjurao.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZGpraHRqdXFqeHBzcGp1cmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MTY4MzIsImV4cCI6MjA5NDA5MjgzMn0.eSiWuSyQechXvEpXrs2JFd1HSJtcvkF7IomfUy8V61o";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'test_insert2@careera.com',
        password: 'Careera$StrongPass!2026',
        options: { data: { role: 'organizer', full_name: 'Test' } }
    });
    
    console.log("Signup error:", authError?.message);
    
    if (authError && authError.message.includes('already registered')) {
        const { error } = await supabase.auth.signInWithPassword({
            email: 'test_insert2@careera.com',
            password: 'Careera$StrongPass!2026'
        });
        console.log("Signin error:", error?.message);
    }
}

check();
