const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* ===== 画面リサイズ ===== */
function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

/* ===== 画像 ===== */
const goatImg = new Image();
goatImg.src = "goat.png";

const groundImg = new Image();
groundImg.src = "ground.png";

/* ===== 定数 ===== */
const GRAVITY = 0.6;
const JUMP_POWER = 14;
const SIDE_POWER = 6;

/* ===== プレイヤー（ヤギ）===== */
const player = {
  x: canvas.width / 2 - 45,
  y: canvas.height - 120,
  w: 90,
  h: 90,
  vx: 0,
  vy: 0
};

/* ===== 地面 ===== */
const ground = {
  x: 0,
  y: canvas.height - 60,
  w: canvas.width,
  h: 60
};

/* ===== 足場 ===== */
let platforms = [];
for (let i = 0; i < 6; i++) {
  platforms.push({
    x: Math.random() * (canvas.width - 80),
    y: canvas.height - 150 - i * 120,
    w: 80,
    h: 15
  });
}

let cameraY = 0;
let score = 0;
let gameOver = false;

/* ===== タップ操作 ===== */
let lastTapTime = 0;
let tapTimer = null;

canvas.addEventListener(
  "touchstart",
  e => {
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    const now = Date.now();
    const isLeft = touchX < canvas.width / 2;

    if (now - lastTapTime < 250) {
      clearTimeout(tapTimer);
      jump(isLeft ? "left" : "right");
    } else {
      tapTimer = setTimeout(() => {
        jump("up");
      }, 250);
    }
    lastTapTime = now;
  },
  { passive: false }
);

function jump(type) {
  player.vy = -JUMP_POWER;
  if (type === "left") player.vx = -SIDE_POWER;
  if (type === "right") player.vx = SIDE_POWER;
  if (type === "up") player.vx = 0;
}

/* ===== 更新処理 ===== */
function update() {
  if (gameOver) return;

  player.vy += GRAVITY;
  player.x += player.vx;
  player.y += player.vy;

  /* 画面端 */
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) {
    player.x = canvas.width - player.w;
  }

  /* 地面判定 */
  if (
    player.vy > 0 &&
    player.y + player.h > ground.y
  ) {
    player.y = ground.y - player.h;
    player.vy = 0;
  }

  /* 足場判定（上からのみ） */
  platforms.forEach(p => {
    if (
      player.vy > 0 &&
      player.x < p.x + p.w &&
      player.x + player.w > p.x &&
      player.y + player.h > p.y &&
      player.y + player.h < p.y + p.h + 10
    ) {
      player.y = p.y - player.h;
      player.vy = 0;
    }
  });

  /* スクロール */
  if (player.y < canvas.height / 3) {
    const diff = canvas.height / 3 - player.y;
    player.y = canvas.height / 3;
    cameraY += diff;
    score += Math.floor(diff);

    platforms.forEach(p => (p.y += diff));

    while (platforms.length < 8) {
      platforms.push({
        x: Math.random() * (canvas.width - 80),
        y: -Math.random() * 120,
        w: 80,
        h: 15
      });
    }
  }

  /* 落下でゲームオーバー */
  if (player.y > canvas.height) gameOver = true;
}

/* ===== 描画 ===== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* 地面 */
  ctx.drawImage(groundImg, ground.x, ground.y, ground.w, ground.h);

  /* ヤギ */
  ctx.drawImage(goatImg, player.x, player.y, player.w, player.h);

  /* 足場 */
  ctx.fillStyle = "#8b5a2b";
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

  /* スコア */
  ctx.fillStyle = "#000";
  ctx.font = "16px sans-serif";
  ctx.fillText("HEIGHT: " + score, 10, 20);

  if (gameOver) {
    ctx.font = "32px sans-serif";
    ctx.fillText(
      "GAME OVER",
      canvas.width / 2 - 90,
      canvas.height / 2
    );
  }
}

/* ===== ループ ===== */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
