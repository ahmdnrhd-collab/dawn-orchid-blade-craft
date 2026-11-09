create table if not exists board_meta (
  id smallint primary key default 1,
  title text not null,
  subtitle text not null,
  tagline text not null,
  event_note text not null default '',
  logo1 text not null default '',
  logo2 text not null default '',
  logo3 text not null default '',
  background text not null default '',
  color_navy text not null default '#0c1b33',
  color_gold text not null default '#e3b341',
  color_accent text not null default '#e23d3d',
  color_paper text not null default '#f6f3ec',
  pin text not null default 'benjeng2026',
  seeded boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint board_meta_singleton check (id = 1)
);

insert into board_meta (id, title, subtitle, tagline, event_note)
values (
  1,
  'LIVE MEDAL STANDING',
  'POR (PEKAN OLAHRAGA) SD KECAMATAN BENJENG 2026',
  'SPORTIVITAS • SOLIDARITAS • PRESTASI',
  'Kecamatan Benjeng · Kabupaten Gresik'
)
on conflict (id) do nothing;

create table if not exists contingents (
  id text primary key,
  name text not null,
  logo text not null default '',
  gold integer not null default 0,
  silver integer not null default 0,
  bronze integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint contingents_gold_range check (gold >= 0 and gold <= 999),
  constraint contingents_silver_range check (silver >= 0 and silver <= 999),
  constraint contingents_bronze_range check (bronze >= 0 and bronze <= 999)
);
