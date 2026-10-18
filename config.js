// ÚNICO lugar para editar nomes de turmas e identidade do site.
// Regra: o "id" nunca muda depois que houver respostas; só o "name" pode ser alterado.
const CONFIG = {
  siteName: "Viva+",
  universityName: "NOME DA UNIVERSIDADE",
  minGroupSize: 10, // mínimo de respostas válidas para exibir um indicador
  classes: [
    { id: "turma_1", name: "NOME DA TURMA 1" },
    { id: "turma_2", name: "NOME DA TURMA 2" },
    { id: "turma_3", name: "NOME DA TURMA 3" },
    { id: "turma_4", name: "NOME DA TURMA 4" },
    { id: "turma_5", name: "NOME DA TURMA 5" },
    { id: "turma_6", name: "NOME DA TURMA 6" },
    { id: "turma_7", name: "NOME DA TURMA 7" }
  ],
  minAge: 18, // idade mínima aceita no questionário
  maxAge: 25, // idade máxima aceita no questionário
  ageGroups: [
    { id: "18_21", label: "18 a 21 anos", min: 18, max: 21 },
    { id: "22_25", label: "22 a 25 anos", min: 22, max: 25 }
  ]
};
