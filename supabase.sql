-- Viva+ | Supabase: SQL Editor > New query > cole tudo > Run
-- ATENCAO: a linha abaixo apaga a tabela antiga (use só se ainda não tem dados importantes)
drop table if exists respostas;

create table respostas (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  device_id uuid not null unique,           -- 1 resposta por aparelho (anônimo)
  turma text not null check (char_length(turma) <= 30),
  idade int not null check (idade between 10 and 25),
  sexo text check (sexo in ('Masculino','Feminino')),
  imc numeric(4,1) check (imc between 10 and 60),
  imc_cat text check (imc_cat in ('Abaixo do peso','Peso adequado','Sobrepeso','Obesidade')),
  saude_fisica int check (saude_fisica between 1 and 5),
  humor int check (humor between 1 and 5),
  estresse int check (estresse between 1 and 5),
  sono text, atividade int check (atividade between 0 and 7),
  agua text, frutas int check (frutas between 0 and 7),
  telas text, cigarro text, maconha text, alcool text,
  habitos text[],
  pct_saudavel int check (pct_saudavel between 0 and 100)
);

alter table respostas enable row level security;
create policy "enviar resposta" on respostas for insert to anon with check (true);
create policy "ler respostas"   on respostas for select to anon using (true);
-- Sem update/delete: ninguém altera ou apaga pelo site.
