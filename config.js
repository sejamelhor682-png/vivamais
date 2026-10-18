// Viva+ — configuração da pesquisa escolar.
// IMPORTANTE: mantenha os IDs abaixo estáveis se já houver respostas no Supabase.
const CONFIG = {
  siteName: "Viva+",
  universityName: "pesquisa escolar",
  // Use somente a URL e a chave pública anon/publishable do Supabase.
  // Nunca coloque service_role neste arquivo.
  supabaseUrl: "https://okmvktsnmupxibuwuwbv.supabase.co",
  supabaseAnonKey: "sb_publishable_LZBHYVX5VQts6wKCPpNBgw_9Qe_BS6p",
  minGroupSize: 10, // ocultar resultados de grupos com menos de 10 respostas
  classes: [
    { id: "turma_1", name: "1mcn" },
    { id: "turma_2", name: "1Lch" },
    { id: "turma_3", name: "1rch" },
    { id: "turma_4", name: "2mcn" },
    { id: "turma_5", name: "2lch" },
    { id: "turma_6", name: "3mod" },
    { id: "turma_7", name: "3nar" }
  ],
  minAge: 14,
  maxAge: 18,
  // Não há filtro por faixa etária: o painel mostra médias separadas por idade.
  ageGroups: []
};
