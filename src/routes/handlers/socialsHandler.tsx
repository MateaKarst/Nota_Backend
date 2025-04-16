// src/lib/handlers/socialsHandler.ts
import { supabase } from "@/lib/supabase";

export async function getAllSocials() {
    const { data, error } = await supabase.from('socials').select('*');
    if (error) throw new Error('Error fetching socials');
    return data;
}

export async function getSocialById(id: string | number) {
    const { data, error } = await supabase.from('socials').select('*').eq('id', id).single();
    if (error) throw new Error('Error fetching social');
    return data;
}
