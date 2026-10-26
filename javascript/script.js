
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8P0etGc8wSpwLVrEOSKyx1yKgZ6962eE",
  authDomain: "text-river.firebaseapp.com",
  projectId: "text-river",
  storageBucket: "text-river.firebasestorage.app",
  messagingSenderId: "290314155034",
  appId: "1:290314155034:web:e7f72c7e54d77458aa8da3",
  measurementId: "G-RN7JDJ2WFR"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messagesRef = collection(db, "messages");

const container = document.getElementById('river-container');
const input = document.getElementById('text-input');
const button = document.getElementById('send-btn');

// 過去に投稿されたテキストを定期的に流すためのプール（貯蔵庫）
let textPool = [];
let poolIndex = 0;

// 画面にテキストを降らせるエフェクト関数
function createTextElement(text) {
    const textSpan = document.createElement('span');
    textSpan.classList.add('flowing-text');
    textSpan.textContent = text;

    const randomLeft = Math.floor(Math.random() * 80) + 5;
    textSpan.style.left = `${randomLeft}%`;

    const duration = Math.random() * 3 + 4; // 4秒〜7秒で落下
    textSpan.style.animationDuration = `${duration}s`;

    container.appendChild(textSpan);

    textSpan.addEventListener('animationend', () => {
        textSpan.remove();
    });
}

// ボタンやEnterキーで文字を送信（Firebaseに保存する）
async function sendText() {
    const text = input.value.trim();
    if (text === '') return;

    try {
        // データベースにテキストと投稿時間を保存
        await addDoc(messagesRef, {
            text: text,
            createdAt: new Date()
        });
        input.value = '';
        input.focus();
    } catch (e) {
        console.error("エラーが発生しました: ", e);
    }
}

// どこの誰かが文字を入力したら、リアルタイムに全員の画面で感知する設定
// 直近に保存された新しいメッセージを最大50件監視・取得する
const q = query(messagesRef, orderBy("createdAt", "desc"), limit(50));
onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        // 新しくデータが追加された時
        if (change.type === "added") {
            const data = change.doc.data();
            
            // 1. 入力された瞬間に、今開いている全員の画面にリアルタイムで降らせる
            createTextElement(data.text);

            // 2. 定期的に流すためのプールにも言葉を記憶させる
            if (!textPool.includes(data.text)) {
                textPool.push(data.text);
            }
        }
    });
});

// ★定期的に文字を流すタイマー（2秒ごとにプールから自動で流す）
setInterval(() => {
    if (textPool.length === 0) return;

    // プールにある言葉を順番に流す
    createTextElement(textPool[poolIndex]);
    
    poolIndex++;
    if (poolIndex >= textPool.length) {
        poolIndex = 0; // 最後までいったら最初に戻る
    }
}, 2000); // 2000ミリ秒 ＝ 2秒

// イベントリスナーの設定
button.addEventListener('click', sendText);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendText();
    }
});

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