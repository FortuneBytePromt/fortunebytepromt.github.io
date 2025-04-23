// 工具函數庫

// 錯誤處理
const ErrorHandler = {
  handle: function(error, userFriendlyMessage = '發生錯誤，請稍後再試') {
    console.error('Error:', error);
    this.showError(userFriendlyMessage);
    this.logError(error);
  },

  showError: function(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.textContent = message;
    document.body.insertBefore(errorDiv, document.body.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
  },

  logError: function(error) {
    // 這裡可以添加錯誤日誌記錄邏輯
    console.error('Error logged:', error);
  }
};

// 輸入驗證
const Validator = {
  sanitizeInput: function(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[<>]/g, '');
  },

  validateEmail: function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  validatePassword: function(password) {
    return password.length >= 8;
  }
};

// 載入狀態管理
const LoadingManager = {
  show: function(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = '<div class="loading"></div>';
    }
  },

  hide: function(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = '';
    }
  }
};

// 本地存儲管理
const StorageManager = {
  set: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      ErrorHandler.handle(error, '無法保存數據');
    }
  },

  get: function(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      ErrorHandler.handle(error, '無法讀取數據');
      return null;
    }
  },

  remove: function(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      ErrorHandler.handle(error, '無法刪除數據');
    }
  }
};

// 日期時間處理
const DateTimeHelper = {
  formatDate: function(date) {
    return new Date(date).toLocaleDateString('zh-TW');
  },

  formatTime: function(date) {
    return new Date(date).toLocaleTimeString('zh-TW');
  },

  formatDateTime: function(date) {
    return new Date(date).toLocaleString('zh-TW');
  }
};

// 動畫效果
const AnimationHelper = {
  fadeIn: function(element, duration = 300) {
    element.style.opacity = 0;
    element.style.display = 'block';
    let start = null;
    
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      element.style.opacity = Math.min(progress / duration, 1);
      
      if (progress < duration) {
        window.requestAnimationFrame(animate);
      }
    }
    
    window.requestAnimationFrame(animate);
  },

  fadeOut: function(element, duration = 300) {
    let start = null;
    
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      element.style.opacity = 1 - Math.min(progress / duration, 1);
      
      if (progress < duration) {
        window.requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
      }
    }
    
    window.requestAnimationFrame(animate);
  }
};

// 導出所有工具
export {
  ErrorHandler,
  Validator,
  LoadingManager,
  StorageManager,
  DateTimeHelper,
  AnimationHelper
}; 