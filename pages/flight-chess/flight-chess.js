Page({
  data: {
    currentPlayer: 1,
    diceNumber: 6,
    rolling: false,
    round: 1,
    showRulesModal: false,
    players: [
      { id: 1, x: 10, y: 10, progress: 0 },
      { id: 2, x: 80, y: 10, progress: 0 },
      { id: 3, x: 80, y: 80, progress: 0 },
      { id: 4, x: 10, y: 80, progress: 0 }
    ]
  },

  onLoad() {
    // 初始化游戏
  },

  // 投骰子
  rollDice() {
    if (this.data.rolling) return;

    this.setData({
      rolling: true
    });

    // 模拟投骰子动画
    let count = 0;
    const interval = setInterval(() => {
      this.setData({
        diceNumber: Math.floor(Math.random() * 6) + 1
      });
      count++;
      if (count >= 10) {
        clearInterval(interval);
        this.setData({
          rolling: false
        });
        this.movePiece(this.data.diceNumber);
      }
    }, 100);
  },

  // 移动棋子
  movePiece(steps) {
    const players = this.data.players;
    const currentPlayer = this.data.currentPlayer;
    const playerIndex = currentPlayer - 1;
    
    // 简化的移动逻辑
    players[playerIndex].progress += steps * 5;
    if (players[playerIndex].progress > 100) {
      players[playerIndex].progress = 100;
      this.showWinMessage(currentPlayer);
    }

    // 切换玩家
    let nextPlayer = currentPlayer;
    if (this.data.diceNumber !== 6) {
      nextPlayer = (currentPlayer % 4) + 1;
      if (nextPlayer === 1) {
        this.setData({ round: this.data.round + 1 });
      }
    }

    this.setData({
      players: players,
      currentPlayer: nextPlayer
    });
  },

  // 显示获胜消息
  showWinMessage(player) {
    xhs.showModal({
      title: '游戏结束',
      content: `玩家 ${player} 获胜！`,
      showCancel: false,
      confirmText: '再来一局',
      success: (res) => {
        if (res.confirm) {
          this.resetGame();
        }
      }
    });
  },

  // 重置游戏
  resetGame() {
    this.setData({
      currentPlayer: 1,
      diceNumber: 6,
      rolling: false,
      round: 1,
      players: [
        { id: 1, x: 10, y: 10, progress: 0 },
        { id: 2, x: 80, y: 10, progress: 0 },
        { id: 3, x: 80, y: 80, progress: 0 },
        { id: 4, x: 10, y: 80, progress: 0 }
      ]
    });
  },

  // 显示规则
  showRules() {
    this.setData({
      showRulesModal: true
    });
  },

  // 隐藏规则
  hideRules() {
    this.setData({
      showRulesModal: false
    });
  },

  // 阻止弹窗关闭
  preventClose() {}
});
