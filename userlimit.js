// User limit    
let usageCache = new Map();
let settingsCache = null;
let lastSettingsCheck = 0;
const SETTINGS_CACHE_TIME = 5 * 60 * 1000; // 5分鐘緩存

async function getSettings() {
  const now = Date.now();
  // 如果緩存存在且未過期，直接返回緩存
  if (settingsCache && (now - lastSettingsCheck < SETTINGS_CACHE_TIME)) {
    return settingsCache;
  }

  try {
    const db = firebase.firestore();
    const settingsDoc = await db.collection("settings").doc("system").get();
    settingsCache = settingsDoc.data() || { dailyLimit: 3, usageInterval: 30 };
    lastSettingsCheck = now;
    return settingsCache;
  } catch (error) {
    console.error("獲取設置錯誤：", error);
    return { dailyLimit: 3, usageInterval: 30 };
  }
}

async function checkUsageLimitByUID() {
  const user = firebase.auth().currentUser;
  if (!user) return false;

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
    const todayUsage = await db.collection("userUsage")
      .where("uid", "==", user.uid)
      .where("date", ">=", today)
      .get();

    let remainingCount = dailyLimit;
    if (todayUsage.docs.length > 0) {
      const usage = todayUsage.docs[0].data();
      remainingCount = dailyLimit - usage.count;
      // 更新緩存
      usageCache.set(cacheKey, {
        count: usage.count,
        timestamp: Date.now()
      });
    }

    updateRemainingCount(remainingCount);
    if (remainingCount <= 0) {
      alert(`您今日已使用 ${dailyLimit} 次，請明天再試`);
      return false;
    }

    // 檢查使用間隔
    const lastUsage = await db.collection("divinationRecords")
      .where("uid", "==", user.uid)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (!lastUsage.empty) {
      const lastTime = lastUsage.docs[0].data().timestamp.toDate();
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
    return false;
  }
}

async function updateUsageCount() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  try {
    const db = firebase.firestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const docId = `${user.uid}_${today.toISOString().slice(0,10).replace(/-/g, '')}`;
    const usageRef = db.collection("userUsage").doc(docId);
    
    // 使用事務來確保數據一致性
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(usageRef);
      const currentCount = doc.exists ? doc.data().count || 0 : 0;
      const newCount = currentCount + 1;
      
      transaction.set(usageRef, {
        uid: user.uid,
        date: today,
        count: newCount
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
