// 使用 lunarFun 提供農曆轉換工具
function getTimeBasedNumbers() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();

  const [ly, lm, ld, isRun] = lunarFun.gregorianToLunal(year, month, day);

  const labels = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const branch = labels.indexOf(lunarFun.getEarthlyBranches(ly)) + 1;
  const hourBranchNumber = getChineseHourNumber(hour);

  const upper = Math.floor(Math.random() * 1000) + (branch + lm + ld);
  const lower = Math.floor(Math.random() * 1000) + (branch + lm + ld + hourBranchNumber);
  const changing = Math.floor(Math.random() * 1000) + (branch + lm + ld + hourBranchNumber);

  return [lower % 1000, upper % 1000, changing % 1000];
}

// 顯示農曆年月日時（含子時＋天干地支）+ 插入頁面中顯示
function getLunarString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();

  const [ly, lm, ld, isRun] = lunarFun.gregorianToLunal(year, month, day);
  const lunarDate = lunarFun.formatLunarDate(ly, lm, ld, isRun);
  const hourLabel = getChineseHour(hour);

  const stem = lunarFun.getHeavenlyStems(ly);
  const branch = lunarFun.getEarthlyBranches(ly);

  const result = `農曆 ${stem}${branch}年 ${lunarDate} ${hourLabel}`;

  const display = document.getElementById("lunarTime");
  if (display) {
    display.textContent = result;
  }

  return result;
}

// 將 24 小時制轉換為「子、丑、寅...」並對應數字 1~12
function getChineseHour(hour) {
  const labels = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const index = Math.floor(((hour + 1) % 24) / 2);
  const branchName = labels[index];
  return `${branchName}時`;
}

// 只取得子為1...亥為12的時辰數字（供邏輯使用）
function getChineseHourNumber(hour) {
  const index = Math.floor(((hour + 1) % 24) / 2);
  return index + 1; // 1~12
}

// 頁面載入後立即顯示農曆時間
window.addEventListener('DOMContentLoaded', () => {
  getLunarString();
});
