/* ===== 状態 ===== */
const State = {
  GATE: 'gate',
  IDLE: 'idle',
  APPROACH: 'approach',
  WAIT_FOOD: 'wait_food',
  EAT: 'eat',
  HAPPY: 'happy',
  TALK: 'talk'
};

let state = State.GATE;

/* ===== 要素 ===== */
const goat = document.getElementById('goat');
const food = document.getElementById('food');
const talk = document.getElementById('talk');
const gate = document.getElementById('gate');

/* ===== 初期値 ===== */
const BASE_SCALE = 1.5;
let scale = 0.6 * BASE_SCALE;
const targetScale = 1.0 * BASE_SCALE;

let sway = 0;

/* ===== 位置 ===== */
let posX = -80;
let posY = -40;
const targetX = 0;
const targetY = 0;

/* ===== IDLE用 ===== */
let idleBreath = 0;
let idleRAF = null;

/* ===== メッセージ ===== */
const messages = [
  '今日はいい流れだよ',
  'その選択、合ってる',
  '無理しなくて大丈夫',
  'ちゃんと前に進んでる'
];

/* ===== transform共通 ===== */
function applyTransform(extraY = 0) {
  goat.style.transform =
    `translate(-50%, -50%)
     translate(${posX}px, ${posY + sway + extraY}px)
     scale(${scale})`;
}

/* ===== IDLE 寝息 ===== */
function startIdleBreath() {
  function loop() {
    idleBreath = Math.sin(Date.now() * 0.002) * 2;
    applyTransform(idleBreath);
    idleRAF = requestAnimationFrame(loop);
  }
  loop();
}

function stopIdleBreath() {
  if (idleRAF) {
    cancelAnimationFrame(idleRAF);
    idleRAF = null;
  }
}

/* ===== 状態変更 ===== */
function setState(next) {
  state = next;

  switch (state) {
    case State.GATE:
      gate.style.display = 'block';
      gate.style.opacity = '1';
      gate.src = 'assets/gate_closed.png';

      food.style.display = 'none';
      startIdleBreath();
      break;

    case State.IDLE:
      gate.style.display = 'none';

      goat.src = 'assets/goat_idle.png';
      talk.style.display = 'none';

      scale = 0.6 * BASE_SCALE;
      posX = -80;
      posY = -40;
      sway = 0;

      food.style.display = 'block';
      food.style.pointerEvents = 'auto';
      food.style.left = '50%';
      food.style.bottom = '40px';
      food.style.top = 'auto';
      food.style.transform = 'translateX(-50%)';

      startIdleBreath();
      break;

    case State.APPROACH:
      stopIdleBreath();
      goat.src = 'assets/goat_approach.png';
      approachGoat();
      break;

    case State.WAIT_FOOD:
      goat.src = 'assets/goat_approach.png';
      break;

    case State.EAT:
      startEatAnimation();
      break;

    case State.HAPPY:
      goat.src = 'assets/goat_happy.png';
      setTimeout(() => setState(State.TALK), 1000);
      break;

    case State.TALK:
      showTalk();
      break;
  }
}

/* ===== 柵タップ ===== */
gate.addEventListener('click', () => {
  if (state !== State.GATE) return;

  gate.src = 'assets/gate_open.png';

  setTimeout(() => {
    gate.style.opacity = '0';

    setTimeout(() => {
      setState(State.APPROACH);
    }, 500);
  }, 300);
});

/* ===== 寄ってくる ===== */
function approachGoat() {
  function move() {
    scale += (targetScale - scale) * 0.04;
    posX += (targetX - posX) * 0.04;
    posY += (targetY - posY) * 0.04;

    sway = Math.sin(Date.now() * 0.006) * 3 * (scale / BASE_SCALE);
    applyTransform();

    if (
      Math.abs(targetScale - scale) > 0.01 ||
      Math.abs(targetX - posX) > 0.5 ||
      Math.abs(targetY - posY) > 0.5
    ) {
      requestAnimationFrame(move);
    } else {
      scale = targetScale;
      posX = targetX;
      posY = targetY;
      sway = 0;
      applyTransform();
      setState(State.WAIT_FOOD);
    }
  }
  move();
}

/* ===== 食べる ===== */
const eatFrames = [
  'assets/goat_eat_1.png',
  'assets/goat_eat_2.png'
];
let eatIndex = 0;
let eatTimer;

function startEatAnimation() {
  eatIndex = 0;

  eatTimer = setInterval(() => {
    goat.src = eatFrames[eatIndex];
    eatIndex = (eatIndex + 1) % eatFrames.length;
  }, 300);

  setTimeout(() => {
    clearInterval(eatTimer);
    goat.src = 'assets/goat_eat_3.png';

    setTimeout(() => {
      setState(State.HAPPY);
    }, 600);
  }, 3000);
}

/* ===== 喋る ===== */
function showTalk() {
  talk.textContent =
    messages[Math.floor(Math.random() * messages.length)];
  talk.style.display = 'block';

  setTimeout(() => {
    setState(State.GATE);
  }, 2500);
}

/* ===== 開始 ===== */
setState(State.GATE);
