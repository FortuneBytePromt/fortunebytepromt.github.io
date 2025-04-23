// 安全功能測試
async function runSecurityTests() {
  console.log('開始安全功能測試...');

  // 測試密碼強度
  console.log('\n測試密碼強度檢查:');
  const weakPassword = '123456';
  const strongPassword = 'Test123!@#';
  const passwordStrength = checkPasswordStrength(strongPassword);
  console.log('密碼強度測試:', passwordStrength.score >= 3 ? '通過' : '失敗');

  // 測試電子郵件驗證
  console.log('\n測試電子郵件驗證:');
  const validEmail = 'test@example.com';
  const invalidEmail = 'invalid-email';
  console.log('有效電子郵件測試:', validateEmail(validEmail) ? '通過' : '失敗');
  console.log('無效電子郵件測試:', !validateEmail(invalidEmail) ? '通過' : '失敗');

  // 測試 XSS 防護
  console.log('\n測試 XSS 防護:');
  const xssInput = '<script>alert("XSS")</script>';
  const sanitizedInput = sanitizeInput(xssInput);
  console.log('XSS 防護測試:', !sanitizedInput.includes('<script>') ? '通過' : '失敗');

  // 測試 CSRF Token
  console.log('\n測試 CSRF Token:');
  const token1 = generateCSRFToken();
  const token2 = generateCSRFToken();
  console.log('CSRF Token 唯一性測試:', token1 !== token2 ? '通過' : '失敗');

  // 測試會話超時
  console.log('\n測試會話超時:');
  lastActivity = Date.now() - (SESSION_TIMEOUT + 1000);
  checkSessionTimeout();
  console.log('會話超時測試: 請檢查是否自動登出');

  // 測試 HTTPS 強制跳轉
  console.log('\n測試 HTTPS 強制跳轉:');
  if (window.location.protocol === 'http:') {
    console.log('HTTP 協議測試: 請檢查是否自動跳轉到 HTTPS');
  } else {
    console.log('HTTPS 協議測試: 通過');
  }

  console.log('\n安全功能測試完成！');
}

// 執行測試
runSecurityTests(); 