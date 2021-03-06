'use strict';
const msg = document.getElementById("msg");
const msg2 = document.getElementById("msg2");

// firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyAcmShxrdqnWgKnNCFFqr71VJz_0sBJ4CE",
  authDomain: "poirot-js.firebaseapp.com",
  databaseURL: "https://poirot-js.firebaseio.com",
  projectId: "poirot-js",
  storageBucket: "poirot-js.appspot.com",
  messagingSenderId: "458125833864",
  appId: "1:458125833864:web:ddc2bb1dbc45a0df61913d",
  measurementId: "G-5MP7JN9P88"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const collection = db.collection('speeches');

// 履歴を表示する　降順
collection.orderBy('created').onSnapshot(snapshot =>{
    snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
            const p = document.createElement('p');
            p.textContent = change.doc.data().speech;
            msg2.insertBefore(p, msg2.firstChild);
        }
    });
})

//音声認識APIの使用
const speech = new webkitSpeechRecognition();
speech.lang = "ja";　//言語を日本語に設定

// イベント
// まばたきイベント　
window.addEventListener("load", eventWindowLoaded);
function eventWindowLoaded () { 
    draw();
}

// 音声認識をスタート
window.onclick = function() {
    speech.start();
};

// 音声認識でデータ取得　=>　イベント
speech.addEventListener('result', text2speech);

// 関数
// text2speech
function text2speech(event) {
    let text = event.results[0][0].transcript;

    // textをfirestoreに保存
    collection.add({
        speech: text,
        created: firebase.firestore.FieldValue.serverTimestamp()
    })
    
    // ホットワードの代わり
    if (text === "ポアロ") {
        const notice = "はい、、、あ、ワン"
        synthesis(notice);
        hitomoji(notice);
        talk();
    } else  {
        // textがすでに履歴にあるかチェック
        collection.where("speech", "==", text).get()
        .then(snapshot =>{
            let words = [];
            snapshot.forEach(doc => {
                let word = doc.data().speech;
                words.push(word);
            })
            let count =  words.length;
            if (1 < count && count < 3) {
                const notice = `${count}回目だよ〜`
                synthesis(notice);
                hitomoji(notice);
                talk();
            } else if (count >= 3) {
                const notice = `${count}回も言う必要ある？`
                synthesis(notice);
                hitomoji(notice);
                talk();
            } else {
                // Talk Api
                handler_request_reply(text);
            }
        })
    }
}    
        

// まばたき
const draw = () => {
    const canvas = document.getElementById("mabuta"); 
    if(canvas.getContext) {
        const ctx = canvas.getContext("2d"); 
        
        let count2 = 0;
        const matataki = setInterval(() => {
            let step = 0;
            let flag = true;
            let count = 0;
            // setInterval(イベント, 処理間隔)でイベントを処理間隔ごとに繰り返す
            const mabataki = setInterval(() => {
                // 描画スタイルの初期状態を保存する 　
                ctx.save();
                // 初期化
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if(flag){
                    ctx.translate(30, step++);
                    if(step>50) {
                        flag = false;
                    }
                } else {
                    ctx.translate(30, step--);
                    if(step === 0) {
                        flag = true;
                    }
                }
                ctx.fillStyle="#ffc400e1" // 塗りつぶし色
                // ctx.fillStyle="#000000"
                // ctx.fillRect(0, 0, 40, 30) // 正方形を描画
                // ctx.fillRect(100, 0, 40, 30)
                ctx.fillRect(0, -17, 60, 50) // スマホ位置
                ctx.fillRect(130, -17, 60, 50)
                ctx.restore(); // 描画スタイルを復元（初期状態に戻す）
                
                count++;
                if(count > 50*2*2){
                    clearInterval(mabataki);　//idをclearIntervalで指定している
                }
            }, 5);

            count2++
            if(count2 > 4){ 
                clearInterval(matataki);　//idをclearIntervalで指定している
            }
        }, 2700);
    } 
}

// 目がにっこり
const nico = () => {
    const canvas = document.getElementById("mabuta"); 
    if(canvas.getContext) {
        const ctx = canvas.getContext("2d");
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle="#ffc400"
        // ctx.fillStyle="#000000"
        ctx.beginPath();
        // ctx.ellipse(54, 54, 16, 10, 0, 0, 2*Math.PI);
        // ctx.ellipse(148, 54, 16, 10, 0, 0, 2*Math.PI);
        ctx.ellipse(55, 72, 15, 11, 0, 0, 2*Math.PI);
        ctx.ellipse(195, 72, 15, 11, 0, 0, 2*Math.PI);
        ctx.fill();

        setTimeout(() => {
            draw(); // にっこり->まばたき
        }, 1800);
        // ctx.restore(); // 描画スタイルを復元（初期状態に戻す）
        // cstx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// 口が動く
const talk = () => {
    const canvas = document.getElementById('mouth');
    if(canvas.getContext) {
        const ctx = canvas.getContext("2d"); 

        let flag = true;
        let mouse_width = 16;
        let mouse_height = 12;
        let count = 0;
        let step = 0;
        // setInterval(イベント, 処理間隔)でイベントを処理間隔ごとに繰り返す
        const speak = setInterval(() => {
            // 描画スタイルの初期状態を保存する 　
            ctx.save();
            // 初期化
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle="#9e3122";

            if(flag){
                ctx.translate(0, step++);
                if(step>22) {
                    flag = false;
                }
            } else {
                ctx.translate(0, step--);
                if(step === 0) {
                    flag = true;
                }
            }
            ctx.fillStyle="#9e3122";
            ctx.beginPath();
            ctx.ellipse(100, 100*1.35, mouse_width, mouse_height, 0, 0, 2*Math.PI);
            ctx.fill();
            ctx.restore();
            
            count++;
            if(count > 40*6 && step === 0){
                clearInterval(speak);　//idをclearIntervalで指定している
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }    
        }, 7/1.2);
    } 
}

// TALK-API
/* 返答をリクエスト */
async function handler_request_reply(comment){
    /* コメント取得 */
    // const comment = document.getElementById('talkapi__input').value;
    /* レクエストデータ */
    let formdata = new FormData();
    //- apikeyパラメーター 
    formdata.append('apikey', 'DZZ7ctd6vxw0ucS7RHB3tuVv6JwVs1UC');
    //- コメント
    formdata.append('query', comment);

    // /* リクエスト */
    const res = await fetch('https://api.a3rt.recruit-tech.co.jp/talk/v1/smalltalk',{
        method: 'post',
        body: formdata,
    });
    const data = await res.json();
    const text = await data.results[0].reply;

    // fetch-thenを使った書き方
    // fetch('https://api.a3rt.recruit-tech.co.jp/talk/v1/smalltalk',{
    //     method: 'post',
    //     body: formdata,
    // }).then(response => {
    //     //- レスポンス取得
    //     response.json().then(data => {
    //         //- 返答取得
    //         const text = data.results[0].reply;
            //- 出力
            // document.getElementById('talkapi__reply').innerHTML = reply;
            //     });
            // });
            
    // 返答を発話
    synthesis(text);
    // 一文字ずつ表示
    hitomoji(text);
    // 口パク
    talk();
}

// 返答を発話
const synthesis = (text) => {
    const synthes = new SpeechSynthesisUtterance(text);
    synthes.rate = 1.2 // 速度 0.1-10 初期値:1 (倍速なら2, 半分の倍速なら0.5)
    synthes.pitch = 1.2 // 高さ 0-2 初期値:1
    synthes.volume = 1 // 音量 0-1 初期値:1
    
    speechSynthesis.speak(synthes);
    
    synthes.onend = () => {
        setTimeout(() => {
            nico(); // 読み終えてからの処理
        }, 500);
        setTimeout(() => {
            document.getElementById('msg').innerText = ".......................";
            speech.start();
        }, 2300)
    }
}

// 一文字ずつ表示
const hitomoji = (text) => {
        let count = 0;
        const disp = () => {
            msg.innerText = text.substring(0, count++);
            if (count <= text.length) {
                setTimeout(disp, 90);  // setTimeout(disp(), 90); NG
            }
        }
        disp()
    }

    // (文字が消えていく)
    // 音声認識開始で目が大きく、認識中はあいずち
    // ホットワードで認識開始
    // 声を可愛く