// sync.js — sincroniza o estado do app com a API (banco no Hetzner).
// Sem servidor configurado, o app funciona 100% offline (localStorage).
(function () {
  "use strict";
  const KEY = "gt.sync";
  const API_URL_PADRAO = "https://treino-api.grupooqta.com.br";

  let cfg = load();
  let hooks = null;
  let pushTimer = null;

  function load() {
    try { return Object.assign({ url: API_URL_PADRAO, token: "", enabled: false }, JSON.parse(localStorage.getItem(KEY)) || {}); }
    catch { return { url: API_URL_PADRAO, token: "", enabled: false }; }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(cfg)); }
  const norm = (u) => (u || "").trim().replace(/\/+$/, "");
  function status(txt, ok) { window.dispatchEvent(new CustomEvent("gymsync:status", { detail: { txt, ok } })); }

  async function pull() {
    if (!enabled()) return null;
    try {
      const r = await fetch(norm(cfg.url) + "/state", { headers: { Authorization: "Bearer " + cfg.token } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      status("sincronizado", true);
      return j; // { data, updated_at }
    } catch (e) { status("offline (" + e.message + ")", false); return null; }
  }

  async function push(snap) {
    if (!enabled()) return;
    try {
      const r = await fetch(norm(cfg.url) + "/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + cfg.token },
        body: JSON.stringify({ data: snap })
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      const hora = j.updated_at ? new Date(j.updated_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
      status("salvo na nuvem " + hora, true);
    } catch (e) { status("não salvou (" + e.message + ")", false); }
  }

  function schedulePush(snap) {
    if (!enabled()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => push(snap), 1200);
  }

  function enabled() { return !!cfg.enabled && !!cfg.url && !!cfg.token; }

  window.GymSync = {
    bind(h) { hooks = h; },
    enabled,
    config() { return { url: cfg.url, token: cfg.token, enabled: cfg.enabled }; },
    pull, push, schedulePush,

    async connect(url, token) {
      cfg = { url: norm(url), token: (token || "").trim(), enabled: true };
      save();
      const remote = await pull();
      if (!remote) { cfg.enabled = false; save(); return false; } // falhou conexão
      if (remote.data && Object.keys(remote.data).length && hooks) {
        hooks.applySnapshot(remote.data); hooks.rerender();
        status("dados da nuvem carregados", true);
      } else if (hooks) {
        await push(hooks.getSnapshot());
      }
      return true;
    },

    disconnect() { cfg.enabled = false; save(); status("desconectado", false); },

    async syncNow() {
      if (!enabled() || !hooks) return;
      const remote = await pull();
      if (remote && remote.data && Object.keys(remote.data).length) { hooks.applySnapshot(remote.data); hooks.rerender(); }
      await push(hooks.getSnapshot());
    }
  };
})();
