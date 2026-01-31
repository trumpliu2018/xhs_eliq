const api = require('../../util/api.js');
const auth = require('../../util/auth.js');
const { 
  saveAchievements, 
  loadAchievements, 
  detectAchievementChanges, 
  getAchievementDescription 
} = require('../../utils/achievementStorage.js');

Page({
  data: {
    // 房间信息
    roomCode: '',
    roomId: null,
    hasJoined: false,
    
    // 参与者列表
    participants: [],
    targetId: null,
    targetParticipant: null,
    
    // 格子数据
    mbtiIntro: '',
    gridCells: [], // 25个格子，每个包含：id, trait_text, position, score, evaluated_by_me
    
    // 成就列表
    achievements: [],
    
    // 加载状态
    isLoading: false,
    isEvaluating: false,
    
    // 当前登录用户ID
    currentUserId: null,
    currentUserInfo: null,
    
    // 加入房间弹窗
    showJoinModal: true,
    inputRoomCode: '',
    
    // 定时器
    evaluationTimer: null,
    
    // 特效相关
    highlightedCells: [],
    showConfetti: false,
    storedAchievements: [],
    isInitialized: false
  },

  onLoad() {
    // 获取当前用户ID
    const userInfo = auth.getCurrentUser();
    if (!userInfo || !userInfo.id) {
      xhs.showModal({
        title: '需要登录',
        content: '请先登录后再玩Bingo游戏',
        showCancel: false,
        success: () => {
          xhs.switchTab({
            url: '/pages/profile/profile'
          });
        }
      });
      return;
    }
    
    this.setData({
      currentUserId: userInfo.id,
      currentUserInfo: userInfo
    });
    
    // 显示加入房间弹窗
    this.setData({
      showJoinModal: true
    });
  },

  onShow() {
    // 页面显示时启动轮询
    this.startPolling();
  },

  onHide() {
    // 页面隐藏时停止轮询
    this.stopPolling();
  },

  onUnload() {
    // 页面卸载时停止轮询
    this.stopPolling();
  },

  // 启动轮询（每5秒刷新评价数据）
  startPolling() {
    this.stopPolling(); // 先清除旧的定时器
    
    const timer = setInterval(() => {
      if (this.data.targetId && this.data.roomId) {
        this.loadEvaluations();
      }
    }, 5000);
    
    this.setData({
      evaluationTimer: timer
    });
  },

  // 停止轮询
  stopPolling() {
    if (this.data.evaluationTimer) {
      clearInterval(this.data.evaluationTimer);
      this.setData({
        evaluationTimer: null
      });
    }
  },

  // 输入房间号
  onRoomCodeInput(e) {
    this.setData({
      inputRoomCode: e.detail.value
    });
  },

  // 加入房间
  handleJoinRoom() {
    const { inputRoomCode, currentUserInfo } = this.data;
    
    if (!inputRoomCode || inputRoomCode.trim() === '') {
      xhs.showToast({
        title: '请输入房间号',
        icon: 'none'
      });
      return;
    }
    
    if (!currentUserInfo || !currentUserInfo.mbti_type) {
      xhs.showModal({
        title: '请先完善MBTI类型',
        content: '加入游戏需要设置您的MBTI类型',
        showCancel: false,
        success: () => {
          xhs.switchTab({
            url: '/pages/profile/profile'
          });
        }
      });
      return;
    }
    
    this.setData({ isLoading: true });
    
    api.joinRoom(inputRoomCode.trim(), currentUserInfo.mbti_type)
      .then((res) => {
        // 加入成功
        const roomId = res.participant?.room_id || res.room?.id;
        
        this.setData({
          roomCode: inputRoomCode.trim(),
          roomId: roomId,
          hasJoined: true,
          showJoinModal: false,
          isLoading: false
        });
        
        xhs.showToast({
          title: '加入成功',
          icon: 'success'
        });
        
        // 初始化游戏
        this.initGame();
      })
      .catch((err) => {
        // 如果是409，说明已经加入
        if (err.code === 409) {
          this.setData({
            roomCode: inputRoomCode.trim(),
            hasJoined: true,
            showJoinModal: false,
            isLoading: false
          });
          
          xhs.showToast({
            title: '已在房间中',
            icon: 'success'
          });
          
          // 初始化游戏
          this.initGame();
        } else {
          console.error('加入房间失败:', err);
          xhs.showToast({
            title: err.message || '加入失败',
            icon: 'none'
          });
          this.setData({ isLoading: false });
        }
      });
  },

  // 关闭加入房间弹窗
  closeJoinModal() {
    // 如果还没加入房间，返回上一页
    if (!this.data.hasJoined) {
      xhs.navigateBack();
    }
  },

  // 阻止弹窗关闭
  preventClose() {},

  // 获取成就对应的格子位置（position 从 1 开始）
  getAchievementCellPositions(achievement) {
    const { achievement_type, line_index } = achievement;
    
    if (achievement_type === 'row') {
      // 横线：第 line_index 行的 5 个格子
      const startPos = line_index * 5 + 1;
      return [startPos, startPos + 1, startPos + 2, startPos + 3, startPos + 4];
    } else if (achievement_type === 'col') {
      // 竖线：第 line_index 列的 5 个格子
      const startPos = line_index + 1;
      return [startPos, startPos + 5, startPos + 10, startPos + 15, startPos + 20];
    } else if (achievement_type === 'diagonal') {
      if (line_index === 0) {
        // 主对角线：position 1,7,13,19,25
        return [1, 7, 13, 19, 25];
      } else {
        // 副对角线：position 5,9,13,17,21
        return [5, 9, 13, 17, 21];
      }
    }
    return [];
  },

  // 逐个高亮格子的动画
  async animateAchievement(achievement) {
    const positions = this.getAchievementCellPositions(achievement);
    let highlightedCells = [];
    
    // 逐个高亮格子
    for (let i = 0; i < positions.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      highlightedCells.push(positions[i]);
      this.setData({ highlightedCells: [...highlightedCells] });
    }
    
    // 所有格子高亮后，闪烁效果
    await new Promise(resolve => setTimeout(resolve, 500));
    this.setData({ highlightedCells: [] });
    await new Promise(resolve => setTimeout(resolve, 200));
    this.setData({ highlightedCells: positions });
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // 清除高亮
    this.setData({ highlightedCells: [] });
  },

  // 触发烟花特效
  triggerConfetti() {
    this.setData({ showConfetti: true });
  },

  // 烟花动画完成
  onConfettiFinished() {
    this.setData({ showConfetti: false });
  },

  // 检测成就变化
  checkAchievementChanges(newAchievements) {
    const { roomId, targetId, storedAchievements, isInitialized } = this.data;
    
    if (!roomId || !targetId || !newAchievements) return;
    
    // 首次初始化：直接设置为基准，不触发任何提示
    if (!isInitialized) {
      this.setData({
        storedAchievements: newAchievements,
        isInitialized: true
      });
      saveAchievements(roomId, targetId, newAchievements);
      return;
    }
    
    // 检测变化
    const { added } = detectAchievementChanges(storedAchievements, newAchievements);
    
    // 新增成就：显示特效和提示
    if (added.length > 0) {
      // 异步执行动画
      this.playAchievementAnimations(added);
    }
    
    // 更新本地存储
    if (JSON.stringify(storedAchievements) !== JSON.stringify(newAchievements)) {
      this.setData({ storedAchievements: newAchievements });
      saveAchievements(roomId, targetId, newAchievements);
    }
  },

  // 播放成就动画序列
  async playAchievementAnimations(achievements) {
    for (const achievement of achievements) {
      // 显示提示
      const description = getAchievementDescription(achievement);
      xhs.showToast({
        title: `🎉 达成 Bingo！${description}`,
        icon: 'none',
        duration: 3000
      });
      
      // 播放扫描动画
      await this.animateAchievement(achievement);
    }
    
    // 所有动画完成后触发烟花
    this.triggerConfetti();
  },

  // 初始化游戏
  initGame() {
    if (!this.data.hasJoined || !this.data.roomCode) {
      return;
    }
    
    this.setData({ isLoading: true });
    
    // 加载参与者列表
    this.loadParticipants();
  },

  // 加载参与者列表
  loadParticipants() {
    api.getRoomParticipants(this.data.roomCode)
      .then((res) => {
        const participants = res.participants || [];
        
        if (participants.length === 0) {
          xhs.showToast({
            title: '房间暂无参与者',
            icon: 'none'
          });
          this.setData({ isLoading: false });
          return;
        }
        
        // 从第一个参与者获取 room_id
        const roomId = participants[0]?.room_id;
        
        // 设置默认被评价者：第一个不是自己的用户
        let defaultTarget = participants.find(p => p.user_id !== this.data.currentUserId);
        if (!defaultTarget) {
          defaultTarget = participants[0]; // 如果只有自己，就选自己
        }
        
        this.setData({
          participants: participants,
          roomId: roomId,
          targetId: defaultTarget.user_id,
          targetParticipant: defaultTarget
        });
        
        // 加载特质和评价数据
        this.loadTraits();
        this.loadEvaluations();
      })
      .catch((err) => {
        console.error('加载参与者失败:', err);
        xhs.showToast({
          title: err.message || '加载失败',
          icon: 'none'
        });
        this.setData({ isLoading: false });
      });
  },

  // 加载MBTI特质列表
  loadTraits() {
    const mbtiType = this.data.targetParticipant?.mbti_type;
    
    if (!mbtiType) {
      return;
    }
    
    api.getBingoTraits(mbtiType)
      .then((res) => {
        const traits = res.traits || [];
        
        // 第一条是介绍文本
        const intro = traits[0]?.trait_text || '';
        
        // 后25条是特质，按position排序
        const traitList = traits.slice(1).sort((a, b) => a.position - b.position);
        
        this.setData({
          mbtiIntro: intro,
          traits: traitList
        });
        
        // 构建格子数据
        this.buildGridCells();
      })
      .catch((err) => {
        console.error('加载特质失败:', err);
        xhs.showToast({
          title: '加载特质失败',
          icon: 'none'
        });
      });
  },

  // 加载评价数据
  loadEvaluations() {
    const { roomId, targetId } = this.data;
    
    if (!roomId || !targetId) {
      return;
    }
    
    api.getReceivedEvaluations(roomId, targetId)
      .then((res) => {
        this.setData({
          evaluations: res.evaluations || [],
          achievements: res.achievements || [],
          isLoading: false
        });
        
        // 构建格子数据
        this.buildGridCells();
        
        // 检测成就变化
        this.checkAchievementChanges(res.achievements || []);
      })
      .catch((err) => {
        console.error('加载评价失败:', err);
        this.setData({ isLoading: false });
      });
  },

  // 构建5x5格子数据
  buildGridCells() {
    const { traits, evaluations, currentUserId } = this.data;
    
    if (!traits || traits.length === 0 || !evaluations) {
      return;
    }
    
    // 创建评价数据映射表
    const evaluationMap = new Map();
    evaluations.forEach(ev => {
      // 判断当前用户是否评价过
      let evaluatedByMe = false;
      if (ev.evaluators && currentUserId) {
        evaluatedByMe = ev.evaluators.some(evaluator => evaluator.user_id === currentUserId);
      }
      
      evaluationMap.set(ev.trait_id, {
        score: ev.score || 0,
        evaluated_by_me: evaluatedByMe
      });
    });
    
    // 构建格子数据
    const gridCells = traits.map(trait => {
      const evalData = evaluationMap.get(trait.id) || { score: 0, evaluated_by_me: false };
      return {
        id: trait.id,
        trait_text: trait.trait_text,
        position: trait.position,
        score: evalData.score,
        evaluated_by_me: evalData.evaluated_by_me
      };
    });
    
    this.setData({
      gridCells: gridCells
    });
  },

  // 切换被评价者
  onParticipantSelect(e) {
    const userId = parseInt(e.currentTarget.dataset.userId);
    
    if (userId === this.data.targetId) {
      return; // 已经是当前选中的，不重复加载
    }
    
    const targetParticipant = this.data.participants.find(p => p.user_id === userId);
    
    if (!targetParticipant) {
      return;
    }
    
    // 停止轮询
    this.stopPolling();
    
    // 从本地存储加载该用户的成就作为基准
    const { roomId } = this.data;
    const stored = roomId ? loadAchievements(roomId, userId) : [];
    
    this.setData({
      targetId: userId,
      targetParticipant: targetParticipant,
      isLoading: true,
      gridCells: [],
      achievements: [],
      storedAchievements: stored,
      isInitialized: false,
      highlightedCells: []
    });
    
    // 重新加载特质和评价
    this.loadTraits();
    this.loadEvaluations();
    
    // 重启轮询
    this.startPolling();
  },

  // 点击格子：评价或取消评价
  onCellTap(e) {
    const { cellId, evaluatedByMe } = e.currentTarget.dataset;
    const { roomId, targetId, isEvaluating } = this.data;
    
    if (isEvaluating) {
      return; // 防止重复点击
    }
    
    this.setData({ isEvaluating: true });
    
    // 根据当前状态决定是创建还是删除评价
    const apiCall = evaluatedByMe 
      ? api.deleteBingoInteraction(roomId, targetId, cellId)
      : api.createBingoInteraction(roomId, targetId, cellId);
    
    apiCall
      .then(() => {
        // 刷新评价数据
        this.loadEvaluations();
        this.setData({ isEvaluating: false });
      })
      .catch((err) => {
        console.error('评价操作失败:', err);
        xhs.showToast({
          title: err.message || '操作失败',
          icon: 'none'
        });
        this.setData({ isEvaluating: false });
      });
  },

  // 获取格子背景色类名（根据score）
  getScoreClass(score) {
    const scoreColors = ['score-0', 'score-1', 'score-2', 'score-3', 'score-4', 'score-5'];
    const index = Math.min(score, 5);
    return scoreColors[index];
  },

  // 获取成就描述
  getAchievementDesc(achievement) {
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
});
