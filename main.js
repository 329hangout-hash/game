/* ===== 状態 ===== */
const State = {
  IDLE: 'idle',
  APPROACH: 'approach',
  WAIT_FOOD: 'wait_food',
  EAT: 'eat',
  HAPPY: 'happy',
  TALK: 'talk'
};

let state = State.IDLE;

/* ===== 要素 ===== */
const goat = document.getElementById('goat');
const food = document.getElementById('food');
const talk = document.getElementById('talk');

/* ===== 初期値 ===== */
const BASE_SCALE = 1.5;        // ★ 全体を1.5倍
let scale = 0.6 * BASE_SCALE; // 遠い
const targetScale = 1.0 * BASE_SCALE;

let sway = 0;

/* ★ 位置 */
let posX = -80;
let posY = -40;
const targetX = 0;
const targetY = 0;

/* ★ IDLE用 */
let idleBreath = 0;
let idleRAF = null;

/* ===== メッセージ ===== */
const messages = [
  '今日はいい流れだよ',
  'その選択、合ってる',
  '無理しなくて大丈夫',
  'ちゃんと前に進んでる'
];

/* ===== transform共通適用 ===== */
function applyTransform(extraY = 0) {
  goat.style.transform =
    `translate(-50%, -50%)
     translate(${posX}px, ${posY + sway + extraY}px)
     scale(${scale})`;
}

/* ===== IDLE 寝息 ===== */
function startIdleBreath() {
  function loop() {
    idleBreath = Math.sin(Date.now() * 0.002) * 4;
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
    case State.IDLE:
      goat.src = 'assets/goat_idle.png';
      talk.style.display = 'none';
      scale = 0.6 * BASE_SCALE;
      sway = 0;
      posX = -80;
      posY = -40;
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

/* ===== 寄ってくる（斜め＋ゆっくり） ===== */
function approachGoat() {
  function move() {
    scale += (targetScale - scale) * 0.04; // ★ スピード調整
    posX += (targetX - posX) * 0.04;
    posY += (targetY - posY) * 0.04;

    sway = Math.sin(Date.now() * 0.006) * 4 * (scale / BASE_SCALE);

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
  eatTimer = setInterval(() => {
    goat.src = eatFrames[eatIndex];
    eatIndex = (eatIndex + 1) % eatFrames.length;
  }, 300);

  setTimeout(() => {
    clearInterval(eatTimer);
    setState(State.HAPPY);
  }, 3000);
}

/* ===== 喋る ===== */
function showTalk() {
  talk.textContent =
    messages[Math.floor(Math.random() * messages.length)];
  talk.style.display = 'block';
}

/* ===== イベント ===== */
food.addEventListener('click', () => {
  if (state === State.IDLE) {
    setState(State.APPROACH);
  } else if (state === State.WAIT_FOOD) {
    setState(State.EAT);
  }
});

/* ===== 開始 ===== */
setState(State.IDLE);
