// Firebase SDKs のインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    getDocs,
    query, 
    orderBy, 
    limit, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase 設定
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

// デフォルトの愚痴リスト（DBが空の時のバックアップ 兼 初期プール）
let savedGruchis = [
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

    // X軸のランダム配置（15%〜85%）
    const leftPos = Math.random() * 70 + 15;
    item.style.left = `${leftPos}%`;

    // 落下アニメーション時間（7〜11秒）
    const duration = Math.random() * 4 + 7;
    item.style.animationDuration = `${duration}s`;

    rainContainer.appendChild(item);

    // アニメーション終了後にDOMから削除
    setTimeout(() => {
        item.remove();
    }, duration * 1000);
}

// ① Firestoreから過去の全投稿を取得
async function loadExistingGruchis() {
    try {
        // createdAt の降順で最新100件を取得（orderByでエラーが出るのを防ぐためシンプルに取得）
        const q = query(collection(db, "guchis"), limit(100));
        const querySnapshot = await getDocs(q);
        
        const fetchedTexts = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data && data.text) {
                fetchedTexts.push(data.text);
            }
        });

        // 投稿データが存在すれば、初期配列と合体させる
        if (fetchedTexts.length > 0) {
            savedGruchis = [...fetchedTexts, ...savedGruchis];
        }
    } catch (error) {
        console.error("Firestoreからの読み込みエラー:", error);
    }
}

// ② ループで常に画面に降らせ続ける
function startRainLoop() {
    setInterval(() => {
        if (savedGruchis.length > 0) {
            const randomText = savedGruchis[Math.floor(Math.random() * savedGruchis.length)];
            createRainItem(randomText);
        }
    }, 2200);
}

// ユーザーの新規投稿処理（Firestoreへ送信＆即時降下）
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = textInput.value.trim();
    if (!value) return;

    try {
        textInput.value = '';
        
        // 1. ローカル配列の先頭に追加して即座に降らせる
        savedGruchis.unshift(value);
        createRainItem(value, true);

        // 2. Firestoreデータベースへ保存（これでリロード後も残る）
        await addDoc(collection(db, "guchis"), {
            text: value,
            createdAt: serverTimestamp()
        });

    } catch (error) {
        console.error("Firestoreへの保存エラー:", error);
        alert("投稿の保存に失敗しました。Firebaseのルール設定を確認してください。");
    }
});

// 起動時の初期化
window.addEventListener('DOMContentLoaded', async () => {
    // 過去データをロード
    await loadExistingGruchis();

    // 最初の一回
    createRainItem(savedGruchis[0]);
    setTimeout(() => createRainItem(savedGruchis[1] || savedGruchis[0]), 1000);

    // ループ再生スタート
    startRainLoop();
});