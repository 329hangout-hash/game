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
let goatX = 20;
let targetX;

/* ===== メッセージ ===== */
const messages = [
  '今日はいい流れだよ',
  'その選択、合ってる',
  '無理しなくて大丈夫',
  'ちゃんと前に進んでる'
];

/* ===== 状態変更 ===== */
function setState(next) {
  state = next;

  switch (state) {
    case State.IDLE:
      goat.src = 'assets/goat_idle.png';
      talk.style.display = 'none';
      break;

    case State.APPROACH:
      goat.src = 'assets/goat_approach.png';
      approachGoat();
      break;

    case State.WAIT_FOOD:
      // 何もしない（餌タップ待ち）
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
  targetX = food.offsetLeft - 40;

  function move() {
    goatX += (targetX - goatX) * 0.08;
    goat.style.left = goatX + 'px';

    // ちょい揺れ
    goat.style.transform =
      `translateY(${Math.sin(goatX * 0.1) * 2}px)`;

    if (Math.abs(targetX - goatX) > 1) {
      requestAnimationFrame(move);
    } else {
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
