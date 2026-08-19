-- Interactive Learning Platform: shared learning engine baseline.
-- Curriculum data is versioned and layered, so Kenya, USA, and England can
-- coexist without duplicating learner, activity, assessment, or mastery logic.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'learner' check (role in ('learner','parent','teacher','admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_type text not null check (organization_type in ('school','provider','district')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.organization_memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner','admin','teacher','parent','learner')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (organization_id, profile_id)
);

create table public.curriculum_frameworks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  country_code char(2) not null,
  region text,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.curriculum_versions (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.curriculum_frameworks(id) on delete cascade,
  code text not null,
  name text not null,
  effective_from date,
  effective_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (framework_id, code)
);

create table public.education_levels (
  id uuid primary key default gen_random_uuid(),
  curriculum_version_id uuid not null references public.curriculum_versions(id) on delete cascade,
  code text not null,
  name text not null,
  sequence integer not null check (sequence >= 0),
  stage text,
  age_min smallint check (age_min >= 0),
  age_max smallint check (age_max >= age_min),
  unique (curriculum_version_id, code),
  unique (curriculum_version_id, sequence)
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  curriculum_version_id uuid not null references public.curriculum_versions(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  unique (curriculum_version_id, code)
);

create table public.curriculum_nodes (
  id uuid primary key default gen_random_uuid(),
  curriculum_version_id uuid not null references public.curriculum_versions(id) on delete cascade,
  education_level_id uuid references public.education_levels(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade,
  parent_id uuid references public.curriculum_nodes(id) on delete cascade,
  node_type text not null check (node_type in ('strand','sub_strand','topic','unit','standard')),
  code text not null,
  name text not null,
  description text,
  sequence integer not null default 0,
  unique (curriculum_version_id, code)
);

create table public.learning_outcomes (
  id uuid primary key default gen_random_uuid(),
  curriculum_node_id uuid not null references public.curriculum_nodes(id) on delete cascade,
  code text not null,
  statement text not null,
  inquiry_question text,
  assessment_guidance text,
  sequence integer not null default 0,
  unique (curriculum_node_id, code)
);

create table public.competencies (
  id uuid primary key default gen_random_uuid(),
  curriculum_version_id uuid not null references public.curriculum_versions(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  unique (curriculum_version_id, code)
);

create table public.learning_outcome_competencies (
  learning_outcome_id uuid not null references public.learning_outcomes(id) on delete cascade,
  competency_id uuid not null references public.competencies(id) on delete cascade,
  primary key (learning_outcome_id, competency_id)
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  curriculum_version_id uuid not null references public.curriculum_versions(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  unique (curriculum_version_id, code)
);

create table public.learning_outcome_skills (
  learning_outcome_id uuid not null references public.learning_outcomes(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  weight numeric(4,3) not null default 1 check (weight > 0 and weight <= 1),
  primary key (learning_outcome_id, skill_id)
);

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  curriculum_version_id uuid not null references public.curriculum_versions(id) on delete cascade,
  content_type text not null check (content_type in ('explanation','video','image','simulation','game','project','resource')),
  title text not null,
  body jsonb not null default '{}'::jsonb,
  locale text not null default 'en',
  context_region text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.learning_experiences (
  id uuid primary key default gen_random_uuid(),
  curriculum_version_id uuid not null references public.curriculum_versions(id) on delete cascade,
  education_level_id uuid references public.education_levels(id) on delete set null,
  subject_id uuid references public.subjects(id) on delete set null,
  mode text not null check (mode in ('learn','play','explore','solve','explain','challenge','practice','master','create')),
  title text not null,
  description text,
  activity_config jsonb not null default '{}'::jsonb,
  estimated_minutes smallint check (estimated_minutes > 0),
  difficulty smallint check (difficulty between 1 and 5),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.learning_experience_outcomes (
  learning_experience_id uuid not null references public.learning_experiences(id) on delete cascade,
  learning_outcome_id uuid not null references public.learning_outcomes(id) on delete cascade,
  primary key (learning_experience_id, learning_outcome_id)
);

create table public.assessment_items (
  id uuid primary key default gen_random_uuid(),
  curriculum_version_id uuid not null references public.curriculum_versions(id) on delete cascade,
  item_type text not null check (item_type in ('multiple_choice','multi_select','short_answer','numeric','ordering','matching','open_response','performance')),
  prompt jsonb not null,
  scoring_config jsonb not null default '{}'::jsonb,
  difficulty smallint check (difficulty between 1 and 5),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.assessment_item_skills (
  assessment_item_id uuid not null references public.assessment_items(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  weight numeric(4,3) not null default 1 check (weight > 0 and weight <= 1),
  primary key (assessment_item_id, skill_id)
);

create table public.learner_curriculum_enrollments (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles(id) on delete cascade,
  curriculum_version_id uuid not null references public.curriculum_versions(id) on delete restrict,
  education_level_id uuid references public.education_levels(id) on delete set null,
  is_primary boolean not null default true,
  started_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz,
  unique (learner_id, curriculum_version_id, education_level_id)
);
create unique index one_primary_curriculum_per_learner on public.learner_curriculum_enrollments (learner_id) where is_primary and ended_at is null;

create table public.learner_skill_mastery (
  learner_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  mastery_score numeric(5,4) not null default 0 check (mastery_score between 0 and 1),
  mastery_state text not null default 'not_attempted' check (mastery_state in ('not_attempted','needs_support','developing','mastered')),
  confidence numeric(5,4) not null default 0 check (confidence between 0 and 1),
  evidence_count integer not null default 0 check (evidence_count >= 0),
  last_evidenced_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (learner_id, skill_id)
);

create table public.learning_attempts (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles(id) on delete cascade,
  learning_experience_id uuid not null references public.learning_experiences(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress','completed','abandoned')),
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  duration_seconds integer check (duration_seconds >= 0),
  interaction_data jsonb not null default '{}'::jsonb
);

create table public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles(id) on delete cascade,
  assessment_item_id uuid not null references public.assessment_items(id) on delete cascade,
  learning_attempt_id uuid references public.learning_attempts(id) on delete set null,
  response jsonb not null default '{}'::jsonb,
  is_correct boolean,
  score numeric(5,4) check (score between 0 and 1),
  feedback jsonb not null default '{}'::jsonb,
  attempted_at timestamptz not null default timezone('utc', now())
);

create table public.learner_misconceptions (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  label text not null,
  evidence jsonb not null default '{}'::jsonb,
  severity smallint not null default 1 check (severity between 1 and 3),
  detected_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz
);

create table public.learning_recommendations (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles(id) on delete cascade,
  learning_experience_id uuid references public.learning_experiences(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete cascade,
  reason text not null,
  rank smallint not null default 1 check (rank > 0),
  status text not null default 'active' check (status in ('active','started','dismissed','completed')),
  generated_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz
);

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles(id) on delete cascade,
  curriculum_version_id uuid references public.curriculum_versions(id) on delete set null,
  learning_experience_id uuid references public.learning_experiences(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('learner','assistant','system')),
  content jsonb not null,
  learning_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.curriculum_equivalencies (
  id uuid primary key default gen_random_uuid(),
  source_learning_outcome_id uuid not null references public.learning_outcomes(id) on delete cascade,
  target_learning_outcome_id uuid not null references public.learning_outcomes(id) on delete cascade,
  relationship text not null check (relationship in ('equivalent','partial','prerequisite','extension')),
  confidence numeric(5,4) not null default 0.5 check (confidence between 0 and 1),
  notes text,
  unique (source_learning_outcome_id, target_learning_outcome_id)
);

create index curriculum_nodes_lookup_idx on public.curriculum_nodes (curriculum_version_id, education_level_id, subject_id, parent_id);
create index learning_outcomes_node_idx on public.learning_outcomes (curriculum_node_id);
create index experiences_catalog_idx on public.learning_experiences (curriculum_version_id, education_level_id, subject_id, status);
create index learner_attempts_lookup_idx on public.learning_attempts (learner_id, started_at desc);
create index assessment_attempts_lookup_idx on public.assessment_attempts (learner_id, attempted_at desc);
create index recommendations_lookup_idx on public.learning_recommendations (learner_id, status, rank);
create index ai_messages_conversation_idx on public.ai_messages (conversation_id, created_at);

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger frameworks_updated_at before update on public.curriculum_frameworks for each row execute function public.set_updated_at();
create trigger versions_updated_at before update on public.curriculum_versions for each row execute function public.set_updated_at();
create trigger content_items_updated_at before update on public.content_items for each row execute function public.set_updated_at();
create trigger experiences_updated_at before update on public.learning_experiences for each row execute function public.set_updated_at();
create trigger assessment_items_updated_at before update on public.assessment_items for each row execute function public.set_updated_at();
create trigger mastery_updated_at before update on public.learner_skill_mastery for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.learner_curriculum_enrollments enable row level security;
alter table public.learner_skill_mastery enable row level security;
alter table public.learning_attempts enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.learner_misconceptions enable row level security;
alter table public.learning_recommendations enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

create policy "users read their own profile" on public.profiles for select using (auth.uid() = id);
create policy "users update their own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "learners manage their enrollments" on public.learner_curriculum_enrollments for all using (auth.uid() = learner_id) with check (auth.uid() = learner_id);
create policy "learners read their mastery" on public.learner_skill_mastery for select using (auth.uid() = learner_id);
create policy "learners manage their attempts" on public.learning_attempts for all using (auth.uid() = learner_id) with check (auth.uid() = learner_id);
create policy "learners manage assessment attempts" on public.assessment_attempts for all using (auth.uid() = learner_id) with check (auth.uid() = learner_id);
create policy "learners read their misconceptions" on public.learner_misconceptions for select using (auth.uid() = learner_id);
create policy "learners manage recommendations" on public.learning_recommendations for all using (auth.uid() = learner_id) with check (auth.uid() = learner_id);
create policy "learners manage conversations" on public.ai_conversations for all using (auth.uid() = learner_id) with check (auth.uid() = learner_id);
create policy "learners access conversation messages" on public.ai_messages for all using (exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.learner_id = auth.uid())) with check (exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.learner_id = auth.uid()));

insert into public.curriculum_frameworks (code, name, country_code, region, description)
values ('KE-CBC', 'Kenya Competency Based Curriculum', 'KE', 'Kenya', 'Initial curriculum layer for the platform.')
on conflict (code) do nothing;
