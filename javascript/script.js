document.addEventListener('DOMContentLoaded', () => {
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
    const form = document.getElementById('guchi-form');

    // 愚痴を画面上部から降らせる関数
    function createRainItem(text, isUserSubmitted = false) {
        if (!text) return;

        const item = document.createElement('div');
        item.className = 'rain-item';

        // ユーザー入力のものは目立たせる（オレンジまたはランダム色）
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const shape = document.createElement('span');
        shape.className = 'rain-shape';
        shape.style.backgroundColor = isUserSubmitted ? '#f97316' : randomColor;

        const label = document.createElement('span');
        label.textContent = text;

        item.appendChild(shape);
        item.appendChild(label);

        // ユーザーが投稿した場合は中央寄りに降らせる
        const leftPos = isUserSubmitted 
            ? Math.random() * 40 + 30 
            : Math.random() * 80 + 10;
        
        item.style.left = `${leftPos}%`;

        // 落下速度（ユーザー入力は少しゆっくり見せる）
        const duration = isUserSubmitted ? 10 : (Math.random() * 4 + 7);
        item.style.animationDuration = `${duration}s`;

        rainContainer.appendChild(item);

        // アニメーション完了後にDOMから削除
        setTimeout(() => {
            item.remove();
        }, duration * 1000);
    }

    // フォーム送信時の処理
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = textInput.value.trim();
        if (value) {
            createRainItem(value, true);
            textInput.value = '';
        }
    });

    // 定期的に初期サンプルを降らせる
    setInterval(() => {
        const randomText = initialGruchis[Math.floor(Math.random() * initialGruchis.length)];
        createRainItem(randomText);
    }, 2500);

    // 初回読み込み時の演出
    setTimeout(() => createRainItem(initialGruchis[0]), 300);
    setTimeout(() => createRainItem(initialGruchis[1]), 1200);
});