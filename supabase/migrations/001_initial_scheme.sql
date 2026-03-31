create table tender_sessions (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    rfp_filename text,
    status text default 'created',
    created_at timestamptz default now()
);
create table requirements (
    id uuid primary key default gen_random_uuid(),
    session_id uuid references tender_sessions(id) on delete cascade,
    req_id text not null,
    category text,
    requirement_text text,
    source_page int,
    confirmed boolean default true,
    created_at timestamptz default now()
);
create table vendor_results (
    id uuid primary key default gen_random_uuid(),
    session_id uuid references tender_sessions(id) on delete cascade,
    vendor_name text not null,
    compliance_score numeric,
    status text,
    results jsonb,
    created_at timestamptz default now()
);
create table risk_reports (
    id uuid primary key default gen_random_uuid(),
    session_id uuid references tender_sessions(id) on delete cascade,
    vendor_name text not null,
    tone_score int,
    tone_summary text,
    overall_risk text,
    total_flags int,
    flags jsonb,
    created_at timestamptz default now()
);