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
    case State.IDLE:
      goat.src = 'assets/goat_idle.png';
      talk.style.display = 'none';

      scale = 0.6 * BASE_SCALE;
      posX = -80;
      posY = -40;
      sway = 0;

      // ★ 餌を復活
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

/* ===== 寄ってくる ===== */
function approachGoat() {
  function move() {
    scale += (targetScale - scale) * 0.04;
    posX += (targetX - posX) * 0.04;
    posY += (targetY - posY) * 0.04;

    sway =
      Math.sin(Date.now() * 0.006) *
      3 *
      (scale / BASE_SCALE);

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

  // ★ 喋り終わったら自動でIDLEへ
  setTimeout(() => {
    setState(State.IDLE);
  }, 2500);
}

/* ===== ドラッグ処理 ===== */
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

food.addEventListener('mousedown', startDrag);
food.addEventListener('touchstart', startDrag);

function startDrag(e) {
  if (state !== State.WAIT_FOOD || isDragging) return;

  isDragging = true;

  const rect = food.getBoundingClientRect();
  const point = e.touches ? e.touches[0] : e;

  dragOffsetX = point.clientX - rect.left;
  dragOffsetY = point.clientY - rect.top;

  food.style.cursor = 'grabbing';
}

window.addEventListener('mousemove', onDrag);
window.addEventListener('touchmove', onDrag, { passive: false });

function onDrag(e) {
  if (!isDragging) return;

  if (e.touches) e.preventDefault();

  const point = e.touches ? e.touches[0] : e;

  food.style.left = `${point.clientX - dragOffsetX}px`;
  food.style.top = `${point.clientY - dragOffsetY}px`;
  food.style.bottom = 'auto';
  food.style.transform = 'none';
}

window.addEventListener('mouseup', endDrag);
window.addEventListener('touchend', endDrag);

function endDrag() {
  if (!isDragging) return;
  isDragging = false;

  food.style.cursor = 'pointer';

  const foodRect = food.getBoundingClientRect();
  const goatRect = goat.getBoundingClientRect();

  const isNearGoat =
    foodRect.left < goatRect.right &&
    foodRect.right > goatRect.left &&
    foodRect.top < goatRect.bottom &&
    foodRect.bottom > goatRect.top;

  if (isNearGoat && state === State.WAIT_FOOD) {
    food.style.display = 'none';
    food.style.pointerEvents = 'none'; // ★ 二重発火防止
    setState(State.EAT);
  } else {
    food.style.left = '50%';
    food.style.bottom = '40px';
    food.style.top = 'auto';
    food.style.transform = 'translateX(-50%)';
  }
}

/* ===== クリック（起こす用） ===== */
food.addEventListener('click', () => {
  if (state === State.IDLE) {
    setState(State.APPROACH);
  }
});

/* ===== 開始 ===== */
setState(State.IDLE);
