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

// データベースの愚痴を保持しておく配列
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

    // X軸のランダム配置（10%〜80%）
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

// ① 過去の投稿データをFirestoreから読み込む
async function loadExistingGruchis() {
    try {
        const q = query(collection(db, "guchis"), orderBy("createdAt", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        
        const fetchedTexts = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data && data.text) {
                fetchedTexts.push(data.text);
            }
        });

        // データがあれば配列を更新（過去の全投稿を蓄積）
        if (fetchedTexts.length > 0) {
            savedGruchis = fetchedTexts;
        }
    } catch (error) {
        console.error("データ読み込みエラー:", error);
    }
}

// ② ループで過去・最新の投稿を常に降らせ続ける
function startRainLoop() {
    // 2.2秒ごとに保存されている愚痴の中からランダムに降らせる
    setInterval(() => {
        if (savedGruchis.length > 0) {
            const randomText = savedGruchis[Math.floor(Math.random() * savedGruchis.length)];
            createRainItem(randomText);
        }
    }, 2200);
}

// ③ リアルタイム監視（アクセス中に誰かが新しく投稿した時）
function listenToNewGruchis() {
    const q = query(collection(db, "guchis"), orderBy("createdAt", "desc"), limit(1));
    
    let isInitialLoad = true;
    onSnapshot(q, (snapshot) => {
        if (isInitialLoad) {
            isInitialLoad = false;
            return;
        }

        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const data = change.doc.data();
                if (data && data.text) {
                    // 配列に追加して、画面にも即降らせる
                    savedGruchis.unshift(data.text);
                    createRainItem(data.text, true);
                }
            }
        });
    });
}

// ユーザーの新規投稿処理（Firestoreへ保存）
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = textInput.value.trim();
    if (!value) return;

    try {
        textInput.value = '';
        // 即座に自分の画面で降らせる ＋ ローカル配列に追加
        savedGruchis.unshift(value);
        createRainItem(value, true);

        // Firebase Firestore へ保存（これで永続化）
        await addDoc(collection(db, "guchis"), {
            text: value,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("投稿保存エラー:", error);
    }
});

// 起動時の初期化フロー
window.addEventListener('DOMContentLoaded', async () => {
    // 1. 過去の愚痴を取得
    await loadExistingGruchis();
    
    // 2. 初回画面に2〜3個降らせる
    if (savedGruchis.length > 0) {
        createRainItem(savedGruchis[0]);
        setTimeout(() => createRainItem(savedGruchis[1] || savedGruchis[0]), 1000);
    }

    // 3. 雨のループ処理をスタート
    startRainLoop();

    // 4. 新規投稿のリアルタイム監視を開始
    listenToNewGruchis();
});