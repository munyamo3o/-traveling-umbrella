// 1. Firebaseの必要な機能をインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// 2. あなたのFirebase設定（スクリーンショットの値を反映済み）
const firebaseConfig = {
    apiKey: "AIzaSyA8P0etGc8wSpwLVrEOSKyx1yKgZ6962eE",
    authDomain: "text-river.firebaseapp.com",
    projectId: "text-river",
    storageBucket: "text-river.firebasestorage.app",
    messagingSenderId: "290314155034",
    appId: "1:290314155034:web:e7f72c7e54d77458aa8da3",
    measurementId: "G-RN7JDJ2WFR"
};

// 3. Firebaseとデータベース（Firestore）の初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messagesRef = collection(db, "messages");

// 画面の要素を取得
const container = document.getElementById('river-container');
const input = document.getElementById('text-input');
const button = document.getElementById('send-btn');

let textPool = [];
let poolIndex = 0;

// 画面にテキストを降らせるエフェクト関数
function createTextElement(text) {
    const textSpan = document.createElement('span');
    textSpan.classList.add('flowing-text');
    textSpan.textContent = text;

    // 横位置（左右）をランダムに設定（画面の5%〜85%の間）
    const randomLeft = Math.floor(Math.random() * 80) + 5;
    textSpan.style.left = `${randomLeft}%`;

    // 落ちるスピードをランダムに設定（4秒〜7秒）
    const duration = Math.random() * 3 + 4;
    textSpan.style.animationDuration = `${duration}s`;

    container.appendChild(textSpan);

    // アニメーションが終わったら画面から削除（重くならないように）
    textSpan.addEventListener('animationend', () => {
        textSpan.remove();
    });
}

// ボタンを押した時にデータベースへテキストを送信する関数
async function sendText() {
    const text = input.value.trim();
    if (text === '') return;

    try {
        // データベース（Firestore）にデータを追加
        await addDoc(messagesRef, {
            text: text,
            createdAt: new Date()
        });
        input.value = '';
        input.focus();
    } catch (e) {
        console.error("送信エラーが発生しました: ", e);
    }
}

// データベースの更新をリアルタイムに監視して、自動で画面に流す設定
const q = query(messagesRef, orderBy("createdAt", "desc"), limit(50));
onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            const data = change.doc.data();
            
            // 誰かが入力した瞬間に画面に流す
            createTextElement(data.text);

            // 定期配信用プールに言葉を記憶させる
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
}, 2000); // 2秒

// ボタンクリックとEnterキーのイベント登録
button.addEventListener('click', sendText);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendText();
    }
});