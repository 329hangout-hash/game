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

/* ===== 睡眠演出用 ===== */
let sleepTimer = null;

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

/* ===== IDLE 呼吸 ===== */
function startIdleBreath() {
  stopIdleBreath();
  function loop() {
    idleBreath = Math.sin(Date.now() * 0.002) * 1;
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

/* ===== 睡眠演出（GATE専用） ===== */
function startSleepSequence() {
  clearTimeout(sleepTimer);
  goat.src = 'assets/goat_sleep.png';

  function loop() {
    if (state !== State.GATE) return;

    const r = Math.random();
    let img = null;
    let dur = 800;

    if (r < 0.05) {
      img = 'assets/goat_yawn.png'; dur = 1400;
    } else if (r < 0.15) {
      img = 'assets/goat_eye.png'; dur = 1000;
    } else if (r < 0.4) {
      img = 'assets/goat_ear.png'; dur = 800;
    }

    if (img) {
      goat.src = img;
      sleepTimer = setTimeout(() => {
        if (state === State.GATE) goat.src = 'assets/goat_sleep.png';
        sleepTimer = setTimeout(loop, 2500);
      }, dur);
    } else {
      sleepTimer = setTimeout(loop, 2500);
    }
  }

  sleepTimer = setTimeout(loop, 2000);
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
      stopIdleBreath();
      startSleepSequence();
      break;

    case State.APPROACH:
      clearTimeout(sleepTimer);       // ★ 睡眠完全停止
      stopIdleBreath();
      goat.src = 'assets/goat_approach.png';
      approachGoat();
      break;

    case State.IDLE:
      clearTimeout(sleepTimer);       // ★ 念押し
      gate.style.display = 'none';
      goat.src = 'assets/goat_idle.png';
      talk.style.display = 'none';

      scale = 0.6 * BASE_SCALE;
      posX = -80;
      posY = -40;
      sway = 0;

      food.style.display = 'block';
      food.style.left = '50%';
      food.style.bottom = '60px';
      food.style.transform = 'translateX(-50%)';

      startIdleBreath();
      enableFoodDrag();
      break;

    case State.EAT:
      startEatAnimation();
      break;

    case State.HAPPY:
      goat.src = 'assets/goat_eat_3.png';
      setTimeout(() => setState(State.TALK), 800);
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
    setTimeout(() => setState(State.APPROACH), 500);
  }, 800);
});

/* ===== 近づく ===== */
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
      setState(State.IDLE);   // ★ ここで寝ない
    }
  }
  move();
}

/* ===== ドラッグ ===== */
let dragging = false;

function enableFoodDrag() {
  food.onpointerdown = e => {
    if (state !== State.IDLE) return;
    dragging = true;
    food.setPointerCapture(e.pointerId);
  };

  window.onpointermove = e => {
    if (!dragging) return;

    food.style.left = e.clientX + 'px';
    food.style.top = e.clientY + 'px';
    food.style.bottom = 'auto';
    food.style.transform = 'translate(-50%, -50%)';

    if (isHit(food, goat)) {
      dragging = false;
      food.style.display = 'none';
      setState(State.EAT);
    }
  };

  window.onpointerup = () => dragging = false;
}

/* ===== 当たり判定 ===== */
function isHit(a, b) {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();
  return !(
    r1.right < r2.left ||
    r1.left > r2.right ||
    r1.bottom < r2.top ||
    r1.top > r2.bottom
  );
}

/* ===== もぐもぐ ===== */
const eatFrames = [
  'assets/goat_eat_1.png',
  'assets/goat_eat_2.png'
];

function startEatAnimation() {
  let c = 0;
  const t = setInterval(() => {
    goat.src = eatFrames[c % 2];
    if (++c >= 6) {
      clearInterval(t);
      setState(State.HAPPY);
    }
  }, 300);
}

/* ===== 会話 ===== */
function showTalk() {
  talk.textContent =
    messages[Math.floor(Math.random() * messages.length)];
  talk.style.display = 'block';

  setTimeout(() => setState(State.GATE), 2500);
}

/* ===== 開始 ===== */
setState(State.GATE);
