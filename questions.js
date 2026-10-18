// Perguntas do questionário. Para mudar um texto ou uma opção, edite aqui.
const Q_NIVEL = [["1","1 – Muito baixo"],["2","2 – Baixo"],["3","3 – Médio"],["4","4 – Alto"],["5","5 – Muito alto"]];
const Q_QUAL = [["1","1 – Muito ruim"],["2","2 – Ruim"],["3","3 – Regular"],["4","4 – Boa"],["5","5 – Muito boa"]];
const Q_APOIO = [["1","1 – Nenhum"],["2","2 – Pouco"],["3","3 – Algum"],["4","4 – Bastante"],["5","5 – Muito"]];
const SIM_NAO = [["sim","Sim"],["nao","Não"]];

const STEPS = [
  { id: "A", title: "Sua turma",
    why: "Usamos a turma só para montar os gráficos coletivos. Não pedimos nome, CPF, matrícula nem e-mail. Seu relatório fica guardado neste navegador.",
    fields: [
      { id: "turma", label: "Qual é a sua turma?", type: "select", required: true, options: () => CONFIG.classes.map(c => [c.id, c.name]) },
      { id: "consent", type: "checkbox", required: true, label: "Li e concordo em participar. Entendo que os resultados são educativos, que só indicadores de grupo serão exibidos e que posso apagar meus dados." }
    ] },
  { id: "B", title: "Dados básicos",
    why: "Idade, sexo, peso e altura servem para calcular seu IMC e para os gráficos de grupo. Sexo aqui significa sexo informado, não identidade de gênero.",
    fields: [
      { id: "idade", label: "Qual é a sua idade, em anos?", type: "number", required: true, integer: true, min: () => CONFIG.minAge, max: () => CONFIG.maxAge },
      { id: "sexo", label: "Qual é o seu sexo?", type: "select", required: true, options: [["feminino","Feminino"],["masculino","Masculino"],["nao_informar","Prefiro não informar"]] },
      { id: "peso", label: "Qual é o seu peso, em quilogramas?", type: "number", required: true, min: 30, max: 300, step: "0.1" },
      { id: "altura", label: "Qual é a sua altura, em centímetros?", type: "number", required: true, integer: true, min: 120, max: 230 }
    ] },
  { id: "C", title: "Atividade física",
    why: "Comparamos suas respostas com as recomendações da OMS para adultos: 150 a 300 minutos de atividade aeróbica moderada por semana (ou o equivalente em vigorosa) e fortalecimento muscular em pelo menos 2 dias.",
    fields: [
      { id: "pratica", label: "Você pratica atividades físicas regularmente?", type: "select", required: true, options: SIM_NAO },
      { id: "dias", label: "Quantos dias por semana?", type: "number", required: true, integer: true, min: 1, max: 7, showIf: d => d.pratica === "sim" },
      { id: "minutos", label: "Quantos minutos por dia, em média?", type: "number", required: true, integer: true, min: 5, max: 300, showIf: d => d.pratica === "sim" },
      { id: "intensidade", label: "Em geral, a intensidade é:", type: "select", required: true, showIf: d => d.pratica === "sim", options: [["moderada","Moderada (dá para conversar)"],["vigorosa","Vigorosa (fala com dificuldade)"]] },
      { id: "forca", label: "Em quantos dias por semana você faz fortalecimento muscular?", type: "number", required: true, integer: true, min: 0, max: 7 },
      { id: "dicasAtiv", label: "Você gostaria de receber sugestões para sua rotina?", type: "select", required: true, options: SIM_NAO }
    ] },
  { id: "D", title: "Hidratação",
    why: "Não existe um valor obrigatório para todos: a necessidade muda com atividade, calor, alimentação e condições individuais. Mostramos só uma referência geral.",
    fields: [
      { id: "agua", label: "Quantos mL de água pura você costuma beber por dia? (1 litro = 1000 mL)", type: "number", required: true, integer: true, min: 0, max: 10000 },
      { id: "aguaAtiv", label: "Você bebe água durante e depois das atividades físicas?", type: "select", required: true, options: [["sim","Sim"],["as_vezes","Às vezes"],["nao","Não"],["nao_pratico","Não pratico atividades"]] },
      { id: "dicasAgua", label: "Gostaria de receber sugestões para melhorar sua hidratação?", type: "select", required: true, options: SIM_NAO }
    ] },
  { id: "E", title: "Bem-estar", optional: true,
    why: "Esta etapa é opcional e você pode pular. Suas respostas não geram diagnóstico e nunca aparecem individualmente nos gráficos.",
    fields: [
      { id: "sono", label: "Como você avalia a qualidade do seu sono?", type: "select", options: Q_QUAL },
      { id: "estresse", label: "Como está o seu nível de estresse nas últimas semanas?", type: "select", options: Q_NIVEL },
      { id: "disposicao", label: "Como está a sua disposição para as atividades diárias?", type: "select", options: Q_NIVEL },
      { id: "bemestar", label: "Como você avalia o seu bem-estar geral?", type: "select", options: Q_QUAL },
      { id: "apoio", label: "Quanto apoio social você sente que tem (amigos, família, colegas)?", type: "select", options: Q_APOIO },
      { id: "dicasMental", label: "Gostaria de receber orientações de autocuidado?", type: "select", options: SIM_NAO }
    ] }
];
