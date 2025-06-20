// キャンバス要素と2D描画コンテキストを取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// スコア表示要素とゲームオーバーメッセージ要素を取得
const scoreDisplay = document.getElementById('score');
const gameOverMessage = document.getElementById('game-over-message');

// ゲームの状態を管理する変数
let isGameOver = false; // ゲームが終了しているか
let score = 0; // 現在のスコア
let frame = 0; // ゲームのフレームカウンター

// プレイヤー（キャラクター）の設定
const player = {
    x: 50, // X座標
    y: canvas.height - 70, // Y座標 (地面より少し上に配置)
    width: 30, // 幅
    height: 30, // 高さ
    dy: 0, // 垂直方向の速度 (dy: delta y)
    gravity: 0.6, // 重力の影響
    jumpStrength: -10 // ジャンプ力 (負の数で上方向へ移動)
};

// 障害物の設定と配列
const obstacles = []; // 画面上の障害物を格納する配列
const obstacleWidth = 20; // 障害物の幅
const obstacleHeight = 40; // 障害物の高さ
const obstacleSpeed = 5; // 障害物が左へ移動する速度
const obstacleSpawnInterval = 120; // 障害物を生成するフレーム間隔

// ゲームをリセットする関数
function resetGame() {
    isGameOver = false; // ゲームオーバー状態を解除
    score = 0; // スコアをリセット
    frame = 0; // フレームカウンターをリセット
    player.y = canvas.height - 70; // プレイヤーの位置を初期化
    player.dy = 0; // プレイヤーの速度をリセット
    obstacles.length = 0; // 障害物をすべてクリア
    scoreDisplay.textContent = score; // スコア表示を更新
    gameOverMessage.style.display = 'none'; // ゲームオーバーメッセージを非表示
    gameLoop(); // ゲームループを再開
}

// プレイヤーを描画する関数
function drawPlayer() {
    ctx.fillStyle = 'red'; // プレイヤーの色を赤に設定
    ctx.fillRect(player.x, player.y, player.width, player.height); // プレイヤーを四角で描画
}

// 障害物を描画する関数
function drawObstacles() {
    ctx.fillStyle = 'green'; // 障害物の色を緑に設定
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height); // 各障害物を四角で描画
    });
}

// プレイヤーの状態を更新する関数
function updatePlayer() {
    // 重力の影響で垂直速度を増加させる
    player.dy += player.gravity;
    // 垂直速度に基づいてプレイヤーのY座標を更新
    player.y += player.dy;

    // 地面との衝突判定
    // プレイヤーが地面（キャンバスの高さ - 40px）より下に行かないようにする
    if (player.y + player.height > canvas.height - 40) {
        player.y = canvas.height - 40 - player.height; // 地面の上にプレイヤーを固定
        player.dy = 0; // 垂直速度をリセット
    }
}

// 障害物の状態を更新する関数
function updateObstacles() {
    // 障害物の生成
    // 特定のフレーム間隔で新しい障害物を画面右端に生成する
    if (frame % obstacleSpawnInterval === 0 && !isGameOver) {
        obstacles.push({
            x: canvas.width, // 画面右端から出現
            y: canvas.height - 40 - obstacleHeight, // 地面の上に配置
            width: obstacleWidth,
            height: obstacleHeight
        });
    }

    // 障害物の移動と衝突判定
    // 障害物配列を逆順にループすることで、削除してもインデックスがずれないようにする
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= obstacleSpeed; // 障害物を左へ移動させる

        // 画面外に出た障害物を削除し、スコアを加算
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1); // 配列から障害物を削除
            score++; // スコアを1加算
            scoreDisplay.textContent = score; // スコア表示を更新
        }

        // プレイヤーと障害物の衝突判定 (AABB: Axis-Aligned Bounding Box 衝突判定)
        // プレイヤーの矩形と障害物の矩形が重なっているかをチェック
        if (
            player.x < obstacle.x + obstacle.width && // プレイヤーの左端が障害物の右端より左
            player.x + player.width > obstacle.x && // プレイヤーの右端が障害物の左端より右
            player.y < obstacle.y + obstacle.height && // プレイヤーの上端が障害物の下端より上
            player.y + player.height > obstacle.y // プレイヤーの下端が障害物の上端より下
        ) {
            isGameOver = true; // 衝突したらゲームオーバー
            gameOverMessage.style.display = 'block'; // ゲームオーバーメッセージを表示
        }
    }
}

// キーボードイベントリスナーを設定
document.addEventListener('keydown', e => {
    // スペースキーが押された場合
    if (e.code === 'Space') {
        if (isGameOver) {
            resetGame(); // ゲームオーバー中にスペースキーで再スタート
        } else if (player.y + player.height >= canvas.height - 40) {
            // プレイヤーが地面にいるときのみジャンプ可能
            player.dy = player.jumpStrength; // プレイヤーにジャンプ力を与える
        }
    }
});

// ゲームの繰り返し
function gameLoop() {
    if (isGameOver) {
        return; // ゲームオーバーならループを停止
    }

    // キャンバス全体をクリアして、前のフレームの描画を消す
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 地面を描画
    ctx.fillStyle = '#8B4513'; // 地面の色を茶色に設定
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40); // 地面を四角で描画

    // プレイヤーと障害物の状態を更新
    updatePlayer();
    updateObstacles();

    // プレイヤーと障害物を描画
    drawPlayer();
    drawObstacles();

    frame++; // フレームカウンターをインクリメント
    requestAnimationFrame(gameLoop); // 次のフレームの描画をブラウザにリクエスト
}

// ゲーム開始
// ページが読み込まれたらゲームループを開始する
window.onload = function() {
    gameLoop();
};