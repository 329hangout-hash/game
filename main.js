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
let scale = 0.6;          // 遠い（小さい）
const targetScale = 1.0; // 近い（通常）
let sway = 0;

/* ===== メッセージ ===== */
const messages = [
  '今日はいい流れだよ',
  'その選択、合ってる',
  '無理しなくて大丈夫',
  'ちゃんと前に進んでる'
];

/* ===== transform共通適用 ===== */
function applyTransform() {
  goat.style.transform =
    `translate(-50%, -50%) translateY(${sway}px) scale(${scale})`;
}

/* ===== 状態変更 ===== */
function setState(next) {
  state = next;

  switch (state) {
    case State.IDLE:
      goat.src = 'assets/goat_idle.png';
      talk.style.display = 'none';
      scale = 0.6;
      sway = 0;
      applyTransform();
      break;

    case State.APPROACH:
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

/* ===== 寄ってくる（向き固定・拡大のみ） ===== */
function approachGoat() {
  function move() {
    scale += (targetScale - scale) * 0.08;

    // 近づくほど少し揺れる
    sway = Math.sin(Date.now() * 0.006) * 4 * scale;

    applyTransform();

    if (Math.abs(targetScale - scale) > 0.01) {
      requestAnimationFrame(move);
    } else {
      scale = targetScale;
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
