-- Migration: Crear tabla de mensajes para chat en tiempo real
create table if not exists public.mensajes (
  id uuid default gen_random_uuid() primary key,
  sender_name text not null,
  sender_avatar text,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar réplica en tiempo real para mensajes
alter publication supabase_realtime add table public.mensajes;
