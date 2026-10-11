-- =========================================================================
-- VyapaarSathi (व्यापार साथी) - Supabase Database Schema
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor)
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. User Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  preferred_language text default 'en',
  occupation text,
  skills text,
  monthly_income numeric default 0,
  available_capital numeric default 0,
  open_to_loan boolean default true,
  village text,
  block text,
  district text,
  state text,
  has_location_permission boolean default false,
  latitude double precision,
  longitude double precision,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. Saved Business Analyses Table
create table if not exists public.saved_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  business_id text not null,
  business_title text not null,
  category text,
  summary text,
  demand_level text,
  estimated_cost numeric,
  monthly_profit numeric,
  location_name text,
  data_confidence text,
  is_sample_data boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.saved_analyses enable row level security;

create policy "Users can view their own saved analyses"
  on public.saved_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved analyses"
  on public.saved_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own saved analyses"
  on public.saved_analyses for delete
  using (auth.uid() = user_id);

-- 3. Business Comparisons Table
create table if not exists public.business_comparisons (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  business_ids jsonb not null,
  comparison_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.business_comparisons enable row level security;

create policy "Users can view their own comparisons"
  on public.business_comparisons for select
  using (auth.uid() = user_id);

create policy "Users can insert their own comparisons"
  on public.business_comparisons for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own comparisons"
  on public.business_comparisons for delete
  using (auth.uid() = user_id);

-- 4. Financial Calculations Table
create table if not exists public.financial_calculations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  business_title text not null,
  startup_cost numeric not null,
  available_capital numeric not null,
  loan_amount numeric not null,
  interest_rate numeric not null,
  tenure_months integer not null,
  monthly_emi numeric not null,
  total_repayment numeric not null,
  cost_breakdown jsonb,
  feasibility_status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.financial_calculations enable row level security;

create policy "Users can view their own calculations"
  on public.financial_calculations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own calculations"
  on public.financial_calculations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own calculations"
  on public.financial_calculations for delete
  using (auth.uid() = user_id);

-- 5. Feasibility Reports Table
create table if not exists public.feasibility_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  business_title text not null,
  business_id text not null,
  location_summary text,
  report_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.feasibility_reports enable row level security;

create policy "Users can view their own reports"
  on public.feasibility_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reports"
  on public.feasibility_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own reports"
  on public.feasibility_reports for delete
  using (auth.uid() = user_id);

-- 6. Chat Messages Table
create table if not exists public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  role text not null,
  text text not null,
  timestamp text,
  source text default 'gemini-3.8-flash',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.chat_messages enable row level security;

create policy "Users can view their own chat messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert their own chat messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own chat messages"
  on public.chat_messages for delete
  using (auth.uid() = user_id);

