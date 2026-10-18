// Questionário, relatório e painel. Respostas vão ao Supabase; uma cópia fica neste navegador.
const $ = id => document.getElementById(id);
const KEY_R = "vivamais_resposta", DONE_KEY = "vivamais_concluido";
let step = 0, data = {};
const HOME_CARDS = ["Distribuição do IMC","Atividade física","Hidratação","Bem-estar mental","Comparação por sexo informado","Comparação por faixa etária","Comparação por turma","Evolução ao longo do tempo"].map(t => ({ t }));
const val = v => typeof v === "function" ? v() : v;
const jaRespondeu = () => localStorage.getItem(DONE_KEY) === "1" && localStorage.getItem(KEY_R);

function show(v) { ["homeView", "formView", "reportView"].forEach(x => $(x).hidden = x !== v); window.scrollTo(0, 0); }

function init() {
  document.title = CONFIG.siteName;
  $("siteName").textContent = CONFIG.siteName.replace("+", "");
  $("uniName").textContent = CONFIG.universityName;
  $("minN").textContent = CONFIG.minGroupSize;
  $("classSelect").innerHTML = '<option value="">Todas as turmas</option>' + CONFIG.classes.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  $("ageSelect").innerHTML = '<option value="">Todas as faixas</option>' + CONFIG.ageGroups.map(a => `<option value="${a.id}">${a.label}</option>`).join("");
  ["classSelect", "ageSelect", "sexSelect"].forEach(id => $(id).addEventListener("change", renderHome));
  $("ctaBtn").addEventListener("click", () => jaRespondeu() ? showReport() : startForm());
  $("btnNext").addEventListener("click", next);
  $("btnBack").addEventListener("click", () => { collect(); if (step > 0) { step--; renderStep(); } else show("homeView"); });
  $("btnSkip").addEventListener("click", () => { STEPS[step].fields.forEach(f => delete data[f.id]); finish(); });
  $("btnHome").addEventListener("click", () => { show("homeView"); renderHome(); });
  $("btnDelete").addEventListener("click", async () => {
    if (!confirm("Apagar seu relatório e sua resposta? Depois você poderá responder de novo.")) return;
    try { if (SB.ready && SB.hasToken()) await SB.apagar(); }
    catch (e) { alert("Não foi possível apagar agora. Tente de novo mais tarde."); return; }
    localStorage.removeItem(KEY_R); localStorage.removeItem(DONE_KEY); SB.clearToken(); show("homeView"); renderHome();
  });
  $("stepBody").addEventListener("input", () => { collect(); updateVis(); });
  $("stepBody").addEventListener("submit", e => e.preventDefault());
  renderHome();
  recuperar();
}

async function recuperar() {
  if (!SB.ready || jaRespondeu() || !SB.hasToken()) return;
  try {
    const r = await SB.minha();
    if (r) { localStorage.setItem(KEY_R, JSON.stringify(r)); localStorage.setItem(DONE_KEY, "1"); renderHome(); }
  } catch (e) { /* sem conexão: segue sem recuperar */ }
}

function filters() {
  const g = CONFIG.ageGroups.find(x => x.id === $("ageSelect").value);
  return { p_class: $("classSelect").value || null, p_age_min: g ? g.min : null, p_age_max: g ? g.max : null, p_sex: $("sexSelect").value || null };
}
function renderHome() {
  const cls = CONFIG.classes.find(c => c.id === $("classSelect").value);
  $("scopeLine").textContent = "Mostrando: " + (cls ? cls.name : "todas as turmas da universidade");
  $("ctaHint").textContent = jaRespondeu() ? "Você já respondeu neste navegador. O botão abre o seu relatório." : "";
  $("summary").innerHTML = ["Respostas válidas", "Praticam atividade física", "Atendem às metas da OMS", "Bem-estar médio (1 a 5)"].map(s => `<div class="stat"><b>—</b><span>${s}</span></div>`).join("");
  const L = typeof CARDS !== "undefined" ? CARDS : HOME_CARDS;
  $("charts").innerHTML = L.map((c, i) => `<article class="card"><h2>${c.t}</h2><p class="n" id="n_${i}">Respostas válidas: 0</p>
    <div class="chartbox" id="b_${i}" hidden><canvas id="c_${i}"></canvas></div><div class="empty" id="m_${i}">Ainda não há dados suficientes para esta turma</div></article>`).join("");
  if (typeof renderCharts === "function") { window._tk = (window._tk || 0) + 1; renderCharts(filters(), window._tk); }
}

function startForm() { data = {}; step = 0; show("formView"); renderStep(); }

function fieldHtml(f) {
  const id = "f_" + f.id, v = data[f.id];
  let inner;
  if (f.type === "select") {
    const opts = val(f.options).map(o => `<option value="${o[0]}"${String(v) === o[0] ? " selected" : ""}>${o[1]}</option>`).join("");
    inner = `<label>${f.label}<select id="${id}"><option value="">Selecione</option>${opts}</select></label>`;
  } else if (f.type === "number") {
    inner = `<label>${f.label}<input id="${id}" type="number" inputmode="decimal" min="${val(f.min)}" max="${val(f.max)}" step="${f.step || 1}" value="${v ?? ""}"></label>`;
  } else {
    inner = `<label class="check"><input id="${id}" type="checkbox"${v ? " checked" : ""}> <span>${f.label}</span></label>`;
  }
  return `<div id="w_${f.id}">${inner}<p class="err" id="e_${f.id}" role="alert"></p></div>`;
}

function renderStep() {
  const s = STEPS[step];
  $("stepCount").textContent = `Etapa ${step + 1} de ${STEPS.length}`;
  $("progressBar").style.width = (step / STEPS.length * 100) + "%";
  $("stepBody").innerHTML = `<h2>${s.title}</h2><p class="why">${s.why}</p>` + s.fields.map(fieldHtml).join("");
  $("btnSkip").hidden = !s.optional;
  $("btnNext").textContent = step === STEPS.length - 1 ? "Ver meu relatório" : "Continuar";
  updateVis();
}

function isVisible(f) { return !f.showIf || f.showIf(data); }
function updateVis() { STEPS[step].fields.forEach(f => { $("w_" + f.id).hidden = !isVisible(f); }); }

function collect() {
  STEPS[step].fields.forEach(f => {
    const el = $("f_" + f.id); if (!el) return;
    if (f.type === "checkbox") data[f.id] = el.checked;
    else data[f.id] = el.value === "" ? undefined : (f.type === "number" ? Number(el.value) : el.value);
  });
  STEPS[step].fields.forEach(f => { if (!isVisible(f)) delete data[f.id]; });
}

function validate() {
  let ok = true;
  STEPS[step].fields.forEach(f => {
    let msg = ""; const v = data[f.id], e = $("e_" + f.id);
    if (isVisible(f)) {
      const vazio = v === undefined || v === false || Number.isNaN(v);
      if (f.required && vazio) msg = f.type === "checkbox" ? "Marque esta opção para continuar." : "Preencha este campo.";
      else if (f.type === "number" && v !== undefined) {
        if (f.integer && !Number.isInteger(v)) msg = "Use um número inteiro.";
        else if (v < val(f.min) || v > val(f.max)) msg = `Informe um valor entre ${val(f.min)} e ${val(f.max)}.`;
      }
    }
    e.textContent = msg; if (msg) ok = false;
  });
  return ok;
}

function next() {
  collect();
  if (!validate()) { const bad = document.querySelector(".err:not(:empty)"); if (bad) bad.scrollIntoView({ block: "center" }); return; }
  if (step < STEPS.length - 1) { step++; renderStep(); window.scrollTo(0, 0); } else finish();
}

async function finish() {
  data.date = new Date().toISOString();
  const err = $("sendErr"); err.textContent = "";
  if (SB.ready) {
    $("btnNext").disabled = true;
    try {
      const r = await SB.enviar(data);
      if (r === "invalido") { err.textContent = "Alguma resposta não foi aceita. Volte e confira os campos."; return; }
      if (r === "duplicado") { const srv = await SB.minha(); if (srv) data = srv; }
    } catch (e) { err.textContent = "Não foi possível enviar agora. Verifique a conexão e tente de novo."; return; }
    finally { $("btnNext").disabled = false; }
  }
  localStorage.setItem(KEY_R, JSON.stringify(data));
  localStorage.setItem(DONE_KEY, "1");
  showReport();
}

function showReport() {
  $("reportBody").innerHTML = buildReport(JSON.parse(localStorage.getItem(KEY_R)));
  show("reportView");
}
init();
