// Firebase SDKs のインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    orderBy, 
    limit, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 更新された Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyA8P0etGc8wSpwLVrEOSKyx1yKgZ6962eE",
  authDomain: "text-river.firebaseapp.com",
  projectId: "text-river",
  storageBucket: "text-river.firebasestorage.app",
  messagingSenderId: "290314155034",
  appId: "1:290314155034:web:ee33f0ec6b2350ceaa8da3",
  measurementId: "G-8K2B0JS921"
};

// Firebase 初期化
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// DOM要素
const rainContainer = document.getElementById('rain-canvas');
const textInput = document.getElementById('text-input');
const form = document.getElementById('guchi-form');

const colors = ["#38bdf8", "#f97316", "#a855f7", "#22c55e", "#eab308"];

// 初期表示用ダミー（Firestoreが空の場合やフォールバック用）
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

// 画面に愚痴を1つ落下させる関数
function createRainItem(text, isUserSubmitted = false) {
    if (!text) return;

    const item = document.createElement('div');
    item.className = 'rain-item';

    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const shape = document.createElement('span');
    shape.className = 'rain-shape';
    shape.style.backgroundColor = isUserSubmitted ? '#f97316' : randomColor;

    const label = document.createElement('span');
    label.textContent = text;

    item.appendChild(shape);
    item.appendChild(label);

    // X軸のランダム配置
    const leftPos = Math.random() * 80 + 10;
    item.style.left = `${leftPos}%`;

    // 落下アニメーション時間
    const duration = Math.random() * 4 + 7;
    item.style.animationDuration = `${duration}s`;

    rainContainer.appendChild(item);

    // アニメーション終了後に削除
    setTimeout(() => {
        item.remove();
    }, duration * 1000);
}

// 投稿機能（Firestore に送信）
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = textInput.value.trim();
    if (!value) return;

    try {
        textInput.value = '';
        // 即座に自分の画面で落とす
        createRainItem(value, true);

        // Firebase Firestore へ保存
        await addDoc(collection(db, "guchis"), {
            text: value,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("投稿エラー:", error);
    }
});

// リアルタイム同期（誰かが投稿したら全ユーザーに降らせる）
const q = query(collection(db, "guchis"), orderBy("createdAt", "desc"), limit(30));

let isFirstLoad = true;

onSnapshot(q, (snapshot) => {
    if (snapshot.empty && isFirstLoad) {
        // DBが空の場合はサンプルを定期的に降らせる
        setInterval(() => {
            const randomText = initialGruchis[Math.floor(Math.random() * initialGruchis.length)];
            createRainItem(randomText);
        }, 2500);
        isFirstLoad = false;
        return;
    }

    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            const data = change.doc.data();
            // 投稿データのテキストが存在すれば降らせる
            if (data && data.text) {
                setTimeout(() => {
                    createRainItem(data.text);
                }, Math.random() * 2000);
            }
        }
    });
    isFirstLoad = false;
});