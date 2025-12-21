const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* ===== リサイズ ===== */
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
const GRAVITY = 0.7;
const JUMP_POWER = 15;
const SCROLL_SPEED = 4;

/* ===== プレイヤー ===== */
const player = {
  x: canvas.width * 0.2,
  y: canvas.height - 140,
  w: 80,
  h: 80,
  vy: 0
};

/* ===== 地面 ===== */
const ground = {
  y: canvas.height - 60,
  h: 60
};

/* ===== 足場 ===== */
let platforms = [];
function spawnPlatform(x) {
  platforms.push({
    x: x,
    y: canvas.height - 160 - Math.random() * 200,
    w: 120,
    h: 16
  });
}

// 初期足場
for (let i = 0; i < 6; i++) {
  spawnPlatform(400 + i * 250);
}

let isOnGround = false;
let gameOver = false;
let distance = 0;

/* ===== 操作 ===== */
canvas.addEventListener(
  "touchstart",
  e => {
    e.preventDefault();
    if (isOnGround && !gameOver) {
      player.vy = -JUMP_POWER;
      isOnGround = false;
    }
  },
  { passive: false }
);

/* ===== 更新 ===== */
function update() {
  if (gameOver) return;

  isOnGround = false;

  // 重力
  player.vy += GRAVITY;
  player.y += player.vy;

  /* 地面 */
  if (player.y + player.h > ground.y) {
    player.y = ground.y - player.h;
    player.vy = 0;
    isOnGround = true;
  }

  /* 足場 */
  platforms.forEach(p => {
    if (
      player.vy > 0 &&
      player.x + player.w > p.x &&
      player.x < p.x + p.w &&
      player.y + player.h > p.y &&
      player.y + player.h < p.y + p.h + 10
    ) {
      player.y = p.y - player.h;
      player.vy = 0;
      isOnGround = true;
    }
  });

  /* 横スクロール */
  platforms.forEach(p => (p.x -= SCROLL_SPEED));
  distance += SCROLL_SPEED;

  /* 足場補充 */
  if (platforms[0].x + platforms[0].w < 0) {
    platforms.shift();
    spawnPlatform(canvas.width + Math.random() * 200);
  }

  /* 落下 */
  if (player.y > canvas.height) {
    gameOver = true;
  }
}

/* ===== 描画 ===== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* 地面 */
  ctx.drawImage(
    groundImg,
    0,
    ground.y,
    canvas.width,
    ground.h
  );

  /* 足場 */
  ctx.fillStyle = "#8b5a2b";
  platforms.forEach(p =>
    ctx.fillRect(p.x, p.y, p.w, p.h)
  );

  /* ヤギ */
  ctx.drawImage(goatImg, player.x, player.y, player.w, player.h);

  /* 距離 */
  ctx.fillStyle = "#000";
  ctx.font = "16px sans-serif";
  ctx.fillText("DISTANCE: " + Math.floor(distance / 10), 10, 20);

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
