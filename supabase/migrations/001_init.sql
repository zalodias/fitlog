-- Exercises library
create table exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area text not null check (area in ('full', 'lower', 'upper')),
  type text not null check (type in ('strength', 'skill', 'conditioning')),
  custom boolean not null default false,
  created_at timestamptz not null default now()
);

-- Sessions (a training day)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  type text not null check (type in ('strength', 'workout', 'mixed')),
  created_at timestamptz not null default now()
);

-- Strength blocks within a session
create table strength_blocks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  position integer not null default 0
);

-- Individual sets within a strength block
create table sets (
  id uuid primary key default gen_random_uuid(),
  strength_block_id uuid not null references strength_blocks(id) on delete cascade,
  number integer not null,
  reps integer,
  weight numeric(6,2),
  duration integer,  -- seconds
  effort integer check (effort between 1 and 10)
);

-- Workout blocks (WODs) within a session
create table workouts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  format text not null check (format in ('amrap', 'for_time', 'emom')),
  cap integer,            -- time cap in minutes
  result text check (result in ('time', 'rounds_reps', 'score')),
  seconds integer,        -- result as total seconds (for_time)
  rounds integer,         -- rounds completed (amrap/rounds_reps)
  reps integer,           -- extra reps on top of full rounds
  position integer not null default 0
);

-- Exercises within a workout block
create table workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  reps integer,
  weight numeric(6,2),
  distance integer,       -- meters
  position integer not null default 0
);

-- Indexes for common queries
create index on sessions(date);
create index on strength_blocks(session_id);
create index on sets(strength_block_id);
create index on workouts(session_id);
create index on workout_exercises(workout_id);

-- ============================================================
-- Seed: pre-built CrossFit exercise library
-- ============================================================

insert into exercises (name, area, type, custom) values
  ('Back Squat',         'lower', 'strength',     false),
  ('Front Squat',        'lower', 'strength',     false),
  ('Deadlift',           'full',  'strength',     false),
  ('Clean',              'full',  'strength',     false),
  ('Snatch',             'full',  'strength',     false),
  ('Thruster',           'full',  'strength',     false),
  ('Press',              'upper', 'strength',     false),
  ('Push Press',         'upper', 'strength',     false),
  ('Bench Press',        'upper', 'strength',     false),
  ('Pull-up',            'upper', 'skill',        false),
  ('Muscle-up',          'upper', 'skill',        false),
  ('Handstand Push-up',  'upper', 'skill',        false),
  ('Toes-to-Bar',        'full',  'skill',        false),
  ('Box Jump',           'lower', 'skill',        false),
  ('KB Swing',           'full',  'conditioning', false),
  ('KB Clean',           'full',  'strength',     false),
  ('KB Snatch',          'full',  'strength',     false),
  ('Row',                'full',  'conditioning', false),
  ('Bike',               'lower', 'conditioning', false),
  ('Run',                'full',  'conditioning', false),
  ('Double-Unders',      'full',  'conditioning', false),
  ('Burpee',             'full',  'conditioning', false);
