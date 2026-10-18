// Cálculos e texto do relatório individual (educativo, não é diagnóstico).
const LBL = { sono: Q_QUAL, bemestar: Q_QUAL, estresse: Q_NIVEL, disposicao: Q_NIVEL, apoio: Q_APOIO };

function calcIMC(peso, alturaCm) { const m = alturaCm / 100; return peso / (m * m); }
function catIMC(i) {
  if (i < 18.5) return "Baixo peso";
  if (i < 25) return "Faixa considerada adequada";
  if (i < 30) return "Sobrepeso";
  if (i < 35) return "Obesidade grau I";
  if (i < 40) return "Obesidade grau II";
  return "Obesidade grau III";
}
function checkOMS(r) {
  const ativo = r.pratica === "sim";
  const min = ativo ? r.dias * r.minutos * (r.intensidade === "vigorosa" ? 2 : 1) : 0;
  const aerobico = min >= 150, forca = (r.forca || 0) >= 2;
  const status = aerobico && forca ? "atende" : (aerobico || forca ? "parcial" : "abaixo");
  return { min, aerobico, forca, status };
}
function checkAgua(ml) {
  if (ml < 1500) return "abaixo";
  if (ml <= 2500) return "dentro";
  return "acima";
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const lblOf = (k, v) => { const o = LBL[k].find(x => x[0] === String(v)); return o ? o[1] : "—"; };

function buildReport(r) {
  const imc = calcIMC(r.peso, r.altura), oms = checkOMS(r), ag = checkAgua(r.agua);
  const turma = CONFIG.classes.find(c => c.id === r.turma);
  const sexo = { feminino: "Feminino", masculino: "Masculino", nao_informar: "Prefiro não informar" }[r.sexo];
  const data = new Date(r.date).toLocaleDateString("pt-BR");
  const omsTxt = {
    atende: "Pelas suas respostas, você atinge as duas recomendações: atividade aeróbica semanal e fortalecimento muscular.",
    parcial: oms.aerobico ? "Você atinge a meta aeróbica, mas ainda não o fortalecimento muscular em 2 dias por semana." : "Você faz fortalecimento em 2 dias ou mais, mas a atividade aeróbica semanal ficou abaixo de 150 minutos equivalentes.",
    abaixo: "Pelas respostas, você ainda não atinge as recomendações. Isso não define sua saúde: é um ponto de partida."
  }[r.status = oms.status];
  const aguaTxt = {
    abaixo: "Sua água pura informada está abaixo da referência geral. Outras bebidas e alimentos também contam, então isso não indica desidratação.",
    dentro: "Sua água pura informada está dentro da faixa geral de referência.",
    acima: "Sua água pura informada está acima da faixa geral de referência. A necessidade varia com calor e atividade."
  }[ag];
  const mental = r.sono ? ["sono", "estresse", "disposicao", "bemestar", "apoio"].map(k =>
    `<li><b>${{ sono: "Sono", estresse: "Estresse", disposicao: "Disposição", bemestar: "Bem-estar", apoio: "Apoio social" }[k]}:</b> ${lblOf(k, r[k])}</li>`).join("") : "";
  const dicas = [];
  if (r.dicasAtiv === "sim" || oms.status !== "atende") dicas.push("Aumente a atividade aos poucos: acrescente 10 minutos por dia ou mais um dia na semana, e escolha algo de que você goste.");
  if (!oms.forca && r.dicasAtiv === "sim") dicas.push("Para o fortalecimento, exercícios com o peso do corpo (agachamento, flexão, prancha) 2 vezes por semana já ajudam.");
  if (r.dicasAgua === "sim") dicas.push("Deixe uma garrinha de água por perto, beba um copo ao acordar e leve água para as atividades físicas.");
  if (r.dicasMental === "sim") dicas.push("Procure horários regulares de sono, pausas de lazer e conversas com pessoas de confiança. Se sentir que precisa de apoio profissional, procure o serviço de saúde da universidade ou ligue para o CVV, 188 (24 horas, gratuito).");
  return `
  <h2>Seu relatório Viva+</h2>
  <p class="n">Avaliação feita em ${data}${turma ? " · " + esc(turma.name) : ""}</p>
  <div class="card"><h3>Seus dados informados</h3>
    <ul><li>Idade: ${r.idade} anos</li><li>Sexo informado: ${sexo}</li><li>Peso: ${r.peso} kg · Altura: ${r.altura} cm</li></ul></div>
  <div class="card"><h3>IMC: ${imc.toFixed(1).replace(".", ",")}</h3>
    <p>Categoria de referência para adultos: <b>${catIMC(imc)}</b>.</p>
    <p class="n">O IMC é uma triagem. Sozinho, não determina sua saúde, sua aparência nem sua capacidade física.</p></div>
  <div class="card"><h3>Atividade física e a OMS</h3>
    <p>Atividade aeróbica semanal (equivalente moderada): <b>${oms.min} min</b>. Fortalecimento: <b>${r.forca} dia(s)</b> por semana.</p>
    <p>${omsTxt}</p>
    <p class="n">Critério: 150 min ou mais por semana de aeróbica moderada (minutos vigorosos contam em dobro) e fortalecimento em 2 dias ou mais.</p></div>
  <div class="card"><h3>Hidratação</h3>
    <p>Você informou <b>${r.agua} mL</b> de água pura por dia. Referência geral para adultos: cerca de 1500 a 2500 mL de líquidos por dia.</p>
    <p>${aguaTxt}</p></div>
  ${mental ? `<div class="card"><h3>Bem-estar</h3><ul>${mental}</ul></div>` : ""}
  ${dicas.length ? `<div class="card"><h3>Sugestões práticas</h3><ul>${dicas.map(d => `<li>${d}</li>`).join("")}</ul></div>` : ""}
  <p class="n">Este relatório é educativo e não substitui avaliação médica, nutricional ou psicológica.</p>`;
}
if (typeof module !== "undefined") module.exports = { calcIMC, catIMC, checkOMS, checkAgua };
