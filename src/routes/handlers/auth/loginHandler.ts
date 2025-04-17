// src/routes/handlers/auth/loginHandler.tsx
import { supabase } from '@/lib/supabase';

export async function loginUser(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session?.access_token) {
        return { error: 'Invalid email or password', token: null };
    }

    return { token: data.session.access_token, error: null };
}
