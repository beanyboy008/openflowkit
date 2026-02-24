import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase env vars — cloud persistence disabled');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

export async function uploadAttachment(
    file: File,
    userId: string
): Promise<{ url: string; name: string } | null> {
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
        .from('attachments')
        .upload(path, file, { contentType: file.type });

    if (error) {
        console.error('Attachment upload failed:', error.message);
        return null;
    }

    const { data } = supabase.storage.from('attachments').getPublicUrl(path);
    return { url: data.publicUrl, name: file.name };
}
