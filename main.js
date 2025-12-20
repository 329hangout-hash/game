<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=no">
<title>Goat Climb</title>
<style>
  body { margin:0; overflow:hidden; background:#87ceeb; }
  canvas { display:block; }
</style>
</head>
<body>
<canvas id="game"></canvas>

<script>
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

// ===== 定数 =====
const GRAVITY = 0.6;
const JUMP_POWER = 14;
const SIDE_POWER = 6;

// ===== プレイヤー（ヤギ）=====
const player = {
  x: canvas.width / 2,
  y: canvas.height * 0.7,
  w: 30,
  h: 30,
  vx: 0,
  vy: 0
};

// ===== 足場 =====
let platforms = [];
for (let i = 0; i < 8; i++) {
  platforms.push({
    x: Math.random() * (canvas.width - 80),
    y: canvas.height - i * 120,
    w: 80,
    h: 15
  });
}

let cameraY = 0;
let score = 0;
let gameOver = false;

// ===== タップ判定 =====
let lastTapTime = 0;
let tapTimer = null;

canvas.addEventListener("touchstart", e => {
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
}, { passive:false });

function jump(type) {
  player.vy = -JUMP_POWER;
  if (type === "left")  player.vx = -SIDE_POWER;
  if (type === "right") player.vx =  SIDE_POWER;
  if (type === "up")    player.vx = 0;
}

// ===== ゲームループ =====
function update() {
  if (gameOver) return;

  player.vy += GRAVITY;
  player.x += player.vx;
  player.y += player.vy;

  // 画面端
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

  // 足場当たり判定（上からのみ）
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

  // スクロール
  if (player.y < canvas.height / 3) {
    const diff = (canvas.height / 3) - player.y;
    player.y = canvas.height / 3;
    cameraY += diff;
    score += Math.floor(diff);

    platforms.forEach(p => p.y += diff);

    // 新しい足場
    while (platforms.length < 10) {
      platforms.push({
        x: Math.random() * (canvas.width - 80),
        y: -Math.random() * 120,
        w: 80,
        h: 15
      });
    }
  }

  // 落下
  if (player.y > canvas.height) gameOver = true;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ヤギ
  ctx.fillStyle = "#fff";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // 足場
  ctx.fillStyle = "#654321";
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

  // スコア
  ctx.fillStyle = "#000";
  ctx.font = "16px sans-serif";
  ctx.fillText("HEIGHT: " + score, 10, 20);

  if (gameOver) {
    ctx.font = "30px sans-serif";
    ctx.fillText("GAME OVER", canvas.width / 2 - 80, canvas.height / 2);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
</script>
</body>
</html>

