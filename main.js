// Email 登入
function emailLogin() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!email || !password) {
    alert("請輸入完整帳號與密碼");
    return;
  }
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = 'fortune.html'; // 登入成功導向占卜頁
    })
    .catch(err => {
      alert("登入失敗：" + err.message);
    });
}

// Email 註冊
function emailRegister() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!email || !password) {
    alert("請輸入完整帳號與密碼");
    return;
  }
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = 'fortune.html'; // 註冊成功後自動登入
    })
    .catch(err => {
      alert("註冊失敗：" + err.message);
    });
}

// Google 登入
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(() => {
      window.location.href = 'fortune.html'; // 登入成功導向占卜頁
    })
    .catch(err => {
      alert("Google 登入失敗：" + err.message);
    });
}

function resetPassword() {
  const email = document.getElementById('email').value.trim();
  if (!email) {
    alert("請先輸入 Email，再點選忘記密碼");
    return;
  }

  // 嘗試登入來驗證帳號是否存在（密碼給錯的）
  firebase.auth().signInWithEmailAndPassword(email, "___wrong_password___")
    .catch(error => {
      if (error.code === 'auth/user-not-found') {
        alert("這個 Email 尚未註冊，請先註冊帳號");
      } else {
        // Email 存在，就可以寄送密碼重設信
        firebase.auth().sendPasswordResetEmail(email)
          .then(() => {
            alert("密碼重設信已寄出，請前往信箱查收");
          })
          .catch(err => {
            alert("寄送失敗：" + err.message);
          });
      }
    });
}

function logout() {
  firebase.auth().signOut().then(() => {
    alert("你已成功登出！");
    window.location.href = "login.html";
  }).catch((error) => {
    console.error("登出失敗：", error);
    alert("登出失敗！");
  });
}
