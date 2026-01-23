Page({
  data: {
    board: [],
    selectedCount: 0,
    bingoLines: 0,
    showWinModal: false
  },

  onLoad() {
    this.initGame();
  },

  // 初始化游戏
  initGame() {
    // 生成1-75的随机数字
    const numbers = this.generateRandomNumbers(25, 1, 75);
    const board = [];
    
    for (let i = 0; i < 5; i++) {
      const row = [];
      for (let j = 0; j < 5; j++) {
        row.push({
          number: numbers[i * 5 + j],
          selected: false
        });
      }
      board.push(row);
    }

    // 中间格子免费选中
    board[2][2].selected = true;
    board[2][2].number = 'FREE';

    this.setData({
      board: board,
      selectedCount: 1,
      bingoLines: 0,
      showWinModal: false
    });
  },

  // 生成随机数字
  generateRandomNumbers(count, min, max) {
    const numbers = [];
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers;
  },

  // 选择格子
  selectCell(e) {
    const { row, col } = e.currentTarget.dataset;
    const board = this.data.board;
    
    if (row === 2 && col === 2) return; // 中间格子不能取消
    
    board[row][col].selected = !board[row][col].selected;
    
    const selectedCount = this.countSelected(board);
    
    this.setData({
      board: board,
      selectedCount: selectedCount
    });
  },

  // 计算已选择数量
  countSelected(board) {
    let count = 0;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (board[i][j].selected) count++;
      }
    }
    return count;
  },

  // 检查Bingo
  checkBingo() {
    const board = this.data.board;
    let lines = 0;

    // 检查行
    for (let i = 0; i < 5; i++) {
      if (board[i].every(cell => cell.selected)) lines++;
    }

    // 检查列
    for (let j = 0; j < 5; j++) {
      if (board.every(row => row[j].selected)) lines++;
    }

    // 检查对角线
    if (board.every((row, i) => row[i].selected)) lines++;
    if (board.every((row, i) => row[4 - i].selected)) lines++;

    this.setData({
      bingoLines: lines
    });

    if (lines > 0) {
      this.setData({
        showWinModal: true
      });
    } else {
      xhs.showToast({
        title: '还没有连成线哦',
        icon: 'none'
      });
    }
  },

  // 重置游戏
  resetGame() {
    this.initGame();
  },

  // 隐藏获胜弹窗
  hideWinModal() {
    this.setData({
      showWinModal: false
    });
  },

  // 阻止弹窗关闭
  preventClose() {}
});
