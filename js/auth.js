// 認證管理模塊
const auth = {
  // 使用電子郵件註冊
  async registerWithEmail(email, password) {
    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      let errorMsg = "";
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMsg = "此電子郵件已被註冊";
          break;
        case "auth/invalid-email":
          errorMsg = "無效的電子郵件格式";
          break;
        case "auth/operation-not-allowed":
          errorMsg = "註冊功能目前未啟用";
          break;
        case "auth/weak-password":
          errorMsg = "密碼強度不足，請使用至少6個字符";
          break;
        default:
          errorMsg = "註冊時發生錯誤，請稍後再試";
      }
      return { success: false, error: errorMsg };
    }
  },

  // 使用電子郵件登入
  async loginWithEmail(email, password) {
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      let errorMsg = "";
      switch (error.code) {
        case "auth/invalid-email":
          errorMsg = "無效的電子郵件格式";
          break;
        case "auth/user-disabled":
          errorMsg = "此帳號已被停用";
          break;
        case "auth/user-not-found":
          errorMsg = "找不到此帳號";
          break;
        case "auth/wrong-password":
          errorMsg = "密碼錯誤";
          break;
        default:
          errorMsg = "登入時發生錯誤，請稍後再試";
      }
      return { success: false, error: errorMsg };
    }
  },

  // 使用 Google 登入
  async loginWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const userCredential = await firebase.auth().signInWithPopup(provider);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: "Google 登入失敗，請稍後再試" };
    }
  },

  // 重設密碼
  async resetPassword(email) {
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      let errorMsg = "";
      switch (error.code) {
        case "auth/invalid-email":
          errorMsg = "無效的電子郵件格式";
          break;
        case "auth/user-not-found":
          errorMsg = "找不到此帳號";
          break;
        default:
          errorMsg = "重設密碼時發生錯誤，請稍後再試";
      }
      return { success: false, error: errorMsg };
    }
  },

  // 登出
  async logout() {
    try {
      await firebase.auth().signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error: "登出時發生錯誤，請稍後再試" };
    }
  },

  // 檢查管理員權限
  isAdmin(uid) {
    const ADMIN_UID = "fLhFeaiYwsVhDJ0O3ozFWbo2Qv22";
    return uid === ADMIN_UID;
  }
};

export default auth; 