// app.js — Gym Tracker inteligente (perfil → plano gerado, progressão, troca, sync)
(() => {
  "use strict";

  const LS = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem("gt." + k)); return v == null ? d : v; } catch { return d; } },
    set(k, v) { localStorage.setItem("gt." + k, JSON.stringify(v)); }
  };
  let perfil = LS.get("perfil", null);   // {sexo,idade,altura,peso,objetivo,nivel,dias}
  let cycle  = LS.get("cycle", 0);
  let hist   = LS.get("hist", {});
  let draft  = LS.get("draft", {});
  let streak = LS.get("streak", { count: 0, last: null });
  let subs   = LS.get("subs", {});
  let PLAN   = [];

  function rebuildPlan() {
    PLAN = (perfil && typeof gerarPlano === "function") ? gerarPlano(perfil) : (typeof PLANO !== "undefined" ? PLANO.map(d => ({ nome: d.nome, foco: d.foco, slots: d.ex.map(id => ({ exId: id, sets: EXERCICIOS[id].series, repMin: EXERCICIOS[id].repMin, repMax: EXERCICIOS[id].repMax, descanso: 60 })) })) : []);
    if (cycle >= PLAN.length) cycle = 0;
  }
  rebuildPlan();

  let suppressSync = false;
  const snap = () => ({ perfil, cycle, hist, draft, streak, subs });
  function applySnap(s) {
    if (!s) return;
    suppressSync = true;
    perfil = s.perfil ?? perfil; cycle = s.cycle ?? 0; hist = s.hist ?? {}; draft = s.draft ?? {}; streak = s.streak ?? { count: 0, last: null }; subs = s.subs ?? {};
    LS.set("perfil", perfil); rebuildPlan(); saveAll();
    suppressSync = false;
  }

  const saveAll = () => {
    LS.set("perfil", perfil); LS.set("cycle", cycle); LS.set("hist", hist); LS.set("draft", draft); LS.set("streak", streak); LS.set("subs", subs);
    if (window.GymSync && !suppressSync) window.GymSync.schedulePush(snap());
  };
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const fmt = (n) => (n == null || n === "" ? "—" : (Math.round(n * 100) / 100));
  const ALTS = (id) => (typeof ALTERNATIVAS !== "undefined" && ALTERNATIVAS[id]) ? ALTERNATIVAS[id] : [];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const diaAtual = () => PLAN[cycle] || PLAN[0] || { nome: "—", foco: "", slots: [] };
  const effSlots = () => diaAtual().slots.map((sl) => ({ ...sl, origId: sl.exId, exId: subs[sl.exId] || sl.exId }));

  // ---------- progressão (double progression) ----------
  function suggestion(exId, repMin, repMax) {
    const ex = EXERCICIOS[exId];
    const h = hist[exId]; const last = h && h[h.length - 1];
    if (ex.tipo === "tempo") {
      if (!last) return { text: `Segure <b>${repMin}s</b> por série.`, up: false, weight: null, reps: repMin };
      if (last.reps >= repMax) return { text: `Mandou ${last.reps}s! Tente <b>+10s</b>.`, up: true, weight: null, reps: last.reps + 10 };
      return { text: `Última: ${last.reps}s. Mire em <b>${repMax}s</b>.`, up: false, weight: null, reps: last.reps };
    }
    if (ex.tipo === "corporal") {
      if (!last) return { text: `Máximo de reps limpas (alvo ${repMin}–${repMax}).`, up: false, weight: null, reps: repMin };
      if (last.reps >= repMax) return { text: `${last.reps} reps — <b>ótimo</b>. Some reps ou carga.`, up: true, weight: last.w || null, reps: last.reps + 1 };
      return { text: `Última: ${last.reps} reps. Mire em <b>${repMax}</b>.`, up: false, weight: last.w || null, reps: last.reps };
    }
    if (!last) return { text: `Comece com um peso confortável e foque na técnica.`, up: false, weight: null, reps: repMin };
    if (last.reps >= repMax) {
      const nw = Math.round((last.w + ex.inc) * 100) / 100;
      return { text: `Fez ${last.reps} reps com ${fmt(last.w)}kg. Suba para <b>${nw} kg</b> 🔥`, up: true, weight: nw, reps: repMin };
    }
    return { text: `Mantenha <b>${fmt(last.w)} kg</b> e busque ${repMax} reps.`, up: false, weight: last.w, reps: Math.min(last.reps + 1, repMax) };
  }
  function ensureDraft(exId, sug) {
    if (!draft[exId]) draft[exId] = { w: sug.weight, reps: sug.reps, done: false };
    return draft[exId];
  }

  // ---------- ações ----------
  function commit(exId, repMin, repMax) {
    const ex = EXERCICIOS[exId];
    const d = ensureDraft(exId, suggestion(exId, repMin, repMax));
    const reps = Number(d.reps) || 0;
    const w = ex.tipo === "tempo" ? null : (d.w === "" || d.w == null ? null : Number(d.w));
    const entry = { d: todayISO(), w, reps };
    hist[exId] = hist[exId] || [];
    const arr = hist[exId];
    if (arr.length && arr[arr.length - 1].d === entry.d) arr[arr.length - 1] = entry; else arr.push(entry);
    d.done = true; saveAll();
  }
  function uncommit(exId) { if (draft[exId]) draft[exId].done = false; saveAll(); }
  function swap(origId, toId) { if (toId === origId) delete subs[origId]; else subs[origId] = toId; saveAll(); renderHoje(); }

  function finishWorkout() {
    const allDone = effSlots().every((it) => draft[it.exId] && draft[it.exId].done);
    cycle = (cycle + 1) % PLAN.length; draft = {};
    const t = todayISO(); if (streak.last !== t) { streak.count = (streak.count || 0) + 1; streak.last = t; }
    saveAll(); toast(allDone ? "Treino completo! 🔥" : "Treino salvo. Próximo dia carregado.");
    switchTab("hoje"); render(); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function setDay(i) { cycle = i; draft = {}; saveAll(); switchTab("hoje"); render(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function resetTudo() {
    if (!confirm("Apagar histórico, substituições e perfil?")) return;
    ["cycle", "hist", "draft", "streak", "subs", "perfil"].forEach((k) => localStorage.removeItem("gt." + k));
    perfil = null; cycle = 0; hist = {}; draft = {}; streak = { count: 0, last: null }; subs = {}; rebuildPlan();
    boot();
  }

  // ---------- ONBOARDING ----------
  let obSel = { sexo: "M", objetivo: "ambos", nivel: "iniciante", dias: 4 };
  function renderOnboard(editar) {
    if (editar && perfil) obSel = { sexo: perfil.sexo, objetivo: perfil.objetivo, nivel: perfil.nivel, dias: perfil.dias };
    const grp = (field, opts) => opts.map(([v, l]) =>
      `<button class="ob-opt ${obSel[field] === v ? "on" : ""}" data-act="ob" data-field="${field}" data-val="${v}">${l}</button>`).join("");
    document.getElementById("view-hoje").innerHTML = `
      <section class="hero">
        <p class="kicker">${editar ? "Editar perfil" : "Bem-vindo"}</p>
        <h1>Vamos montar seu treino</h1>
        <p class="sub">Responda rápido — o app gera um plano sob medida pro seu objetivo.</p>
      </section>
      <div class="ob">
        <div class="ob-row"><span class="ob-lbl">Sexo</span><div class="ob-grp">${grp("sexo", [["M", "Masculino"], ["F", "Feminino"]])}</div></div>
        <div class="ob-row3">
          <label class="field"><label>Idade</label><input id="obIdade" type="number" inputmode="numeric" value="${perfil ? perfil.idade : ""}" placeholder="anos"></label>
          <label class="field"><label>Altura (cm)</label><input id="obAltura" type="number" inputmode="numeric" value="${perfil ? perfil.altura : ""}" placeholder="cm"></label>
          <label class="field"><label>Peso (kg)</label><input id="obPeso" type="number" inputmode="decimal" value="${perfil ? perfil.peso : ""}" placeholder="kg"></label>
        </div>
        <div class="ob-row"><span class="ob-lbl">Objetivo</span><div class="ob-grp col">${grp("objetivo", [["emagrecimento", "🔥 Emagrecer (perder gordura)"], ["hipertrofia", "💪 Hipertrofia (ganhar músculo)"], ["ambos", "⚡ Os dois (recomposição)"]])}</div></div>
        <div class="ob-row"><span class="ob-lbl">Nível</span><div class="ob-grp">${grp("nivel", [["iniciante", "Iniciante"], ["intermediario", "Intermediário"]])}</div></div>
        <div class="ob-row"><span class="ob-lbl">Dias por semana</span><div class="ob-grp">${grp("dias", [[3, "3"], [4, "4"], [5, "5"], [6, "6"]])}</div></div>
        <button class="btn-finish ready" data-act="ob-submit">${editar ? "Salvar e regerar plano" : "Gerar meu plano →"}</button>
        ${editar ? '<a class="reset-link" data-act="ob-cancel" href="#">cancelar</a>' : ""}
      </div>`;
    document.getElementById("footbar").style.display = "none";
    document.querySelectorAll(".tab").forEach((b) => b.style.display = editar ? "" : "none");
  }
  function submitOnboard() {
    const idade = Number(document.getElementById("obIdade").value);
    const altura = Number(document.getElementById("obAltura").value);
    const peso = Number(document.getElementById("obPeso").value);
    if (!idade || !altura || !peso) { toast("Preencha idade, altura e peso."); return; }
    perfil = { sexo: obSel.sexo, idade, altura, peso, objetivo: obSel.objetivo, nivel: obSel.nivel, dias: Number(obSel.dias) };
    cycle = 0; draft = {}; rebuildPlan(); saveAll();
    document.querySelectorAll(".tab").forEach((b) => b.style.display = "");
    toast("Plano gerado! 💪"); switchTab("hoje"); render(); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- card ----------
  function altsPanel(exId, origId) {
    const swapped = exId !== origId;
    const usados = new Set(effSlots().map((it) => it.exId));
    const pool = (swapped ? [origId] : []).concat(ALTS(origId));
    const opcoes = pool.filter((x, i, a) => a.indexOf(x) === i && x !== exId && (x === origId || !usados.has(x)));
    if (!opcoes.length && !swapped) return "";
    const items = opcoes.map((optId) => {
      const e = EXERCICIOS[optId]; const isOrig = optId === origId;
      return `<button class="alt" data-act="swap" data-orig="${origId}" data-to="${optId}">
        <span class="alt-thumb"><img loading="lazy" alt="" src="${e.img}" onerror="this.style.opacity=0"></span>
        <span class="alt-info"><span class="alt-name">${esc(e.nome)}</span><span class="chip eq">${esc(e.equip)}</span></span>
        <span class="alt-pick">${isOrig ? "↩︎ original" : "usar"}</span></button>`;
    }).join("");
    return `<div class="ex__altswrap">
      <button class="ex__how ex__swap" data-act="alts" aria-expanded="false"><span class="arw">▸</span> 🔄 Trocar equipamento${swapped ? ` <span class="swap-tag">trocado</span>` : ""}</button>
      <div class="ex__alts" hidden>${items}</div></div>`;
  }

  function cardHTML(it) {
    const ex = EXERCICIOS[it.exId];
    const sets = ex.tipo === "carga" ? it.sets : ex.series;
    const repMin = ex.tipo === "carga" ? it.repMin : ex.repMin;
    const repMax = ex.tipo === "carga" ? it.repMax : ex.repMax;
    const sug = suggestion(it.exId, repMin, repMax);
    const d = ensureDraft(it.exId, sug);
    const done = !!d.done, swapped = it.exId !== it.origId;
    const showW = ex.tipo !== "tempo";
    const wLabel = ex.tipo === "corporal" ? "Carga +kg" : "Peso (kg)";
    const rLabel = ex.tipo === "tempo" ? "Tempo (s)" : "Reps";
    const unidade = ex.tipo === "tempo" ? "s" : "reps";
    const wVal = d.w == null ? "" : d.w, rVal = d.reps == null ? "" : d.reps;
    const steps = ex.como.map((p) => `<li>${esc(p)}</li>`).join("");
    return `
    <article class="ex ${done ? "done" : ""} ${swapped ? "swapped" : ""}" data-id="${it.exId}" data-min="${repMin}" data-max="${repMax}">
      <div class="ex__media"><span class="ph">🏋️</span><img loading="lazy" alt="${esc(ex.nome)}" src="${ex.img}" onload="this.previousElementSibling.style.display='none'" onerror="this.style.display='none'"></div>
      <div class="ex__body">
        <div class="ex__head"><h3>${esc(ex.nome)}</h3><span class="ex__done-flag">✓</span></div>
        <div class="chips"><span class="chip">${esc(ex.grupo)}</span><span class="chip eq">${esc(ex.equip)}</span>${swapped ? `<span class="chip alt-of">no lugar de ${esc(EXERCICIOS[it.origId].nome)}</span>` : ""}</div>
        <p class="ex__target"><b>${sets} séries</b> • ${repMin}–${repMax} ${unidade} • descanso ${it.descanso}s</p>
        ${ex.nota ? `<p class="ex__nota">↳ ${esc(ex.nota)}</p>` : ""}
        <button class="ex__how" data-act="how" aria-expanded="false"><span class="arw">▸</span> Como usar o equipamento</button>
        <ol class="ex__steps" hidden>${steps}</ol>
        ${altsPanel(it.exId, it.origId)}
        <div class="ex__sug ${sug.up ? "up" : ""}"><span class="ic">${sug.up ? "⬆️" : "💡"}</span><span>${sug.text}</span></div>
        <div class="ex__log">
          <div class="field ${showW ? "" : "hide"}"><label>${wLabel}</label><input type="number" inputmode="decimal" step="0.5" data-field="w" value="${wVal}" placeholder="${ex.tipo === "corporal" ? "0" : "–"}"></div>
          <div class="field"><label>${rLabel}</label><input type="number" inputmode="numeric" step="1" data-field="reps" value="${rVal}" placeholder="${repMin}"></div>
          <button class="btn-done" data-act="done">✓ Feito</button>
        </div>
      </div>
    </article>`;
  }

  // ---------- views ----------
  function renderHoje() {
    if (!perfil) { renderOnboard(false); return; }
    const day = diaAtual();
    const eff = effSlots();
    const total = eff.length;
    const doneCount = eff.filter((it) => draft[it.exId] && draft[it.exId].done).length;
    const pct = total ? Math.round((doneCount / total) * 100) : 0;
    const allDone = total && doneCount === total;
    const objLabel = { emagrecimento: "Emagrecimento", hipertrofia: "Hipertrofia", ambos: "Recomposição" }[perfil.objetivo];

    const hero = `<section class="hero">
      <p class="kicker">Treino ${cycle + 1} de ${PLAN.length} • ${esc(objLabel)}</p>
      <h1>${esc(day.nome)}</h1>
      <p class="sub">${esc(day.foco)} — marque cada exercício; o app ajusta sua carga.</p>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <div class="count"><span><b>${doneCount}</b> de ${total} feitos</span><span>${pct}%</span></div>
    </section>`;
    const cards = eff.map(cardHTML).join("");
    const note = `<p class="note"><b>Não tem o aparelho?</b> Toque em <b>🔄 Trocar equipamento</b> em qualquer exercício e escolha um equivalente — a troca fica salva. A sugestão de carga fica laranja quando é hora de subir o peso.</p>`;
    document.getElementById("view-hoje").innerHTML = hero + cards + note;

    const fb = document.getElementById("finishBtn");
    fb.style.display = "block";
    const proximo = ((cycle + 1) % PLAN.length) + 1;
    fb.textContent = allDone ? `✓ Concluir treino → Dia ${proximo}` : `Avançar para o próximo dia →`;
    fb.classList.toggle("ready", !!allDone);
    document.getElementById("streak").innerHTML = `🔥 <b>${streak.count || 0}</b> treinos`;
  }

  function renderPlano() {
    const list = PLAN.map((day, i) => `
      <button class="day-card ${i === cycle ? "current" : ""}" data-act="setday" data-i="${i}">
        <span class="num">${i + 1}</span>
        <span class="info"><h3>${esc(day.nome)}</h3><p>${day.slots.length} exercícios • ${esc(day.foco)}</p></span>
        <span class="go">${i === cycle ? "● HOJE" : "abrir"}</span></button>`).join("");
    document.getElementById("view-plano").innerHTML =
      `<section class="hero"><p class="kicker">Seu plano</p><h1>${PLAN.length} dias</h1><p class="sub">Gerado pro seu objetivo. Toque num dia para treiná-lo.</p></section>
       <div class="day-list">${list}</div>`;
  }

  function renderEvo() {
    const ids = Object.keys(hist).filter((id) => hist[id] && hist[id].length && EXERCICIOS[id]);
    if (!ids.length) { document.getElementById("view-evo").innerHTML = `<div class="empty"><div class="big">📈</div>Sem registros ainda.<br>Conclua exercícios na aba <b>Hoje</b>.</div>`; return; }
    const cards = ids.map((id) => {
      const ex = EXERCICIOS[id], h = hist[id], last = h[h.length - 1], prev = h.length > 1 ? h[h.length - 2] : null;
      let trend = '<span class="trend same">—</span>';
      if (prev) { const cur = (last.w || 0) * 1000 + last.reps, old = (prev.w || 0) * 1000 + prev.reps; if (cur > old) trend = '<span class="trend up">▲ subindo</span>'; else if (cur < old) trend = '<span class="trend same">▼</span>'; }
      const pills = h.slice(-6).map((e) => `<span class="pill">${ex.tipo === "tempo" ? e.reps + "s" : (e.w ? fmt(e.w) + "kg × " + e.reps : e.reps + " reps")}</span>`).join("");
      return `<div class="evo-card"><h3>${esc(ex.nome)} ${trend}</h3><div class="hist">${pills}</div></div>`;
    }).join("");
    document.getElementById("view-evo").innerHTML = `<section class="hero"><p class="kicker">Progresso</p><h1>Sua evolução</h1><p class="sub">Histórico de cargas por exercício.</p></section><div class="evo">${cards}</div>`;
  }

  function renderPerfil() {
    const m = perfil ? calcMetricas(perfil) : null;
    const objLabel = { emagrecimento: "Emagrecimento", hipertrofia: "Hipertrofia", ambos: "Recomposição" }[perfil ? perfil.objetivo : "ambos"];
    const metricas = m ? `
      <div class="metrics">
        <div class="metric"><span class="m-val">${m.imc}</span><span class="m-lbl">IMC<br><i>${m.imcCat}</i></span></div>
        <div class="metric"><span class="m-val">${m.meta}</span><span class="m-lbl">kcal/dia<br><i>${m.descMeta}</i></span></div>
        <div class="metric"><span class="m-val">${m.proteina}g</span><span class="m-lbl">proteína/dia</span></div>
        <div class="metric"><span class="m-val">${m.agua}L</span><span class="m-lbl">água/dia</span></div>
        <div class="metric"><span class="m-val">${m.tdee}</span><span class="m-lbl">gasto total (TDEE)</span></div>
        <div class="metric"><span class="m-val">${m.bmr}</span><span class="m-lbl">metabolismo basal</span></div>
      </div>
      <p class="note">Objetivo: <b>${esc(objLabel)}</b> • ${perfil.dias}x/semana • nível ${esc(perfil.nivel)}. Números estimados (Mifflin-St Jeor); ajuste conforme seu resultado real.</p>` : "";

    const c = window.GymSync ? window.GymSync.config() : { url: "", token: "", enabled: false };
    const on = window.GymSync && window.GymSync.enabled();
    const sync = `
      <h2 class="sec">Sincronizar na nuvem</h2>
      <div class="sync-box">
        <div class="sync-status ${on ? "on" : ""}" id="syncStatus">${on ? "✅ Conectado — dados salvos no servidor" : "○ Salvando só neste aparelho"}</div>
        <label class="field block"><label>Endereço da API</label><input id="syncUrl" type="url" value="${esc(c.url || "")}" placeholder="https://treino-api.grupooqta.com.br"></label>
        <label class="field block"><label>Token de acesso</label><input id="syncToken" type="password" value="${esc(c.token || "")}" placeholder="cole seu token"></label>
        <div class="sync-actions">${on
          ? `<button class="btn-done" data-act="sync-now">↻ Sincronizar agora</button><button class="sync-off" data-act="sync-disconnect">desconectar</button>`
          : `<button class="btn-finish ready" data-act="sync-connect">Conectar e sincronizar</button>`}</div>
      </div>`;

    document.getElementById("view-perfil").innerHTML = `
      <section class="hero"><p class="kicker">Você</p><h1>Seu perfil</h1><p class="sub">${perfil ? perfil.peso + "kg • " + perfil.altura + "cm • " + perfil.idade + " anos" : "Preencha para gerar seu plano."}</p></section>
      ${metricas}
      <button class="day-card" data-act="ob-edit" style="width:100%"><span class="num">⚙︎</span><span class="info"><h3>Editar dados / objetivo</h3><p>Regerar o plano</p></span><span class="go">abrir</span></button>
      ${sync}
      <a class="reset-link" data-act="reset" href="#">apagar tudo e recomeçar</a>`;
  }

  // ---------- abas / toast ----------
  function switchTab(t) {
    document.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === t)));
    document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + t));
    document.getElementById("footbar").style.display = (t === "hoje" && perfil) ? "block" : "none";
    if (t === "hoje") renderHoje();
    if (t === "plano") renderPlano();
    if (t === "evo") renderEvo();
    if (t === "perfil") renderPerfil();
  }
  function render() { renderHoje(); }
  let toastT;
  function toast(msg) { const el = document.getElementById("toast"); el.textContent = msg; el.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2600); }

  window.addEventListener("gymsync:status", (e) => { const el = document.getElementById("syncStatus"); if (el) { el.textContent = (e.detail.ok ? "✅ " : "⚠️ ") + e.detail.txt; el.classList.toggle("on", !!e.detail.ok); } });

  // ---------- eventos ----------
  document.addEventListener("click", (e) => {
    const tab = e.target.closest(".tab"); if (tab) { switchTab(tab.dataset.tab); return; }
    const act = e.target.closest("[data-act]"); if (!act) return;
    const kind = act.dataset.act;
    if (kind === "how" || kind === "alts") {
      const panel = act.nextElementSibling; const open = panel.hasAttribute("hidden");
      if (open) panel.removeAttribute("hidden"); else panel.setAttribute("hidden", "");
      act.setAttribute("aria-expanded", String(open)); return;
    }
    if (kind === "done") {
      const card = act.closest(".ex"); const id = card.dataset.id;
      if (draft[id] && draft[id].done) uncommit(id); else commit(id, Number(card.dataset.min), Number(card.dataset.max));
      renderHoje(); return;
    }
    if (kind === "swap") { swap(act.dataset.orig, act.dataset.to); return; }
    if (kind === "setday") { setDay(Number(act.dataset.i)); return; }
    if (kind === "reset") { e.preventDefault(); resetTudo(); return; }
    if (kind === "ob") { obSel[act.dataset.field] = act.dataset.field === "dias" ? Number(act.dataset.val) : act.dataset.val; act.parentElement.querySelectorAll(".ob-opt").forEach((b) => b.classList.toggle("on", b === act)); return; }
    if (kind === "ob-submit") { submitOnboard(); return; }
    if (kind === "ob-edit") { renderOnboard(true); switchTab("hoje"); document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-hoje")); return; }
    if (kind === "ob-cancel") { e.preventDefault(); switchTab("perfil"); return; }
    if (kind === "sync-connect") { const url = document.getElementById("syncUrl").value, token = document.getElementById("syncToken").value; act.textContent = "Conectando…"; window.GymSync.connect(url, token).then((ok) => { toast(ok ? "Conectado ✅" : "Falhou — confira URL/token"); renderPerfil(); }); return; }
    if (kind === "sync-disconnect") { window.GymSync.disconnect(); toast("Desconectado"); renderPerfil(); return; }
    if (kind === "sync-now") { window.GymSync.syncNow().then(() => { toast("Sincronizado"); renderPerfil(); }); return; }
  });

  document.addEventListener("input", (e) => {
    const inp = e.target.closest("input[data-field]"); if (!inp || !inp.closest(".ex")) return;
    const id = inp.closest(".ex").dataset.id, f = inp.dataset.field;
    if (!draft[id]) draft[id] = {};
    draft[id][f] = inp.value === "" ? "" : Number(inp.value); draft[id].done = false;
    LS.set("draft", draft); if (window.GymSync && !suppressSync) window.GymSync.schedulePush(snap());
    inp.closest(".ex").classList.remove("done");
  });

  document.getElementById("finishBtn").addEventListener("click", finishWorkout);

  // ---------- boot ----------
  function boot() {
    if (window.GymSync) window.GymSync.bind({ getSnapshot: snap, applySnapshot: applySnap, rerender: () => switchTab("hoje") });
    (async () => {
      if (window.GymSync && window.GymSync.enabled()) {
        const remote = await window.GymSync.pull();
        if (remote && remote.data && Object.keys(remote.data).length) applySnap(remote.data);
      }
      switchTab("hoje");
    })();
  }
  boot();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
