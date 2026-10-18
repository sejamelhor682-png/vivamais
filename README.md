# Viva+ — configuração do Supabase (Etapa 3)

1. Crie uma conta gratuita em supabase.com e clique em **New project** (guarde a senha do banco; o nome da região pode ser a mais próxima, ex.: São Paulo).
2. No menu lateral, abra **SQL Editor** > **New query**. Abra `schema.sql`, copie TUDO, cole e clique em **Run**. Deve aparecer "Success".
3. Abra **Project Settings** > **API** (o nome do menu pode variar). Copie a **Project URL** e a chave **anon / publishable**.
4. No `config.js`, troque `COLE_AQUI_A_PROJECT_URL` e `COLE_AQUI_A_CHAVE_PUBLICA` por esses dois valores. NUNCA use a chave `service_role`.
5. Para adicionar uma turma nova: inclua em `config.js` e rode no SQL Editor: `insert into public.turmas (id) values ('turma_8');`. Renomear só exige mudar o `name` no `config.js`.
6. Teste de segurança (SQL Editor): `set role anon; select * from public.respostas;` deve dar **permission denied**.
7. Retenção: decida com a universidade por quanto tempo guardar os dados; para apagar tudo: `delete from public.respostas;`.
