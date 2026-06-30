// plan.js — motor inteligente: métricas corporais + geração de plano por objetivo.
// Abordagem moderna: força (preserva/ganha músculo) + condicionamento (queima gordura),
// faixas de reps e descanso ajustados ao objetivo, progressão de carga (no app.js).

const COMPOSTOS = new Set([
  "supino-reto", "supino-inclinado", "supino-halteres", "supino-maquina", "flexao",
  "puxada-alta", "barra-fixa", "remada-curvada", "remada-baixa", "remada-halter",
  "agachamento", "leg-press", "stiff", "afundo", "agachamento-halter",
  "desenvolvimento", "desenvolvimento-halter", "desenvolvimento-maquina", "mergulho"
]);

// Esquema de séries/reps/descanso por objetivo (s = segundos de descanso)
function repScheme(objetivo, composto) {
  if (objetivo === "hipertrofia")
    return composto ? { sets: 4, repMin: 6, repMax: 10, descanso: 120 } : { sets: 3, repMin: 10, repMax: 15, descanso: 75 };
  if (objetivo === "emagrecimento")
    return composto ? { sets: 3, repMin: 10, repMax: 15, descanso: 60 } : { sets: 3, repMin: 12, repMax: 20, descanso: 40 };
  // ambos (recomposição)
  return composto ? { sets: 4, repMin: 8, repMax: 12, descanso: 90 } : { sets: 3, repMin: 12, repMax: 15, descanso: 60 };
}

function slot(objetivo, exId) {
  const ex = EXERCICIOS[exId];
  if (!ex) return { exId, sets: 3, repMin: 10, repMax: 12, descanso: 60 };
  if (ex.tipo !== "carga") return { exId, sets: ex.series, repMin: ex.repMin, repMax: ex.repMax, descanso: 40 };
  const s = repScheme(objetivo, COMPOSTOS.has(exId));
  return { exId, sets: s.sets, repMin: s.repMin, repMax: s.repMax, descanso: s.descanso };
}

// Gera o plano (lista de dias) a partir do perfil.
function gerarPlano(p) {
  const o = p && p.objetivo ? p.objetivo : "ambos";
  const dias = Math.min(6, Math.max(3, Number(p && p.dias) || 4));
  const S = (id) => slot(o, id);
  const fin = o === "emagrecimento" ? [S("mountain-climber"), S("russian-twist")]
    : o === "ambos" ? [S("mountain-climber")] : [];
  const comFin = (slots) => (o === "hipertrofia" ? slots : slots.concat(fin));

  const D = {
    fullA: { nome: "Full body A", foco: "Corpo todo", slots: [S("agachamento"), S("supino-reto"), S("remada-curvada"), S("desenvolvimento"), S("rosca-direta"), S("abdominal-supra")] },
    fullB: { nome: "Full body B", foco: "Corpo todo", slots: [S("leg-press"), S("supino-inclinado"), S("puxada-alta"), S("elevacao-lateral"), S("triceps-corda"), S("prancha")] },
    fullC: { nome: "Full body C", foco: "Corpo todo", slots: [S("stiff"), S("crossover"), S("remada-baixa"), S("desenvolvimento-halter"), S("rosca-martelo"), S("elevacao-pernas")] },
    push: { nome: "Empurrar", foco: "Peito, ombro e tríceps", slots: [S("supino-reto"), S("supino-inclinado"), S("desenvolvimento"), S("elevacao-lateral"), S("triceps-corda"), S("triceps-testa")] },
    pull: { nome: "Puxar", foco: "Costas e bíceps", slots: [S("puxada-alta"), S("remada-curvada"), S("remada-baixa"), S("face-pull"), S("rosca-direta"), S("rosca-martelo")] },
    legs: { nome: "Pernas", foco: "Inferiores", slots: [S("agachamento"), S("leg-press"), S("cadeira-extensora"), S("mesa-flexora"), S("stiff"), S("panturrilha-pe")] },
    upper: { nome: "Superior", foco: "Corpo de cima", slots: [S("supino-inclinado"), S("remada-baixa"), S("desenvolvimento-halter"), S("puxada-alta"), S("rosca-direta"), S("triceps-corda")] },
    lower: { nome: "Inferior", foco: "Pernas e glúteos", slots: [S("agachamento"), S("afundo"), S("cadeira-extensora"), S("mesa-flexora"), S("panturrilha-sentado"), S("panturrilha-pe")] }
  };

  let dist;
  if (dias === 3) dist = [D.fullA, D.fullB, D.fullC];
  else if (dias === 4) dist = [D.upper, D.lower, D.push, D.legs];
  else if (dias === 5) dist = [D.push, D.pull, D.legs, D.upper, D.lower];
  else dist = [D.push, D.pull, D.legs, D.upper, D.lower, D.fullA];

  return dist.map((d) => ({ nome: d.nome, foco: d.foco, slots: comFin(d.slots) }));
}

// Métricas: IMC, BMR (Mifflin-St Jeor), TDEE, meta calórica, proteína, água.
function calcMetricas(p) {
  const w = Number(p.peso), h = Number(p.altura), a = Number(p.idade), fem = p.sexo === "F";
  if (!w || !h || !a) return null;
  const imc = w / Math.pow(h / 100, 2);
  const bmr = 10 * w + 6.25 * h - 5 * a + (fem ? -161 : 5);
  const fator = ({ 3: 1.375, 4: 1.46, 5: 1.55, 6: 1.725 })[Math.min(6, Math.max(3, Number(p.dias) || 4))] || 1.5;
  const tdee = bmr * fator;

  let meta, descMeta;
  if (p.objetivo === "emagrecimento") { meta = tdee - 500; descMeta = "déficit p/ perder gordura"; }
  else if (p.objetivo === "hipertrofia") { meta = tdee + 250; descMeta = "leve superávit p/ ganhar músculo"; }
  else { meta = tdee - 250; descMeta = "recomposição (leve déficit)"; }

  const proteina = Math.round(w * (p.objetivo === "hipertrofia" ? 1.8 : 2.0));
  const agua = (w * 35) / 1000;
  const imcCat = imc < 18.5 ? "abaixo do peso" : imc < 25 ? "peso normal" : imc < 30 ? "sobrepeso" : "obesidade";

  return {
    imc: imc.toFixed(1), imcCat,
    bmr: Math.round(bmr), tdee: Math.round(tdee),
    meta: Math.round(meta), descMeta,
    proteina, agua: agua.toFixed(1)
  };
}
