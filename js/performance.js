// 性能監控系統

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: null,
      apiCalls: [],
      userInteractions: [],
      errors: []
    };
    this.startTime = performance.now();
  }

  // 記錄頁面加載時間
  recordPageLoad() {
    const loadTime = performance.now() - this.startTime;
    this.metrics.pageLoad = loadTime;
    this.logMetric('pageLoad', loadTime);
  }

  // 記錄 API 調用
  recordApiCall(url, method, duration, status) {
    const apiCall = {
      timestamp: new Date().toISOString(),
      url,
      method,
      duration,
      status
    };
    this.metrics.apiCalls.push(apiCall);
    this.logMetric('apiCall', apiCall);
  }

  // 記錄用戶交互
  recordUserInteraction(type, target, duration) {
    const interaction = {
      timestamp: new Date().toISOString(),
      type,
      target,
      duration
    };
    this.metrics.userInteractions.push(interaction);
    this.logMetric('userInteraction', interaction);
  }

  // 記錄錯誤
  recordError(error, context) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context
    };
    this.metrics.errors.push(errorRecord);
    this.logMetric('error', errorRecord);
  }

  // 記錄性能指標
  logMetric(type, data) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${type}:`, data);
    }
  }

  // 獲取性能報告
  getPerformanceReport() {
    return {
      pageLoad: this.metrics.pageLoad,
      apiCalls: {
        total: this.metrics.apiCalls.length,
        average: this.calculateAverage(this.metrics.apiCalls.map(call => call.duration)),
        byStatus: this.groupByStatus(this.metrics.apiCalls)
      },
      userInteractions: {
        total: this.metrics.userInteractions.length,
        byType: this.groupByType(this.metrics.userInteractions)
      },
      errors: {
        total: this.metrics.errors.length,
        byType: this.groupByErrorType(this.metrics.errors)
      }
    };
  }

  // 計算平均值
  calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  // 按狀態分組
  groupByStatus(apiCalls) {
    return apiCalls.reduce((groups, call) => {
      const status = call.status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(call);
      return groups;
    }, {});
  }

  // 按類型分組
  groupByType(interactions) {
    return interactions.reduce((groups, interaction) => {
      const type = interaction.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(interaction);
      return groups;
    }, {});
  }

  // 按錯誤類型分組
  groupByErrorType(errors) {
    return errors.reduce((groups, error) => {
      const type = error.message.split(':')[0];
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(error);
      return groups;
    }, {});
  }

  // 導出性能報告
  exportReport() {
    const report = this.getPerformanceReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// 創建單例實例
const performanceMonitor = new PerformanceMonitor();

// 導出實例
export default performanceMonitor; 