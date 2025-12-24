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
let idleRAF = null;

/* ===== ドラッグ ===== */
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

/* ===== メッセージ ===== */
const messages = [
  '今日はいい流れだよ',
  'その選択、合ってる',
  '無理しなくて大丈夫',
  'ちゃんと前に進んでる'
];

/* ===== transform ===== */
function applyTransform(extraY = 0) {
  goat.style.transform =
    `translate(-50%, -50%)
     translate(${posX}px, ${posY + sway + extraY}px)
     scale(${scale})`;
}

/* ===== 寝息 ===== */
function startIdleBreath() {
  function loop() {
    sway = Math.sin(Date.now() * 0.002) * 2;
    applyTransform();
    idleRAF = requestAnimationFrame(loop);
  }
  loop();
}

function stopIdleBreath() {
  if (idleRAF) cancelAnimationFrame(idleRAF);
  idleRAF = null;
}

/* ===== 状態変更 ===== */
function setState(next) {
  state = next;

  switch (state) {
    case State.IDLE:
      goat.src = 'assets/goat_idle.png';
      talk.style.display = 'none';
      scale = 0.6 * BASE_SCALE;
      posX = -80;
      posY = -40;
      sway = 0;
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

/* ===== 寄ってくる ===== */
function approachGoat() {
  function move() {
    scale += (targetScale - scale) * 0.035;
    posX += (targetX - posX) * 0.035;
    posY += (targetY - posY) * 0.035;

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

function startEatAnimation() {
  let i = 0;
  const timer = setInterval(() => {
    goat.src = eatFrames[i];
    i = (i + 1) % eatFrames.length;
  }, 300);

  setTimeout(() => {
    clearInterval(timer);
    goat.src = 'assets/goat_eat_3.png';
    setTimeout(() => setState(State.HAPPY), 600);
  }, 3000);
}

/* ===== 喋る ===== */
function showTalk() {
  talk.textContent = messages[Math.floor(Math.random() * messages.length)];
  talk.style.display = 'block';
}

/* ===== 餌ドラッグ ===== */
food.addEventListener('mousedown', (e) => {
  if (state === State.IDLE) {
    setState(State.APPROACH);
    return;
  }
  if (state !== State.WAIT_FOOD) return;

  isDragging = true;
  const rect = food.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  food.style.left = `${e.clientX - dragOffsetX}px`;
  food.style.top  = `${e.clientY - dragOffsetY}px`;
});

document.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;

  if (isFoodDroppedOnGoat()) {
    resetFood();
    setState(State.EAT);
  } else {
    resetFood();
  }
});

/* ===== 判定 ===== */
function isFoodDroppedOnGoat() {
  const f = food.getBoundingClientRect();
  const g = goat.getBoundingClientRect();

  return !(f.right < g.left || f.left > g.right || f.bottom < g.top || f.top > g.bottom);
}

function resetFood() {
  food.style.left = '';
  food.style.top  = '';
}

/* ===== 開始 ===== */
setState(State.IDLE);
