// User limit    
async function checkUsageLimitByUID() {
  const user = firebase.auth().currentUser;
  if (!user) return false;

  const today = new Date();
  const yyyyMMdd = today.toISOString().slice(0,10).replace(/-/g, ''); // e.g. 20250417
  const docId = `${user.uid}_${yyyyMMdd}`;

  const doc = await firebase.firestore().collection("userUsage").doc(docId).get();
  const count = doc.exists ? doc.data().count || 0 : 0;

  if (count >= 5) {
    alert("今日占卜次數已達上限");
    return false;
  }
  return true;
}

async function incrementUsageCount() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const today = new Date();
  const yyyyMMdd = today.toISOString().slice(0,10).replace(/-/g, '');
  const docId = `${user.uid}_${yyyyMMdd}`;
  const ref = firebase.firestore().collection("userUsage").doc(docId);

  await firebase.firestore().runTransaction(async (transaction) => {
    const doc = await transaction.get(ref);
    const currentCount = doc.exists ? doc.data().count || 0 : 0;
    transaction.set(ref, { count: currentCount + 1 }, { merge: true });
  });
}
