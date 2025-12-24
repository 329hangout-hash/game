const State = {
  IDLE: 'idle',
  APPROACH: 'approach',
  WAIT_FOOD: 'wait_food',
  EAT: 'eat',
  HAPPY: 'happy',
  TALK: 'talk'
};

let state = State.IDLE;

const goat = document.getElementById('goat');
const food = document.getElementById('food');
const talk = document.getElementById('talk');

const BASE_SCALE = 1.5;
let scale = 0.6 * BASE_SCALE;
const targetScale = 1.0 * BASE_SCALE;

let posX = -60;   // ★ 安全な初期値
let posY = 20;

let sway = 0;
let idleRAF = null;

/* transform統一 */
function applyTransform(extraY = 0) {
  goat.style.transform =
    `translate(-50%, -50%)
     translate(${posX}px, ${posY + extraY}px)
     scale(${scale})`;
}

/* 寝息（小さく） */
function startIdleBreath() {
  function loop() {
    const breath = Math.sin(Date.now() * 0.002) * 1.5;
    applyTransform(breath);
    idleRAF = requestAnimationFrame(loop);
  }
  loop();
}

function stopIdleBreath() {
  cancelAnimationFrame(idleRAF);
  idleRAF = null;
}

/* 状態 */
function setState(next) {
  state = next;

  if (state === State.IDLE) {
    goat.src = 'assets/goat_idle.png';
    scale = 0.6 * BASE_SCALE;
    posX = -60;
    posY = 20;
    applyTransform();
    startIdleBreath();
  }

  if (state === State.APPROACH) {
    stopIdleBreath();
    goat.src = 'assets/goat_approach.png';
    approach();
  }

  if (state === State.WAIT_FOOD) {
    goat.src = 'assets/goat_approach.png';
  }

  if (state === State.EAT) {
    eat();
  }
}

/* 寄ってくる */
function approach() {
  function move() {
    scale += (targetScale - scale) * 0.04;
    posX += (0 - posX) * 0.04;
    posY += (0 - posY) * 0.04;

    applyTransform();

    if (Math.abs(posX) > 0.5) {
      requestAnimationFrame(move);
    } else {
      scale = targetScale;
      posX = 0;
      posY = 0;
      applyTransform();
      setState(State.WAIT_FOOD);
    }
  }
  move();
}

/* 食べる */
function eat() {
  const frames = [
    'assets/goat_eat_1.png',
    'assets/goat_eat_2.png'
  ];
  let i = 0;

  const timer = setInterval(() => {
    goat.src = frames[i % frames.length];
    i++;
  }, 300);

  setTimeout(() => {
    clearInterval(timer);
    goat.src = 'assets/goat_eat_3.png';
  }, 3000);
}

/* イベント */
food.addEventListener('click', () => {
  if (state === State.IDLE) setState(State.APPROACH);
  else if (state === State.WAIT_FOOD) setState(State.EAT);
});

setState(State.IDLE);
