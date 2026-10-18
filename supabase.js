// Comunicação com o Supabase. Usa só a chave pública (anon) definida em config.js.
const SB = (() => {
  const TK = "vivamais_token";
  const configurado = CONFIG.supabaseUrl && !CONFIG.supabaseUrl.startsWith("COLE");
  const client = configurado && window.supabase
    ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey) : null;
  function novoToken() {
    if (crypto.randomUUID) return crypto.randomUUID();
    const b = crypto.getRandomValues(new Uint8Array(16)); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    const h = [...b].map(x => x.toString(16).padStart(2, "0")).join("");
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }
  const hasToken = () => !!localStorage.getItem(TK);
  const token = () => { let t = localStorage.getItem(TK); if (!t) { t = novoToken(); localStorage.setItem(TK, t); } return t; };
  async function rpc(fn, args) {
    const { data, error } = await client.rpc(fn, args);
    if (error) throw new Error("Falha na comunicação");
    return data;
  }
  return {
    ready: !!client, hasToken, clearToken: () => localStorage.removeItem(TK),
    enviar: d => rpc("enviar_resposta", { p_token: token(), p_dados: d }),
    minha: () => rpc("obter_minha_resposta", { p_token: token() }),
    apagar: () => rpc("apagar_minha_resposta", { p_token: token() }),
    indicadores: f => rpc("indicadores", f) // usado na etapa 4
  };
})();
