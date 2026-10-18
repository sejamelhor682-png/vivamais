// Etapa 1: página inicial. O questionário (etapa 2) e os dados reais (etapas 3-4) virão depois.
const $ = id => document.getElementById(id);
const DONE_KEY = "vivamais_concluido"; // marca local de "já respondi" (a ligação com o Supabase vem na etapa 3)

const CHARTS = [
  { title: "Distribuição do IMC", sensitive: false },
  { title: "Atividade física", sensitive: false },
  { title: "Hidratação", sensitive: false },
  { title: "Bem-estar mental", sensitive: true },
  { title: "Comparação por sexo informado", sensitive: true },
  { title: "Comparação por faixa etária", sensitive: false },
  { title: "Comparação por turma", sensitive: false },
  { title: "Evolução ao longo do tempo", sensitive: false }
];
const SUMMARY = ["Respostas válidas", "Praticam atividade física", "Atendem à OMS", "Bem-estar médio"];

function init() {
  document.title = CONFIG.siteName;
  $("siteName").textContent = CONFIG.siteName.replace("+", "");
  $("uniName").textContent = CONFIG.universityName;
  $("minN").textContent = CONFIG.minGroupSize;

  const cs = $("classSelect");
  cs.innerHTML = '<option value="">Todas as turmas</option>' +
    CONFIG.classes.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  $("ageSelect").innerHTML = '<option value="">Todas as faixas</option>' +
    CONFIG.ageGroups.map(a => `<option value="${a.id}">${a.label}</option>`).join("");
  ["classSelect", "ageSelect", "sexSelect"].forEach(id => $(id).addEventListener("change", render));

  const done = localStorage.getItem(DONE_KEY) === "1";
  $("ctaHint").textContent = done ? "Você já respondeu neste navegador. O botão abre o seu relatório." : "";
  $("ctaBtn").addEventListener("click", onCta);
  $("dlgClose").addEventListener("click", () => $("dlg").close());
  render();
}

function render() {
  const cls = CONFIG.classes.find(c => c.id === $("classSelect").value);
  $("scopeLine").textContent = "Mostrando: " + (cls ? cls.name : "todas as turmas da universidade");
  // Sem dados reais ainda: valores em "—" e estado vazio (nada é inventado).
  $("summary").innerHTML = SUMMARY.map(s => `<div class="stat"><b>—</b><span>${s}</span></div>`).join("");
  $("charts").innerHTML = CHARTS.map(c => `
    <article class="card">
      <h2>${c.title}</h2>
      <p class="n">Respostas válidas: 0${c.sensitive ? " · mostrado só com " + CONFIG.minGroupSize + " ou mais" : ""}</p>
      <div class="empty">Ainda não há dados suficientes para esta turma</div>
    </article>`).join("");
}

function onCta() {
  const done = localStorage.getItem(DONE_KEY) === "1";
  $("dlgMsg").textContent = done
    ? "Aqui abriremos o seu relatório (etapa 2 do projeto)."
    : "Aqui abriremos o questionário em etapas (etapa 2 do projeto).";
  $("dlg").showModal();
}
init();
