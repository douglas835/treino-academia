// data.js — Base de exercícios e plano de 7 dias
// Fotos: free-exercise-db (CDN jsDelivr). Instruções em PT-BR.

const IMG = "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/";

// tipo: 'carga' (peso+reps) | 'corporal' (reps, carga opcional) | 'tempo' (segundos)
const EXERCICIOS = {
  // ---------- PEITO / TRÍCEPS ----------
  "supino-reto": {
    nome: "Supino reto com barra", grupo: "Peito", equip: "Barra", tipo: "carga",
    img: IMG + "Barbell_Bench_Press_-_Medium_Grip/0.jpg",
    series: 4, repMin: 6, repMax: 8, inc: 2.5,
    como: [
      "Deite no banco com os pés firmes no chão e as escápulas retraídas (peito estufado).",
      "Pegada um pouco mais larga que os ombros. Tire a barra do apoio com os braços estendidos.",
      "Desça controlando até tocar de leve a linha do mamilo. Cotovelos a ~45°, não abertos a 90°.",
      "Empurre a barra para cima sem travar bruscamente os cotovelos. Mantenha o glúteo no banco."
    ]
  },
  "supino-inclinado": {
    nome: "Supino inclinado com halteres", grupo: "Peito", equip: "Halteres", tipo: "carga",
    img: IMG + "Incline_Dumbbell_Press/0.jpg",
    series: 4, repMin: 8, repMax: 10, inc: 2.5,
    como: [
      "Banco inclinado a 30–45°. Halteres apoiados nas coxas, suba-os ao deitar.",
      "Comece com os halteres na altura do peito alto, cotovelos abaixo dos punhos.",
      "Empurre para cima aproximando levemente os halteres, sem batê-los.",
      "Desça devagar até sentir o peito alongar. Não deixe os ombros 'enrolarem' à frente."
    ]
  },
  "crucifixo-maquina": {
    nome: "Crucifixo na máquina (peck deck)", grupo: "Peito", equip: "Máquina", tipo: "carga",
    img: IMG + "Butterfly/0.jpg",
    series: 3, repMin: 12, repMax: 15, inc: 2.5,
    como: [
      "Ajuste o banco para que as alças fiquem na linha do peito.",
      "Costas e cabeça apoiadas, cotovelos levemente flexionados e fixos.",
      "Junte os braços à frente apertando o peito por 1 segundo.",
      "Volte controlando, sem deixar o peso bater. Não force além da linha dos ombros."
    ]
  },
  "crossover": {
    nome: "Cross-over na polia", grupo: "Peito", equip: "Polia", tipo: "carga",
    img: IMG + "Cable_Crossover/0.jpg",
    series: 3, repMin: 12, repMax: 15, inc: 2.5,
    como: [
      "Polias na altura alta. Um pé à frente, tronco levemente inclinado para frente.",
      "Cotovelos semi-flexionados e fixos durante todo o movimento.",
      "Traga as mãos para baixo e à frente, cruzando levemente, apertando o peito.",
      "Retorne devagar abrindo os braços até sentir o alongamento."
    ]
  },
  "triceps-corda": {
    nome: "Tríceps na polia (corda)", grupo: "Tríceps", equip: "Polia", tipo: "carga",
    img: IMG + "Triceps_Pushdown_-_Rope_Attachment/0.jpg",
    series: 3, repMin: 10, repMax: 12, inc: 2.5,
    como: [
      "Cotovelos colados ao corpo, tronco levemente à frente.",
      "Empurre a corda para baixo e, no final, afaste as pontas abrindo as mãos.",
      "Estenda totalmente sem mexer os cotovelos do lugar.",
      "Suba controlando até os antebraços passarem da paralela."
    ]
  },
  "triceps-testa": {
    nome: "Tríceps testa (barra W)", grupo: "Tríceps", equip: "Barra W", tipo: "carga",
    img: IMG + "EZ-Bar_Skullcrusher/0.jpg",
    series: 3, repMin: 10, repMax: 12, inc: 2.5,
    como: [
      "Deitado, barra W acima do peito com braços estendidos.",
      "Flexione só os cotovelos, descendo a barra em direção à testa/topo da cabeça.",
      "Mantenha os cotovelos apontados para o teto, não deixe abrir para os lados.",
      "Estenda de volta sem travar com força. Comece leve para proteger o cotovelo."
    ]
  },
  "mergulho": {
    nome: "Mergulho nas paralelas (dips)", grupo: "Tríceps", equip: "Peso corporal", tipo: "corporal",
    img: IMG + "Dips_-_Triceps_Version/0.jpg",
    series: 3, repMin: 8, repMax: 12, inc: 0,
    nota: "Tronco mais ereto = foco no tríceps.",
    como: [
      "Apoie-se nas barras paralelas com os braços estendidos, tronco quase vertical.",
      "Desça flexionando os cotovelos para trás, até ~90°.",
      "Suba empurrando, contraindo o tríceps. Evite balançar.",
      "Sem força ainda? Use a máquina assistida ou apoie os pés no chão."
    ]
  },

  // ---------- COSTAS / BÍCEPS ----------
  "puxada-alta": {
    nome: "Puxada alta (pulldown)", grupo: "Costas", equip: "Polia", tipo: "carga",
    img: IMG + "Wide-Grip_Lat_Pulldown/0.jpg",
    series: 4, repMin: 8, repMax: 12, inc: 2.5,
    como: [
      "Pegada um pouco mais larga que os ombros, joelhos travados sob o apoio.",
      "Peito estufado, puxe a barra até a parte alta do peito levando os cotovelos para baixo.",
      "Aperte as costas no final, não use impulso do tronco.",
      "Suba controlando até os braços quase estenderem."
    ]
  },
  "barra-fixa": {
    nome: "Barra fixa", grupo: "Costas", equip: "Peso corporal", tipo: "corporal",
    img: IMG + "Pullups/0.jpg",
    series: 3, repMin: 6, repMax: 10, inc: 0,
    nota: "Use a máquina assistida se ainda não fizer livre.",
    como: [
      "Pegada pronada, mãos na largura dos ombros.",
      "Puxe levando o peito em direção à barra, cotovelos para baixo.",
      "Suba até o queixo passar a barra, desça controlando até estender.",
      "Evite balançar as pernas; mantenha o core firme."
    ]
  },
  "remada-curvada": {
    nome: "Remada curvada com barra", grupo: "Costas", equip: "Barra", tipo: "carga",
    img: IMG + "Bent_Over_Barbell_Row/0.jpg",
    series: 4, repMin: 8, repMax: 10, inc: 2.5,
    como: [
      "Joelhos semiflexionados, tronco inclinado ~45°, coluna neutra (não curve as costas).",
      "Barra pendurada, puxe em direção ao umbigo levando os cotovelos para trás.",
      "Aperte as escápulas no topo, desça controlando.",
      "Não use impulso das pernas; mantenha o abdômen contraído."
    ]
  },
  "remada-baixa": {
    nome: "Remada baixa na polia", grupo: "Costas", equip: "Polia", tipo: "carga",
    img: IMG + "Seated_Cable_Rows/0.jpg",
    series: 3, repMin: 10, repMax: 12, inc: 2.5,
    como: [
      "Sentado, joelhos levemente flexionados, coluna ereta.",
      "Puxe o triângulo até o abdômen, cotovelos rentes ao corpo.",
      "Aperte as costas, ombros para trás e para baixo.",
      "Retorne controlando, sem deixar o tronco ir muito à frente."
    ]
  },
  "rosca-direta": {
    nome: "Rosca direta com barra", grupo: "Bíceps", equip: "Barra", tipo: "carga",
    img: IMG + "Barbell_Curl/0.jpg",
    series: 3, repMin: 10, repMax: 12, inc: 2.5,
    como: [
      "Em pé, cotovelos colados ao tronco, pegada na largura dos ombros.",
      "Suba a barra flexionando só os cotovelos, sem balançar o corpo.",
      "Aperte o bíceps no topo, desça devagar até estender.",
      "Não jogue o quadril para frente para 'roubar' o movimento."
    ]
  },
  "rosca-martelo": {
    nome: "Rosca martelo", grupo: "Bíceps", equip: "Halteres", tipo: "carga",
    img: IMG + "Hammer_Curls/0.jpg",
    series: 3, repMin: 10, repMax: 12, inc: 2,
    como: [
      "Halteres ao lado do corpo, palmas viradas uma para a outra (pegada neutra).",
      "Suba flexionando o cotovelo mantendo o punho firme (como um martelo).",
      "Cotovelos fixos ao lado do tronco.",
      "Desça controlando. Pode alternar os braços ou subir juntos."
    ]
  },

  // ---------- PERNAS ----------
  "agachamento": {
    nome: "Agachamento livre", grupo: "Pernas", equip: "Barra", tipo: "carga",
    img: IMG + "Barbell_Full_Squat/0.jpg",
    series: 4, repMin: 6, repMax: 8, inc: 5,
    como: [
      "Barra apoiada no trapézio (não no pescoço). Pés na largura dos ombros, pontas levemente para fora.",
      "Desça empurrando o quadril para trás, joelhos na direção dos pés, peito erguido.",
      "Desça até a coxa ficar paralela ao chão (ou um pouco abaixo, se tiver mobilidade).",
      "Suba empurrando o chão com o meio do pé. Use a gaiola/segurança sempre."
    ]
  },
  "leg-press": {
    nome: "Leg press 45°", grupo: "Pernas", equip: "Máquina", tipo: "carga",
    img: IMG + "Leg_Press/0.jpg",
    series: 4, repMin: 10, repMax: 12, inc: 5,
    como: [
      "Pés na plataforma na largura dos ombros, lombar totalmente apoiada.",
      "Destrave e desça controlando até os joelhos chegarem perto do peito (~90°).",
      "Não deixe a lombar descolar do encosto na descida.",
      "Empurre sem travar os joelhos com força no topo."
    ]
  },
  "cadeira-extensora": {
    nome: "Cadeira extensora", grupo: "Pernas", equip: "Máquina", tipo: "carga",
    img: IMG + "Leg_Extensions/0.jpg",
    series: 3, repMin: 12, repMax: 15, inc: 2.5,
    como: [
      "Ajuste o encosto para o joelho ficar alinhado ao eixo da máquina.",
      "Rolo apoiado logo acima do pé/tornozelo.",
      "Estenda os joelhos contraindo o quadríceps, segure 1s no topo.",
      "Desça controlando, sem deixar o peso bater."
    ]
  },
  "mesa-flexora": {
    nome: "Mesa flexora (deitada)", grupo: "Pernas", equip: "Máquina", tipo: "carga",
    img: IMG + "Lying_Leg_Curls/0.jpg",
    series: 3, repMin: 10, repMax: 12, inc: 2.5,
    como: [
      "Deitado de bruços, rolo logo acima do calcanhar.",
      "Flexione os joelhos trazendo o calcanhar em direção ao glúteo.",
      "Contraia o posterior da coxa no topo.",
      "Volte controlando sem estender totalmente de forma brusca."
    ]
  },
  "stiff": {
    nome: "Levantamento terra romeno (stiff)", grupo: "Pernas", equip: "Barra", tipo: "carga",
    img: IMG + "Romanian_Deadlift/0.jpg",
    series: 3, repMin: 8, repMax: 10, inc: 5,
    como: [
      "Em pé, barra próxima às coxas, joelhos levemente flexionados (fixos).",
      "Empurre o quadril para trás descendo a barra rente às pernas.",
      "Mantenha a coluna neutra (peito aberto) — sinta o posterior alongar.",
      "Suba estendendo o quadril, apertando glúteo no final. Não arredonde as costas."
    ]
  },
  "afundo": {
    nome: "Afundo com halteres", grupo: "Pernas", equip: "Halteres", tipo: "carga",
    img: IMG + "Dumbbell_Lunges/0.jpg",
    series: 3, repMin: 10, repMax: 12, inc: 2.5,
    nota: "Reps por perna.",
    como: [
      "Halteres ao lado do corpo, tronco ereto.",
      "Dê um passo à frente e desça até o joelho de trás quase tocar o chão.",
      "Joelho da frente alinhado ao pé, não passa muito da ponta do pé.",
      "Empurre de volta. Alterne as pernas ou faça todas de um lado e depois do outro."
    ]
  },
  "panturrilha-pe": {
    nome: "Panturrilha em pé", grupo: "Pernas", equip: "Máquina", tipo: "carga",
    img: IMG + "Standing_Calf_Raises/0.jpg",
    series: 4, repMin: 12, repMax: 15, inc: 5,
    como: [
      "Ponta dos pés na plataforma, calcanhares livres.",
      "Suba o máximo na ponta dos pés, contraindo a panturrilha 1s.",
      "Desça devagar até sentir o alongamento embaixo.",
      "Amplitude completa vale mais que carga exagerada."
    ]
  },
  "panturrilha-sentado": {
    nome: "Panturrilha sentado", grupo: "Pernas", equip: "Máquina", tipo: "carga",
    img: IMG + "Seated_Calf_Raise/0.jpg",
    series: 3, repMin: 15, repMax: 20, inc: 2.5,
    como: [
      "Joelhos sob o apoio, ponta dos pés na plataforma.",
      "Eleve os calcanhares ao máximo, segure no topo.",
      "Desça controlando até o alongamento total.",
      "Movimento lento, sem balançar."
    ]
  },

  // ---------- OMBROS ----------
  "desenvolvimento": {
    nome: "Desenvolvimento militar", grupo: "Ombros", equip: "Barra", tipo: "carga",
    img: IMG + "Standing_Military_Press/0.jpg",
    series: 4, repMin: 8, repMax: 10, inc: 2.5,
    como: [
      "Barra na altura da clavícula, pegada um pouco mais larga que os ombros.",
      "Abdômen e glúteo firmes (não arquear demais a lombar).",
      "Empurre a barra para cima passando a cabeça, até estender os braços.",
      "Desça controlando de volta à clavícula. Pode fazer sentado para mais estabilidade."
    ]
  },
  "desenvolvimento-halter": {
    nome: "Desenvolvimento com halteres", grupo: "Ombros", equip: "Halteres", tipo: "carga",
    img: IMG + "Dumbbell_Shoulder_Press/0.jpg",
    series: 3, repMin: 10, repMax: 12, inc: 2,
    como: [
      "Sentado com encosto, halteres na altura das orelhas, cotovelos abaixo dos punhos.",
      "Empurre para cima aproximando levemente os halteres no topo.",
      "Não trave os cotovelos com força.",
      "Desça controlando até a altura das orelhas."
    ]
  },
  "elevacao-lateral": {
    nome: "Elevação lateral", grupo: "Ombros", equip: "Halteres", tipo: "carga",
    img: IMG + "Side_Lateral_Raise/0.jpg",
    series: 4, repMin: 12, repMax: 15, inc: 2,
    como: [
      "Em pé, halteres ao lado do corpo, cotovelos levemente flexionados.",
      "Eleve os braços para os lados até a altura dos ombros (forma de T).",
      "Lidere o movimento com os cotovelos, não com as mãos.",
      "Desça devagar. Use carga leve — o segredo é a execução."
    ]
  },
  "elevacao-frontal": {
    nome: "Elevação frontal", grupo: "Ombros", equip: "Halteres", tipo: "carga",
    img: IMG + "Front_Dumbbell_Raise/0.jpg",
    series: 3, repMin: 12, repMax: 15, inc: 2,
    como: [
      "Halteres à frente das coxas, palmas para baixo.",
      "Eleve um (ou os dois) braço(s) à frente até a altura dos ombros.",
      "Cotovelos quase estendidos, sem balançar o tronco.",
      "Desça controlando."
    ]
  },
  "crucifixo-inverso": {
    nome: "Crucifixo inverso (posterior)", grupo: "Ombros", equip: "Halteres", tipo: "carga",
    img: IMG + "Reverse_Flyes/0.jpg",
    series: 3, repMin: 12, repMax: 15, inc: 2,
    como: [
      "Tronco inclinado à frente (sentado ou em pé), halteres pendurados.",
      "Abra os braços para os lados apertando a parte de trás dos ombros.",
      "Cotovelos levemente flexionados e fixos.",
      "Desça controlando. Carga leve, foco na contração."
    ]
  },
  "face-pull": {
    nome: "Face pull", grupo: "Ombros", equip: "Polia", tipo: "carga",
    img: IMG + "Face_Pull/0.jpg",
    series: 3, repMin: 15, repMax: 15, inc: 2.5,
    nota: "Ótimo para a saúde do ombro e postura.",
    como: [
      "Polia na altura do rosto, corda com pegada neutra.",
      "Puxe a corda em direção ao rosto, abrindo as mãos ao lado das orelhas.",
      "Aperte a parte de trás dos ombros, cotovelos altos.",
      "Volte controlando. Carga leve, movimento limpo."
    ]
  },

  // ---------- CORE / CARDIO ----------
  "abdominal-supra": {
    nome: "Abdominal supra (crunch)", grupo: "Abdômen", equip: "Peso corporal", tipo: "corporal",
    img: IMG + "Crunches/0.jpg",
    series: 3, repMin: 15, repMax: 20, inc: 0,
    como: [
      "Deitado, joelhos flexionados, mãos atrás da cabeça (sem puxar o pescoço).",
      "Eleve os ombros do chão contraindo o abdômen.",
      "Suba na expiração, segure 1s no topo.",
      "Desça controlando, sem relaxar totalmente entre as reps."
    ]
  },
  "elevacao-pernas": {
    nome: "Elevação de pernas na barra", grupo: "Abdômen", equip: "Peso corporal", tipo: "corporal",
    img: IMG + "Hanging_Leg_Raise/0.jpg",
    series: 3, repMin: 10, repMax: 15, inc: 0,
    nota: "Pode fazer no chão (deitado) se preferir.",
    como: [
      "Pendurado na barra, ombros ativos (não totalmente soltos).",
      "Eleve as pernas (joelhos dobrados no início) em direção ao peito.",
      "Contraia o abdômen, evite balançar.",
      "Desça controlando."
    ]
  },
  "prancha": {
    nome: "Prancha isométrica", grupo: "Abdômen", equip: "Peso corporal", tipo: "tempo",
    img: IMG + "Plank/0.jpg",
    series: 3, repMin: 30, repMax: 60, inc: 0,
    como: [
      "Apoie antebraços e pontas dos pés, cotovelos sob os ombros.",
      "Corpo em linha reta: não deixe o quadril cair nem subir.",
      "Contraia abdômen e glúteo, respire normalmente.",
      "Segure pelo tempo alvo. Aumente 10s quando ficar fácil."
    ]
  },
  "russian-twist": {
    nome: "Russian twist", grupo: "Abdômen", equip: "Peso corporal", tipo: "corporal",
    img: IMG + "Russian_Twist/0.jpg",
    series: 3, repMin: 20, repMax: 30, inc: 0,
    nota: "Conte 1 rep a cada toque de cada lado.",
    como: [
      "Sentado, tronco inclinado para trás, pés levantados ou apoiados.",
      "Gire o tronco tocando as mãos (ou uma anilha) ao lado do quadril.",
      "Alterne os lados de forma controlada.",
      "Mantenha o abdômen contraído o tempo todo."
    ]
  },
  "mountain-climber": {
    nome: "Mountain climber", grupo: "Cardio", equip: "Peso corporal", tipo: "tempo",
    img: IMG + "Mountain_Climbers/0.jpg",
    series: 3, repMin: 30, repMax: 45, inc: 0,
    como: [
      "Posição de prancha alta (mãos no chão, braços estendidos).",
      "Traga um joelho em direção ao peito e alterne rapidamente, como se corresse.",
      "Quadril estável, sem subir demais.",
      "Mantenha o ritmo pelo tempo alvo."
    ]
  }
};

// Plano rotativo de 7 dias — treina todos os dias, alternando os grupos.
const PLANO = [
  { nome: "Peito + Tríceps", foco: "Empurrar", ex: ["supino-reto","supino-inclinado","crucifixo-maquina","triceps-corda","triceps-testa","mergulho"] },
  { nome: "Costas + Bíceps", foco: "Puxar", ex: ["puxada-alta","remada-curvada","remada-baixa","barra-fixa","rosca-direta","rosca-martelo"] },
  { nome: "Pernas", foco: "Inferiores", ex: ["agachamento","leg-press","cadeira-extensora","mesa-flexora","stiff","panturrilha-pe"] },
  { nome: "Ombros + Abdômen", foco: "Deltoides e core", ex: ["desenvolvimento","elevacao-lateral","elevacao-frontal","crucifixo-inverso","abdominal-supra","prancha"] },
  { nome: "Superior completo", foco: "Todo o corpo de cima", ex: ["supino-inclinado","remada-baixa","desenvolvimento-halter","puxada-alta","rosca-direta","triceps-corda"] },
  { nome: "Inferior + Panturrilha", foco: "Pernas e glúteos", ex: ["agachamento","afundo","mesa-flexora","cadeira-extensora","panturrilha-sentado","panturrilha-pe"] },
  { nome: "Recuperação ativa", foco: "Core + cardio leve", ex: ["prancha","russian-twist","abdominal-supra","elevacao-pernas","mountain-climber","face-pull"] }
];
