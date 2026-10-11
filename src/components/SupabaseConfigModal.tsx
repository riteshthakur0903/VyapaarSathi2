import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Key, 
  Terminal,
  Server
} from 'lucide-react';
import { isSupabaseConfigured, getSupabaseDetails } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const details = getSupabaseDetails();

  if (!isOpen) return null;

  const sqlSchemaSnippet = `-- Run this in your Supabase SQL Editor:
create extension if not exists "uuid-ossp";

-- 1. Profiles
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
  created_at timestamp with time zone default now()
);
alter table public.profiles enable row level security;
create policy "User owns profile" on public.profiles for all using (auth.uid() = id);

-- 2. Saved Business Analyses
create table if not exists public.saved_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  business_id text not null,
  business_title text not null,
  category text,
  estimated_cost numeric,
  created_at timestamp with time zone default now()
);
alter table public.saved_analyses enable row level security;
create policy "User owns analyses" on public.saved_analyses for all using (auth.uid() = user_id);

-- 3. Feasibility Reports
create table if not exists public.feasibility_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  business_title text not null,
  business_id text not null,
  report_data jsonb not null,
  created_at timestamp with time zone default now()
);
alter table public.feasibility_reports enable row level security;
create policy "User owns reports" on public.feasibility_reports for all using (auth.uid() = user_id);
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900 font-serif">
                Supabase Database & Auth Setup
              </h3>
              <p className="text-xs text-stone-500">
                Data layer configuration and Row Level Security guidelines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status pill */}
        <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
          details.isConfigured
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}>
          <Server className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">
              {details.isConfigured ? 'Status: Connected to Supabase Cloud' : 'Status: Local Offline Mode Active'}
            </span>
            <p className="text-[11px] leading-relaxed">
              {details.isConfigured
                ? `Active URL: ${details.url}. All user records, feasibility reports, and calculations sync directly with your database.`
                : 'The application operates with a high-fidelity local data store right now. To connect your Supabase project, provide the variables below in your environment.'}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3 text-xs text-stone-700">
          <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
            How to Connect Your Supabase Project (3 Easy Steps):
          </h4>
          <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
            <li>
              Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a>.
            </li>
            <li>
              Add the following variables to your environment (as specified in <code>.env.example</code>):
              <div className="p-2.5 bg-stone-900 text-emerald-300 font-mono text-[11px] rounded-xl my-1.5 overflow-x-auto">
                VITE_SUPABASE_URL="https://xyzcompany.supabase.co"<br />
                VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              </div>
            </li>
            <li>
              Open your Supabase Project &gt; <strong>SQL Editor</strong> and run the schema script below to set up tables and Row Level Security (RLS) policies.
            </li>
          </ol>
        </div>

        {/* SQL Schema snippet box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-700" />
              <span>SQL Schema & RLS Policies (or see /supabase-schema.sql)</span>
            </span>
            <button
              onClick={handleCopySql}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="p-4 bg-stone-900 text-stone-200 text-[11px] font-mono rounded-2xl max-h-48 overflow-y-auto leading-relaxed">
            {sqlSchemaSnippet}
          </pre>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-stone-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
