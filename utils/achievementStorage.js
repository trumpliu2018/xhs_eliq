// 成就本地存储工具

/**
 * 保存成就到本地存储
 * @param {number} roomId 
 * @param {number} targetId 
 * @param {Array} achievements 
 */
function saveAchievements(roomId, targetId, achievements) {
  const key = `bingo_achievements_${roomId}_${targetId}`;
  try {
    xhs.setStorageSync(key, JSON.stringify(achievements));
  } catch (err) {
    console.error('保存成就失败:', err);
  }
}

/**
 * 加载成就从本地存储
 * @param {number} roomId 
 * @param {number} targetId 
 * @returns {Array}
 */
function loadAchievements(roomId, targetId) {
  const key = `bingo_achievements_${roomId}_${targetId}`;
  try {
    const data = xhs.getStorageSync(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('加载成就失败:', err);
  }
  return [];
}

/**
 * 检测成就变化
 * @param {Array} oldAchievements 
 * @param {Array} newAchievements 
 * @returns {{added: Array, removed: Array}}
 */
function detectAchievementChanges(oldAchievements, newAchievements) {
  const oldSet = new Set(
    oldAchievements.map(a => `${a.achievement_type}-${a.line_index}`)
  );
  const newSet = new Set(
    newAchievements.map(a => `${a.achievement_type}-${a.line_index}`)
  );
  
  const added = newAchievements.filter(a => 
    !oldSet.has(`${a.achievement_type}-${a.line_index}`)
  );
  
  const removed = oldAchievements.filter(a => 
    !newSet.has(`${a.achievement_type}-${a.line_index}`)
  );
  
  return { added, removed };
}

/**
 * 获取成就描述
 * @param {Object} achievement 
 * @returns {string}
 */
function getAchievementDescription(achievement) {
  const { achievement_type, line_index } = achievement;
  
  if (achievement_type === 'row') {
    return `横线 第${line_index + 1}行`;
  } else if (achievement_type === 'col') {
    return `竖线 第${line_index + 1}列`;
  } else if (achievement_type === 'diagonal') {
    return line_index === 0 ? '主对角线' : '副对角线';
  }
  return '成就';
}

module.exports = {
  saveAchievements,
  loadAchievements,
  detectAchievementChanges,
  getAchievementDescription
};
