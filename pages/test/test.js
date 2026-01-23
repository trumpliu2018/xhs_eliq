// MBTI测评题库 - 每个维度10道题，共40题
const questions = [
  // E-I 维度 (外向-内向)
  { id: 1, question: '在社交场合中，我通常是主动与他人交谈的那个人', dimension: 'EI', yesScore: 'E' },
  { id: 2, question: '我更喜欢参加热闹的聚会，而不是安静地独处', dimension: 'EI', yesScore: 'E' },
  { id: 3, question: '我觉得与陌生人交流是一件有趣的事情', dimension: 'EI', yesScore: 'E' },
  { id: 4, question: '长时间独处会让我感到孤独和不安', dimension: 'EI', yesScore: 'E' },
  { id: 5, question: '我在团队中更喜欢担任领导或协调的角色', dimension: 'EI', yesScore: 'E' },
  { id: 6, question: '我需要独处的时间来充电和恢复精力', dimension: 'EI', yesScore: 'I' },
  { id: 7, question: '我更喜欢一对一的深度交流，而不是大型聚会', dimension: 'EI', yesScore: 'I' },
  { id: 8, question: '在做决定前，我倾向于先独自思考', dimension: 'EI', yesScore: 'I' },
  { id: 9, question: '我觉得在人群中待太久会让我感到疲惫', dimension: 'EI', yesScore: 'I' },
  { id: 10, question: '我通常在说话前会先仔细考虑', dimension: 'EI', yesScore: 'I' },

  // S-N 维度 (感觉-直觉)
  { id: 11, question: '我更关注事物的具体细节，而非整体概念', dimension: 'SN', yesScore: 'S' },
  { id: 12, question: '我喜欢按照既定的步骤和方法做事', dimension: 'SN', yesScore: 'S' },
  { id: 13, question: '我更相信实际经验，而非理论知识', dimension: 'SN', yesScore: 'S' },
  { id: 14, question: '我喜欢处理具体的、可见的事物', dimension: 'SN', yesScore: 'S' },
  { id: 15, question: '我善于记住具体的事实和数据', dimension: 'SN', yesScore: 'S' },
  { id: 16, question: '我经常会想象未来的各种可能性', dimension: 'SN', yesScore: 'N' },
  { id: 17, question: '我喜欢探索新的想法和概念', dimension: 'SN', yesScore: 'N' },
  { id: 18, question: '我更关注事物背后的含义和关联', dimension: 'SN', yesScore: 'N' },
  { id: 19, question: '我喜欢用隐喻和比喻来表达想法', dimension: 'SN', yesScore: 'N' },
  { id: 20, question: '我对创新和改变充满兴趣', dimension: 'SN', yesScore: 'N' },

  // T-F 维度 (思考-情感)
  { id: 21, question: '在做决定时，我更注重逻辑分析而非个人感受', dimension: 'TF', yesScore: 'T' },
  { id: 22, question: '我认为客观真理比人际和谐更重要', dimension: 'TF', yesScore: 'T' },
  { id: 23, question: '我能够保持情绪稳定，即使在压力下也能理性思考', dimension: 'TF', yesScore: 'T' },
  { id: 24, question: '我更看重事情的公平性，而非当事人的感受', dimension: 'TF', yesScore: 'T' },
  { id: 25, question: '批评别人时，我会直接指出问题所在', dimension: 'TF', yesScore: 'T' },
  { id: 26, question: '做决定时，我会优先考虑对他人的影响', dimension: 'TF', yesScore: 'F' },
  { id: 27, question: '我很容易感受到他人的情绪变化', dimension: 'TF', yesScore: 'F' },
  { id: 28, question: '维持和谐的人际关系对我很重要', dimension: 'TF', yesScore: 'F' },
  { id: 29, question: '我在批评他人时会特别注意措辞', dimension: 'TF', yesScore: 'F' },
  { id: 30, question: '我经常基于个人价值观做判断', dimension: 'TF', yesScore: 'F' },

  // J-P 维度 (判断-感知)
  { id: 31, question: '我喜欢制定详细的计划并按计划执行', dimension: 'JP', yesScore: 'J' },
  { id: 32, question: '我倾向于尽早完成任务，而不是拖到最后', dimension: 'JP', yesScore: 'J' },
  { id: 33, question: '我喜欢有条理、有组织的生活方式', dimension: 'JP', yesScore: 'J' },
  { id: 34, question: '我不喜欢临时改变已定的计划', dimension: 'JP', yesScore: 'J' },
  { id: 35, question: '我认为守时和遵守承诺很重要', dimension: 'JP', yesScore: 'J' },
  { id: 36, question: '我喜欢保持灵活性，随机应变', dimension: 'JP', yesScore: 'P' },
  { id: 37, question: '我在最后期限前能发挥出最佳状态', dimension: 'JP', yesScore: 'P' },
  { id: 38, question: '我享受探索新事物，即使没有明确的计划', dimension: 'JP', yesScore: 'P' },
  { id: 39, question: '我能够同时处理多项任务', dimension: 'JP', yesScore: 'P' },
  { id: 40, question: '我喜欢保持开放的选择，不急于做决定', dimension: 'JP', yesScore: 'P' }
];

Page({
  data: {
    questions: questions,
    currentIndex: 0,
    answers: [], // 存储答案
    currentQuestion: questions[0],
    progressPercent: 0,
    isAllAnswered: false,
    showExitModal: false
  },

  onLoad() {
    // 初始化answers数组
    const answers = new Array(questions.length).fill(null);
    this.setData({
      answers: answers
    });

    // 尝试恢复之前的答题进度
    const savedAnswers = xhs.getStorageSync('mbti_test_progress');
    if (savedAnswers && savedAnswers.length === questions.length) {
      xhs.showModal({
        title: '提示',
        content: '检测到未完成的测评，是否继续？',
        confirmText: '继续',
        cancelText: '重新开始',
        success: (res) => {
          if (res.confirm) {
            this.setData({
              answers: savedAnswers
            }, () => {
              this.updateProgress();
              // 跳转到第一个未答的题目
              const firstUnanswered = savedAnswers.findIndex(a => a === null);
              if (firstUnanswered !== -1) {
                this.jumpToQuestion({ currentTarget: { dataset: { index: firstUnanswered } } });
              }
            });
          }
        }
      });
    }
  },

  // 选择选项
  selectOption(e) {
    const value = e.currentTarget.dataset.value;
    const answers = this.data.answers;
    answers[this.data.currentIndex] = value;
    
    this.setData({
      answers: answers
    }, () => {
      this.updateProgress();
      // 保存进度
      xhs.setStorageSync('mbti_test_progress', answers);
      
      // 如果不是最后一题，自动跳到下一题
      if (this.data.currentIndex < this.data.questions.length - 1) {
        setTimeout(() => {
          this.nextQuestion();
        }, 300);
      }
    });
  },

  // 更新进度
  updateProgress() {
    const answeredCount = this.data.answers.filter(a => a !== null).length;
    const progressPercent = Math.round((answeredCount / this.data.questions.length) * 100);
    const isAllAnswered = answeredCount === this.data.questions.length;
    
    this.setData({
      progressPercent: progressPercent,
      isAllAnswered: isAllAnswered
    });
  },

  // 上一题
  prevQuestion() {
    if (this.data.currentIndex > 0) {
      const newIndex = this.data.currentIndex - 1;
      this.setData({
        currentIndex: newIndex,
        currentQuestion: this.data.questions[newIndex]
      });
    }
  },

  // 下一题
  nextQuestion() {
    if (this.data.currentIndex < this.data.questions.length - 1) {
      const newIndex = this.data.currentIndex + 1;
      this.setData({
        currentIndex: newIndex,
        currentQuestion: this.data.questions[newIndex]
      });
    }
  },

  // 跳转到指定题目
  jumpToQuestion(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentIndex: index,
      currentQuestion: this.data.questions[index]
    });
  },

  // 提交测评
  submitTest() {
    if (!this.data.isAllAnswered) {
      xhs.showToast({
        title: '请完成所有题目',
        icon: 'none'
      });
      return;
    }

    xhs.showLoading({
      title: '分析中...'
    });

    // 计算MBTI类型
    setTimeout(() => {
      const result = this.calculateMBTI();
      
      // 保存结果
      xhs.setStorageSync('mbti_result', result);
      
      // 清除测评进度
      xhs.removeStorageSync('mbti_test_progress');
      
      xhs.hideLoading();
      
      // 跳转到结果页面
      xhs.redirectTo({
        url: '/pages/result/result'
      });
    }, 1500);
  },

  // 计算MBTI类型
  calculateMBTI() {
    const scores = {
      E: 0, I: 0,
      S: 0, N: 0,
      T: 0, F: 0,
      J: 0, P: 0
    };

    // 统计各维度得分
    this.data.questions.forEach((q, index) => {
      const answer = this.data.answers[index];
      if (answer === 'yes') {
        scores[q.yesScore]++;
      } else {
        // 如果选择'no'，则相反的选项得分
        const opposite = this.getOppositeType(q.yesScore);
        scores[opposite]++;
      }
    });

    // 确定MBTI类型
    const type = 
      (scores.E > scores.I ? 'E' : 'I') +
      (scores.S > scores.N ? 'S' : 'N') +
      (scores.T > scores.F ? 'T' : 'F') +
      (scores.J > scores.P ? 'J' : 'P');

    return {
      type: type,
      scores: scores,
      timestamp: new Date().getTime()
    };
  },

  // 获取相反类型
  getOppositeType(type) {
    const opposites = {
      'E': 'I', 'I': 'E',
      'S': 'N', 'N': 'S',
      'T': 'F', 'F': 'T',
      'J': 'P', 'P': 'J'
    };
    return opposites[type];
  },

  // 显示退出弹窗
  showExitModal() {
    this.setData({
      showExitModal: true
    });
  },

  // 隐藏退出弹窗
  hideExitModal() {
    this.setData({
      showExitModal: false
    });
  },

  // 确认退出
  confirmExit() {
    xhs.navigateBack();
  },

  // 阻止弹窗关闭
  preventClose() {
    // 空函数，阻止事件冒泡
  },

  // 返回按钮拦截
  onUnload() {
    // 如果有未完成的答题，保存进度
    if (!this.data.isAllAnswered) {
      xhs.setStorageSync('mbti_test_progress', this.data.answers);
    }
  }
});
