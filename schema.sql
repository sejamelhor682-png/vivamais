-- Viva+ | schema.sql | Cole TUDO no SQL Editor do Supabase e clique em Run.
-- Segurança: as tabelas ficam FECHADAS para o público (RLS + sem permissões).
-- O site só fala com o banco por 4 funções (RPC) que validam e agregam os dados.

-- 1) Turmas (só os ids; os nomes exibidos ficam em config.js)
create table if not exists public.turmas (
  id text primary key check (id ~ '^[a-z0-9_]{1,40}$')
);
insert into public.turmas (id) values
  ('turma_1'),('turma_2'),('turma_3'),('turma_4'),('turma_5'),('turma_6'),('turma_7')
on conflict do nothing;

-- 2) Respostas. Não há nome, e-mail, CPF nem matrícula.
-- token_hash = hash do código aleatório do navegador (o código em si não é guardado).
create table if not exists public.respostas (
  id bigint generated always as identity primary key,
  token_hash text not null unique,                       -- impede envio duplicado
  turma_id text not null references public.turmas(id),
  criado_em timestamptz not null default now(),
  idade smallint not null check (idade between 18 and 25), -- se mudar minAge/maxAge no config.js, mude aqui
  sexo text not null check (sexo in ('feminino','masculino','nao_informar')),
  peso numeric(4,1) not null check (peso between 30 and 300),
  altura smallint not null check (altura between 120 and 230),
  pratica boolean not null,
  dias smallint check (dias between 1 and 7),
  minutos smallint check (minutos between 5 and 300),
  intensidade text check (intensidade in ('moderada','vigorosa')),
  forca smallint not null check (forca between 0 and 7),
  dicas_ativ boolean not null,
  agua integer not null check (agua between 0 and 10000),
  agua_ativ text not null check (agua_ativ in ('sim','as_vezes','nao','nao_pratico')),
  dicas_agua boolean not null,
  sono smallint check (sono between 1 and 5),
  estresse smallint check (estresse between 1 and 5),
  disposicao smallint check (disposicao between 1 and 5),
  bemestar smallint check (bemestar between 1 and 5),
  apoio smallint check (apoio between 1 and 5),
  dicas_mental boolean,
  consentimento boolean not null check (consentimento),
  check (not pratica or (dias is not null and minutos is not null and intensidade is not null))
);
create index if not exists respostas_turma_idx on public.respostas (turma_id);
create index if not exists respostas_idade_idx on public.respostas (idade);
create index if not exists respostas_criado_idx on public.respostas (criado_em);

-- 3) Fechar as tabelas para o público
alter table public.turmas enable row level security;
alter table public.respostas enable row level security;
alter table public.respostas force row level security;
revoke all on public.turmas, public.respostas from public, anon, authenticated;

-- 4) Enviar resposta (valida e grava; devolve 'ok', 'duplicado' ou 'invalido')
create or replace function public.enviar_resposta(p_token uuid, p_dados jsonb)
returns text language plpgsql security definer set search_path = public as $$
declare h text;
begin
  if p_token is null or p_dados is null or length(p_dados::text) > 4000 then return 'invalido'; end if;
  if coalesce((p_dados->>'consent')::boolean, false) is not true then return 'invalido'; end if;
  h := encode(sha256(convert_to(p_token::text, 'UTF8')), 'hex');
  insert into respostas (token_hash, turma_id, idade, sexo, peso, altura, pratica, dias, minutos, intensidade,
    forca, dicas_ativ, agua, agua_ativ, dicas_agua, sono, estresse, disposicao, bemestar, apoio, dicas_mental, consentimento)
  values (h, p_dados->>'turma', (p_dados->>'idade')::smallint, p_dados->>'sexo', (p_dados->>'peso')::numeric,
    (p_dados->>'altura')::smallint, (p_dados->>'pratica') = 'sim', (p_dados->>'dias')::smallint,
    (p_dados->>'minutos')::smallint, p_dados->>'intensidade', (p_dados->>'forca')::smallint,
    (p_dados->>'dicasAtiv') = 'sim', (p_dados->>'agua')::integer, p_dados->>'aguaAtiv', (p_dados->>'dicasAgua') = 'sim',
    (p_dados->>'sono')::smallint, (p_dados->>'estresse')::smallint, (p_dados->>'disposicao')::smallint,
    (p_dados->>'bemestar')::smallint, (p_dados->>'apoio')::smallint,
    case p_dados->>'dicasMental' when 'sim' then true when 'nao' then false end, true);
  return 'ok';
exception
  when unique_violation then return 'duplicado';
  when others then return 'invalido';
end $$;

-- 5) Recuperar o PRÓPRIO relatório (só quem tem o código aleatório do navegador)
create or replace function public.obter_minha_resposta(p_token uuid)
returns jsonb language sql security definer set search_path = public stable as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'turma', turma_id, 'idade', idade, 'sexo', sexo, 'peso', peso, 'altura', altura,
    'pratica', case when pratica then 'sim' else 'nao' end, 'dias', dias, 'minutos', minutos,
    'intensidade', intensidade, 'forca', forca, 'dicasAtiv', case when dicas_ativ then 'sim' else 'nao' end,
    'agua', agua, 'aguaAtiv', agua_ativ, 'dicasAgua', case when dicas_agua then 'sim' else 'nao' end,
    'sono', sono, 'estresse', estresse, 'disposicao', disposicao, 'bemestar', bemestar, 'apoio', apoio,
    'dicasMental', case dicas_mental when true then 'sim' when false then 'nao' end,
    'date', criado_em))
  from respostas
  where token_hash = encode(sha256(convert_to(p_token::text, 'UTF8')), 'hex');
$$;

-- 6) Apagar a PRÓPRIA resposta
create or replace function public.apagar_minha_resposta(p_token uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from respostas where token_hash = encode(sha256(convert_to(p_token::text, 'UTF8')), 'hex');
  return found;
end $$;

-- 7) Indicadores agregados (nunca linhas individuais). Menos de 10 respostas => oculto.
create or replace function public.indicadores(
  p_turma text default null, p_idade_min int default null, p_idade_max int default null, p_sexo text default null)
returns jsonb language plpgsql security definer set search_path = public stable as $$
declare res jsonb; n int;
begin
  if p_sexo = 'nao_informar' then return jsonb_build_object('suficiente', false); end if;
  with f as (
    select *, peso / power(altura / 100.0, 2) as imc,
      case when pratica then dias * minutos * (case when intensidade = 'vigorosa' then 2 else 1 end) else 0 end as eq
    from respostas
    where (p_turma is null or turma_id = p_turma)
      and (p_idade_min is null or idade >= p_idade_min) and (p_idade_max is null or idade <= p_idade_max)
      and (p_sexo is null or sexo = p_sexo))
  select jsonb_build_object(
    'n', count(*),
    'imc', jsonb_build_object(
      'baixo', count(*) filter (where imc < 18.5),
      'adequado', count(*) filter (where imc >= 18.5 and imc < 25),
      'sobrepeso', count(*) filter (where imc >= 25 and imc < 30),
      'obesidade', count(*) filter (where imc >= 30)),
    'atividade', jsonb_build_object(
      'regular', count(*) filter (where pratica),
      'atende', count(*) filter (where eq >= 150 and forca >= 2),
      'parcial', count(*) filter (where (eq >= 150) <> (forca >= 2)),
      'abaixo', count(*) filter (where eq < 150 and forca < 2),
      'min_0', count(*) filter (where eq = 0),
      'min_1_149', count(*) filter (where eq between 1 and 149),
      'min_150_300', count(*) filter (where eq between 150 and 300),
      'min_300_mais', count(*) filter (where eq > 300)),
    'agua', jsonb_build_object(
      'abaixo', count(*) filter (where agua < 1500),
      'dentro', count(*) filter (where agua between 1500 and 2500),
      'acima', count(*) filter (where agua > 2500)),
    'mental', case when count(sono) >= 10 then jsonb_build_object(
      'n', count(sono), 'sono', round(avg(sono), 1), 'estresse', round(avg(estresse), 1),
      'disposicao', round(avg(disposicao), 1), 'bemestar', round(avg(bemestar), 1)) end)
  into res from f;
  n := (res->>'n')::int;
  if n < 10 then return jsonb_build_object('suficiente', false); end if;
  return res || jsonb_build_object('suficiente', true);
end $$;

-- 8) Permissões: o público só pode chamar estas 4 funções
revoke all on function public.enviar_resposta(uuid, jsonb), public.obter_minha_resposta(uuid),
  public.apagar_minha_resposta(uuid), public.indicadores(text, int, int, text) from public;
grant execute on function public.enviar_resposta(uuid, jsonb), public.obter_minha_resposta(uuid),
  public.apagar_minha_resposta(uuid), public.indicadores(text, int, int, text) to anon, authenticated;
