// 日誌記錄模塊
const logger = {
  // 日誌級別
  levels: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  },

  // 當前日誌級別
  currentLevel: 1, // INFO

  // 日誌格式
  format: (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };
    return JSON.stringify(logEntry);
  },

  // 記錄日誌
  log: (level, message, data = null) => {
    if (level >= logger.currentLevel) {
      const logEntry = logger.format(level, message, data);
      console.log(logEntry);
      
      // 如果是錯誤，發送到服務器
      if (level === logger.levels.ERROR) {
        logger.sendToServer(logEntry);
      }
    }
  },

  // 發送日誌到服務器
  sendToServer: async (logEntry) => {
    try {
      const db = firebase.firestore();
      await db.collection('logs').add({
        ...JSON.parse(logEntry),
        userId: firebase.auth().currentUser?.uid || 'anonymous',
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    } catch (error) {
      console.error('Failed to send log to server:', error);
    }
  },

  // 便捷方法
  debug: (message, data) => logger.log(logger.levels.DEBUG, message, data),
  info: (message, data) => logger.log(logger.levels.INFO, message, data),
  warn: (message, data) => logger.log(logger.levels.WARN, message, data),
  error: (message, data) => logger.log(logger.levels.ERROR, message, data)
};

// 導出日誌模塊
window.logger = logger; 