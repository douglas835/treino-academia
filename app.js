// app.js — lógica do Gym Tracker (estado em localStorage, sem backend)
(() => {
  "use strict";

  // ---------- persistência ----------
  const LS = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem("gt." + k)); return v == null ? d : v; } catch { return d; } },
    set(k, v) { localStorage.setItem("gt." + k, JSON.stringify(v)); }
  };
  let cycle  = LS.get("cycle", 0);
  let hist   = LS.get("hist", {});    // { exId: [{d, w, reps}] }
  let draft  = LS.get("draft", {});   // { exId: {w, reps, done} }
  let streak = LS.get("streak", { count: 0, last: null });

  const saveAll = () => { LS.set("cycle", cycle); LS.set("hist", hist); LS.set("draft", draft); LS.set("streak", streak); };
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const fmt = (n) => (n == null || n === "" ? "—" : (Math.round(n * 100) / 100));

  // ---------- progressão ----------
  function suggestion(id) {
    const ex = EXERCICIOS[id];
    const h = hist[id];
    const last = h && h[h.length - 1];

    if (ex.tipo === "tempo") {
      if (!last) return { text: `Segure <b>${ex.repMin}s</b> em cada série. Foque na postura.`, up: false, weight: null, reps: ex.repMin };
      if (last.reps >= ex.repMax) return { text: `Mandou ${last.reps}s! Tente <b>+10s</b> hoje.`, up: true, weight: null, reps: last.reps + 10 };
      return { text: `Última vez: ${last.reps}s. Busque chegar a <b>${ex.repMax}s</b>.`, up: false, weight: null, reps: last.reps };
    }
    if (ex.tipo === "corporal") {
      if (!last) return { text: `Faça o máximo de reps limpas (alvo ${ex.repMin}–${ex.repMax}).`, up: false, weight: null, reps: ex.repMin };
      if (last.reps >= ex.repMax) return { text: `${last.reps} reps na última — <b>excelente</b>. Some mais reps ou carga extra.`, up: true, weight: last.w || null, reps: last.reps + 1 };
      return { text: `Última: ${last.reps} reps. Mire em <b>${ex.repMax}</b>.`, up: false, weight: last.w || null, reps: last.reps };
    }
    // carga
    if (!last) return { text: `Primeira vez: escolha um peso confortável e foque na técnica.`, up: false, weight: null, reps: ex.repMin };
    if (last.reps >= ex.repMax) {
      const nw = Math.round((last.w + ex.inc) * 100) / 100;
      return { text: `Você fez ${last.reps} reps com ${fmt(last.w)}kg. Suba para <b>${nw} kg</b> 🔥`, up: true, weight: nw, reps: ex.repMin };
    }
    return { text: `Mantenha <b>${fmt(last.w)} kg</b> e busque ${ex.repMax} reps em todas as séries.`, up: false, weight: last.w, reps: Math.min(last.reps + 1, ex.repMax) };
  }

  function ensureDraft(id) {
    if (!draft[id]) {
      const s = suggestion(id);
      draft[id] = { w: s.weight, reps: s.reps, done: false };
    }
    return draft[id];
  }

  // ---------- ações ----------
  function commit(id) {
    const ex = EXERCICIOS[id];
    const d = ensureDraft(id);
    const reps = Number(d.reps) || 0;
    const w = ex.tipo === "tempo" ? null : (d.w === "" || d.w == null ? null : Number(d.w));
    const entry = { d: todayISO(), w, reps };
    hist[id] = hist[id] || [];
    const arr = hist[id];
    if (arr.length && arr[arr.length - 1].d === entry.d) arr[arr.length - 1] = entry;
    else arr.push(entry);
    d.done = true;
    saveAll();
  }
  function uncommit(id) { if (draft[id]) draft[id].done = false; saveAll(); }

  function finishWorkout() {
    const day = PLANO[cycle];
    const allDone = day.ex.every((id) => draft[id] && draft[id].done);
    cycle = (cycle + 1) % PLANO.length;
    draft = {};
    const t = todayISO();
    if (streak.last !== t) { streak.count = (streak.count || 0) + 1; streak.last = t; }
    saveAll();
    toast(allDone ? "Treino completo! 🔥 Bora pro próximo." : "Treino salvo. Próximo dia carregado.");
    switchTab("hoje");
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setDay(i) { cycle = i; draft = {}; saveAll(); switchTab("hoje"); render(); window.scrollTo({ top: 0, behavior: "smooth" }); }

  function resetTudo() {
    if (!confirm("Apagar TODO o histórico e recomeçar do zero?")) return;
    ["cycle", "hist", "draft", "streak"].forEach((k) => localStorage.removeItem("gt." + k));
    cycle = 0; hist = {}; draft = {}; streak = { count: 0, last: null };
    switchTab("hoje"); render();
  }

  // ---------- render: HOJE ----------
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  function cardHTML(id) {
    const ex = EXERCICIOS[id];
    const d = ensureDraft(id);
    const sug = suggestion(id);
    const done = !!d.done;
    const showW = ex.tipo !== "tempo";
    const wLabel = ex.tipo === "corporal" ? "Carga +kg" : "Peso (kg)";
    const rLabel = ex.tipo === "tempo" ? "Tempo (s)" : "Reps";
    const unidade = ex.tipo === "tempo" ? "s" : "reps";
    const alvo = `${ex.repMin}–${ex.repMax} ${unidade}`;
    const wVal = d.w == null ? "" : d.w;
    const rVal = d.reps == null ? "" : d.reps;
    const steps = ex.como.map((p) => `<li>${esc(p)}</li>`).join("");

    return `
    <article class="ex ${done ? "done" : ""}" data-id="${id}">
      <div class="ex__media">
        <span class="ph">🏋️</span>
        <img loading="lazy" alt="${esc(ex.nome)}" src="${ex.img}"
             onload="this.previousElementSibling.style.display='none'"
             onerror="this.style.display='none'">
      </div>
      <div class="ex__body">
        <div class="ex__head">
          <h3>${esc(ex.nome)}</h3>
          <span class="ex__done-flag">✓</span>
        </div>
        <div class="chips">
          <span class="chip">${esc(ex.grupo)}</span>
          <span class="chip eq">${esc(ex.equip)}</span>
        </div>
        <p class="ex__target"><b>${ex.series} séries</b> • ${alvo}</p>
        ${ex.nota ? `<p class="ex__nota">↳ ${esc(ex.nota)}</p>` : ""}

        <button class="ex__how" data-act="how" aria-expanded="false">
          <span class="arw">▸</span> Como usar o equipamento
        </button>
        <ol class="ex__steps" hidden>${steps}</ol>

        <div class="ex__sug ${sug.up ? "up" : ""}">
          <span class="ic">${sug.up ? "⬆️" : "💡"}</span><span>${sug.text}</span>
        </div>

        <div class="ex__log">
          <div class="field ${showW ? "" : "hide"}">
            <label>${wLabel}</label>
            <input type="number" inputmode="decimal" step="0.5" data-field="w" value="${wVal}" placeholder="${ex.tipo === "corporal" ? "0" : "–"}">
          </div>
          <div class="field">
            <label>${rLabel}</label>
            <input type="number" inputmode="numeric" step="1" data-field="reps" value="${rVal}" placeholder="${ex.repMin}">
          </div>
          <button class="btn-done" data-act="done">✓ Feito</button>
        </div>
      </div>
    </article>`;
  }

  function renderHoje() {
    const day = PLANO[cycle];
    const total = day.ex.length;
    const doneCount = day.ex.filter((id) => draft[id] && draft[id].done).length;
    const pct = Math.round((doneCount / total) * 100);
    const allDone = doneCount === total;

    const hero = `
      <section class="hero">
        <p class="kicker">Treino ${cycle + 1} de ${PLANO.length} • ${esc(day.foco)}</p>
        <h1>${esc(day.nome)}</h1>
        <p class="sub">Treine hoje e marque cada exercício. O app aprende suas cargas.</p>
        <div class="bar"><span style="width:${pct}%"></span></div>
        <div class="count"><span><b>${doneCount}</b> de ${total} feitos</span><span>${pct}%</span></div>
      </section>`;

    const cards = day.ex.map(cardHTML).join("");
    const note = `<p class="note"><b>Dica:</b> a sugestão de carga fica laranja quando você bateu o alvo de reps na última vez — é a hora de subir o peso. Treinar todo dia funciona porque cada dia foca em músculos diferentes; o Dia 7 é leve de propósito.</p>`;

    document.getElementById("view-hoje").innerHTML = hero + cards + note;

    const fb = document.getElementById("finishBtn");
    const proximo = ((cycle + 1) % PLANO.length) + 1;
    fb.textContent = allDone ? `✓ Concluir treino → Dia ${proximo}` : `Avançar para o próximo dia →`;
    fb.classList.toggle("ready", allDone);
    document.getElementById("streak").innerHTML = `🔥 <b>${streak.count || 0}</b> treinos`;
  }

  // ---------- render: PLANO ----------
  function renderPlano() {
    const list = PLANO.map((day, i) => `
      <button class="day-card ${i === cycle ? "current" : ""}" data-act="setday" data-i="${i}">
        <span class="num">${i + 1}</span>
        <span class="info">
          <h3>${esc(day.nome)}</h3>
          <p>${day.ex.length} exercícios • ${esc(day.foco)}</p>
        </span>
        <span class="go">${i === cycle ? "● HOJE" : "abrir"}</span>
      </button>`).join("");
    document.getElementById("view-plano").innerHTML =
      `<section class="hero"><p class="kicker">Seu plano</p><h1>Ciclo de 7 dias</h1><p class="sub">Toque em um dia para treiná-lo agora.</p></section>
       <div class="day-list">${list}</div>
       <a class="reset-link" data-act="reset" href="#">apagar histórico e recomeçar</a>`;
  }

  // ---------- render: EVOLUÇÃO ----------
  function renderEvo() {
    const ids = Object.keys(hist).filter((id) => hist[id] && hist[id].length && EXERCICIOS[id]);
    if (!ids.length) {
      document.getElementById("view-evo").innerHTML =
        `<div class="empty"><div class="big">📈</div>Sem registros ainda.<br>Conclua exercícios na aba <b>Hoje</b> para ver sua evolução aqui.</div>`;
      return;
    }
    const cards = ids.map((id) => {
      const ex = EXERCICIOS[id];
      const h = hist[id];
      const last = h[h.length - 1];
      const prev = h.length > 1 ? h[h.length - 2] : null;
      let trend = '<span class="trend same">—</span>';
      if (prev) {
        const cur = (last.w || 0) * 1000 + last.reps;
        const old = (prev.w || 0) * 1000 + prev.reps;
        if (cur > old) trend = '<span class="trend up">▲ subindo</span>';
        else if (cur < old) trend = '<span class="trend same">▼</span>';
      }
      const pills = h.slice(-6).map((e) => {
        const val = ex.tipo === "tempo" ? `${e.reps}s` : (e.w ? `${fmt(e.w)}kg × ${e.reps}` : `${e.reps} reps`);
        return `<span class="pill">${val}</span>`;
      }).join("");
      return `<div class="evo-card"><h3>${esc(ex.nome)} ${trend}</h3><div class="hist">${pills}</div></div>`;
    }).join("");
    document.getElementById("view-evo").innerHTML =
      `<section class="hero"><p class="kicker">Progresso</p><h1>Sua evolução</h1><p class="sub">Histórico das suas últimas cargas por exercício.</p></section>
       <div class="evo">${cards}</div>`;
  }

  // ---------- abas ----------
  function switchTab(t) {
    document.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === t)));
    document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + t));
    document.getElementById("footbar").style.display = t === "hoje" ? "block" : "none";
    if (t === "plano") renderPlano();
    if (t === "evo") renderEvo();
  }

  function render() { renderHoje(); }

  // ---------- toast ----------
  let toastT;
  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg; el.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2600);
  }

  // ---------- eventos (delegação) ----------
  document.addEventListener("click", (e) => {
    const tab = e.target.closest(".tab");
    if (tab) { switchTab(tab.dataset.tab); return; }

    const act = e.target.closest("[data-act]");
    if (!act) return;
    const kind = act.dataset.act;

    if (kind === "how") {
      const steps = act.nextElementSibling;
      const open = steps.hasAttribute("hidden");
      if (open) steps.removeAttribute("hidden"); else steps.setAttribute("hidden", "");
      act.setAttribute("aria-expanded", String(open));
      return;
    }
    if (kind === "done") {
      const id = act.closest(".ex").dataset.id;
      if (draft[id] && draft[id].done) uncommit(id); else commit(id);
      renderHoje();
      return;
    }
    if (kind === "setday") { setDay(Number(act.dataset.i)); return; }
    if (kind === "reset") { e.preventDefault(); resetTudo(); return; }
  });

  document.addEventListener("input", (e) => {
    const inp = e.target.closest("input[data-field]");
    if (!inp) return;
    const id = inp.closest(".ex").dataset.id;
    const f = inp.dataset.field;
    ensureDraft(id)[f] = inp.value === "" ? "" : Number(inp.value);
    draft[id].done = false;
    LS.set("draft", draft);
    inp.closest(".ex").classList.remove("done");
  });

  document.getElementById("finishBtn").addEventListener("click", finishWorkout);

  // ---------- start ----------
  switchTab("hoje");
  render();

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
