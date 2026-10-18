// ÚNICO lugar para editar nomes de turmas e identidade do site.
// Regra: o "id" nunca muda depois que houver respostas; só o "name" pode ser alterado.
const CONFIG = {
  siteName: "Viva+",
  universityName: "Geraldo Vargas Nogueira",
  supabaseUrl: "https://okmvktsnmupxibuwuwbv.supabase.co",   // Supabase > Project Settings > API
  supabaseKey: "https://okmvktsnmupxibuwuwbv.supabase.co",  // anon/publishable. NUNCA use a service_role
  // Cole aqui os dados do seu projeto Supabase (Project URL e chave pública "anon"/"publishable").
  // NUNCA cole a chave "service_role" aqui.
  supabaseUrl: "COLE_AQUI_A_PROJECT_URL",
  supabaseAnonKey: "COLE_AQUI_A_CHAVE_PUBLICA",
  minGroupSize: 10, // mínimo de respostas válidas para exibir um indicador
  classes: [
    { id: "turma_1", name: "1°-MCN" },
    { id: "turma_2", name: "1°-LCH" },
    { id: "turma_3", name: "1°-RCH" },
    { id: "turma_4", name: "2°-MCN" },
    { id: "turma_5", name: "2°-LCH" },
    { id: "turma_6", name: "3°-MOD" },
    { id: "turma_7", name: "3°-NAR" }
  ],
  minAge: 14, // idade mínima aceita no questionário
  maxAge: 18, // idade máxima aceita no questionário
  ageGroups: [
    { id: "14_18", label: "14 a 18 anos", min: 14, max: 18 }
