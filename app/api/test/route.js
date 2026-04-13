import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return Response.json({ error: '환경변수 없음', url: !!url, key: !!key });
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase.from('entries').select('count').limit(1);

  return Response.json({ url, keyExists: !!key, data, error });
}
