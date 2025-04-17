// src/routes/handlers/acesHandler.tsx
import { supabase } from "@/lib/supabase";

export async function getAllAces() {
    const { data, error } = await supabase.from('aces').select('*');
    console.log("acesHandler", data)
    if (error) throw new Error('Error fetching aces');
    return data;
}