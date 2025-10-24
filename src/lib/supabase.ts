import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createSupabaseClient(supabaseUrl, publicAnonKey);

export const API_URL = `${supabaseUrl}/functions/v1/make-server-fe860986`;

// Helper to make authenticated requests
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token || publicAnonKey;

  const url = `${API_URL}${endpoint}`;
  console.log('🟢 fetchAPI: Fazendo requisição', { url, method: options.method || 'GET' });

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  console.log('🟢 fetchAPI: Resposta recebida', { status: response.status, statusText: response.statusText });
  return response;
}
