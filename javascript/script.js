// 初期表示用のダミー愚痴リスト
const initialGruchis = [
    "雨でせっかくの予定が飛んじゃった…",
    "お気に入りのスニーカーが浸水して最悪",
    "傘忘れて今年4本目のビニール傘購入",
    "湿気で髪の毛が爆発してる",
    "雨宿り中、カフェがどこも満席で泣いた",
    "服の裾がびしょ濡れでモチベゼロ",
    "でもこの傘ちょっと可愛いから許す",
    "誰かの愚痴読んでたら少し元気出た"
];

const colors = ["#38bdf8", "#f97316", "#a855f7", "#22c55e", "#eab308"];
const rainContainer = document.getElementById('rain-canvas');
const textInput = document.getElementById('text-input');
const sendBtn = document.getElementById('send-btn');

// 一定間隔で雨（愚痴）を降らせる
function createRainItem(text) {
    const item = document.createElement('div');
    item.className = 'rain-item';

    // ランダムなアクセントカラー
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // カラーポイント
    const shape = document.createElement('span');
    shape.className = 'rain-shape';
    shape.style.backgroundColor = randomColor;

    const label = document.createElement('span');
    label.textContent = text;

    item.appendChild(shape);
    item.appendChild(label);

    // 画面横幅のランダム位置（10%〜85%）
    const leftPos = Math.random() * 75 + 10;
    item.style.left = `${leftPos}%`;

    // 落下スピード（7秒〜12秒）
    const duration = Math.random() * 5 + 7;
    item.style.animationDuration = `${duration}s`;

    rainContainer.appendChild(item);

    // アニメーション終了時に要素を削除
    setTimeout(() => {
        item.remove();
    }, duration * 1000);
}

// 自動生成タイマー
setInterval(() => {
    const randomText = initialGruchis[Math.floor(Math.random() * initialGruchis.length)];
    createRainItem(randomText);
}, 2200);

// ユーザーが入力して「降らせる」ボタンを押した時の処理
function handleSend() {
    const val = textInput.value.trim();
    if (val === '') return;

    // 即座に画面中央付近から降らせる
    createRainItem(val);
    textInput.value = '';
}

sendBtn.addEventListener('click', handleSend);
textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

// 初回に少しだけ降らせておく
window.addEventListener('DOMContentLoaded', () => {
    createRainItem(initialGruchis[0]);
    setTimeout(() => createRainItem(initialGruchis[1]), 800);
});