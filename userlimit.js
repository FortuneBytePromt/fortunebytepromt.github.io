    
    function getUsageData() {
      const today = new Date().toISOString().slice(0, 10);
      let data = localStorage.getItem("yiUsage");
      if (data) {
        data = JSON.parse(data);        
        if (data.date !== today) {
          data = { date: today, count: 0 };
        }
      } else {
        data = { date: today, count: 0 };
      }
      return data;
    }
    function updateUsageData(data) {
      localStorage.setItem("yiUsage", JSON.stringify(data));
    }
    function checkUsageLimit() {
      const usage = getUsageData();
      if (usage.count >= 3) {
        alert("⚠️ 今天的占卦次數已用完，請明天再試！");
        return false;
      }
      return true;
    }
    function incrementUsage() {
      const usage = getUsageData();
      usage.count++;
      updateUsageData(usage);
    }
