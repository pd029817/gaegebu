import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('date', { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request) {
  const supabase = getSupabase();
  const body = await request.json();
  const { data, error } = await supabase.from('entries').insert(body).select();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data[0]);
}

export async function DELETE(request) {
  const supabase = getSupabase();
  const { id } = await request.json();
  const { error } = await supabase.from('entries').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
