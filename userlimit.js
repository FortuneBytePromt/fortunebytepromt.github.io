// User limit    
let usageCache = new Map();
let settingsCache = null;
let lastSettingsCheck = 0;
const SETTINGS_CACHE_TIME = 5 * 60 * 1000; // 5分鐘緩存

// 檢查是否為測試後門
function isTestBackdoor(numbers) {
  return numbers.every(num => num === 999);
}

async function getSettings() {
  const now = Date.now();
  // 如果緩存存在且未過期，直接返回緩存
  if (settingsCache && (now - lastSettingsCheck < SETTINGS_CACHE_TIME)) {
    return settingsCache;
  }

  try {
    const db = firebase.firestore();
    const settingsDoc = await db.collection("settings").doc("system").get();
    if (!settingsDoc.exists) {
      console.warn("系統設置不存在，使用默認值");
      return { dailyLimit: 5, usageInterval: 1 };
    }
    settingsCache = settingsDoc.data();
    lastSettingsCheck = now;
    return settingsCache;
  } catch (error) {
    console.error("獲取設置錯誤：", error);
    return { dailyLimit: 5, usageInterval: 1 };
  }
}

async function checkUsageLimitByUID() {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.warn("用戶未登入");
    return false;
  }

  try {
    const db = firebase.firestore();
    const settings = await getSettings();
    const dailyLimit = settings.dailyLimit;
    const usageInterval = settings.usageInterval;

    // 檢查今日使用次數
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 使用緩存檢查
    const cacheKey = `${user.uid}_${today.toISOString().slice(0,10)}`;
    const cachedData = usageCache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp < 60000)) { // 1分鐘內的緩存
      const remainingCount = dailyLimit - cachedData.count;
      updateRemainingCount(remainingCount);
      if (remainingCount <= 0) {
        alert(`您今日已使用 ${dailyLimit} 次，請明天再試`);
        return false;
      }
      return true;
    }

    // 如果緩存不存在或過期，從 Firebase 讀取
    const userLimitRef = db.collection("user_limits").doc(user.uid);
    const userLimitDoc = await userLimitRef.get();
    
    let remainingCount = dailyLimit;
    if (userLimitDoc.exists) {
      const userLimit = userLimitDoc.data();
      const lastReset = userLimit.lastReset ? new Date(userLimit.lastReset) : new Date(0);
      
      // 檢查是否需要重置計數器
      if (lastReset < today) {
        // 重置計數器
        await userLimitRef.set({
          dailyCount: 0,
          lastReset: today.getTime()
        });
      } else {
        remainingCount = dailyLimit - (userLimit.dailyCount || 0);
        // 更新緩存
        usageCache.set(cacheKey, {
          count: userLimit.dailyCount || 0,
          timestamp: Date.now()
        });
      }
    } else {
      // 創建新的使用限制記錄
      await userLimitRef.set({
        dailyCount: 0,
        lastReset: today.getTime()
      });
    }

    updateRemainingCount(remainingCount);
    if (remainingCount <= 0) {
      alert(`您今日已使用 ${dailyLimit} 次，請明天再試`);
      return false;
    }

    // 檢查使用間隔
    const lastUsage = await db.collection("fortune_records")
      .where("uid", "==", user.uid)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (!lastUsage.empty) {
      const lastTime = lastUsage.docs[0].data().timestamp;
      const now = new Date();
      const diffMinutes = (now - lastTime) / (1000 * 60);
      
      if (diffMinutes < usageInterval) {
        alert(`請等待 ${Math.ceil(usageInterval - diffMinutes)} 分鐘後再試`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("檢查使用限制錯誤：", error);
    // 添加更詳細的錯誤信息
    if (error.code === 'permission-denied') {
      console.error("權限錯誤：用戶沒有足夠的權限訪問數據");
    } else if (error.code === 'not-found') {
      console.error("數據不存在：找不到相關記錄");
    } else {
      console.error("未知錯誤：", error.message);
    }
    return false;
  }
}

async function updateUsageCount(numbers) {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.warn("用戶未登入");
    return;
  }

  // 檢查是否為測試後門
  if (isTestBackdoor(numbers)) {
    console.log("測試後門已啟動，不增加使用次數");
    return;
  }

  try {
    const db = firebase.firestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const userLimitRef = db.collection("user_limits").doc(user.uid);
    
    // 使用事務來確保數據一致性
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(userLimitRef);
      const currentCount = doc.exists ? doc.data().dailyCount || 0 : 0;
      const newCount = currentCount + 1;
      
      transaction.set(userLimitRef, {
        dailyCount: newCount,
        lastReset: today.getTime()
      }, { merge: true });

      // 更新本地緩存
      const cacheKey = `${user.uid}_${today.toISOString().slice(0,10)}`;
      usageCache.set(cacheKey, {
        count: newCount,
        timestamp: Date.now()
      });

      // 更新顯示
      const settings = await getSettings();
      const remainingCount = settings.dailyLimit - newCount;
      updateRemainingCount(remainingCount);
    });
  } catch (error) {
    console.error("更新使用次數錯誤：", error);
    // 添加更詳細的錯誤信息
    if (error.code === 'permission-denied') {
      console.error("權限錯誤：用戶沒有足夠的權限更新數據");
    } else if (error.code === 'not-found') {
      console.error("數據不存在：找不到相關記錄");
    } else {
      console.error("未知錯誤：", error.message);
    }
  }
}

function updateRemainingCount(count) {
  const remainingElement = document.getElementById("remainingCount");
  if (remainingElement) {
    remainingElement.textContent = `今日剩餘次數：${count} 次`;
  }
}

// 定期清理過期緩存
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of usageCache.entries()) {
    if (now - value.timestamp > 3600000) { // 1小時後過期
      usageCache.delete(key);
    }
  }
}, 3600000); // 每小時清理一次
