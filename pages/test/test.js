const api = require('../../util/api.js');

Page({
  data: {
    questions: [],
    currentIndex: 0,
    answers: [], // 存储答案
    currentQuestion: null,
    progressPercent: 0,
    isAllAnswered: false,
    showExitModal: false,
    isLoading: true,
    loadError: false,
    scrollIntoView: ''
  },

  onLoad() {
    // 从API加载题目
    this.loadQuestions();
  },

  // 从API加载题目
  loadQuestions() {
    xhs.showLoading({
      title: '加载题目中...'
    });

    this.setData({
      isLoading: true,
      loadError: false
    });

    api.getQuestions()
      .then((data) => {
        // 转换API返回的数据格式
        const questions = data
          .filter(q => q.is_active) // 只使用激活的题目
          .sort((a, b) => a.order - b.order) // 按order排序
          .map(q => ({
            id: q.id,
            question: q.content,
            dimension: q.dimension,
            yesScore: q.direction
          }));

        if (questions.length === 0) {
          throw new Error('没有可用的题目');
        }

        // 初始化answers数组
        const answers = new Array(questions.length).fill(null);

        this.setData({
          questions: questions,
          answers: answers,
          currentQuestion: questions[0],
          isLoading: false
        });

        xhs.hideLoading();

        // 尝试恢复之前的答题进度
        this.restoreProgress(questions.length);
      })
      .catch((err) => {
        console.error('加载题目失败:', err);
        
        xhs.hideLoading();
        
        this.setData({
          isLoading: false,
          loadError: true
        });

        xhs.showModal({
          title: '加载失败',
          content: err.message || '无法加载题目，请检查网络后重试',
          confirmText: '重试',
          cancelText: '返回',
          success: (res) => {
            if (res.confirm) {
              this.loadQuestions();
            } else {
              xhs.navigateBack();
            }
          }
        });
      });
  },

  // 恢复答题进度
  restoreProgress(questionsLength) {
    const savedAnswers = xhs.getStorageSync('mbti_test_progress');
    if (savedAnswers && savedAnswers.length === questionsLength) {
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
        currentQuestion: this.data.questions[newIndex],
        scrollIntoView: `nav-item-${newIndex}`
      });
    }
  },

  // 下一题
  nextQuestion() {
    if (this.data.currentIndex < this.data.questions.length - 1) {
      const newIndex = this.data.currentIndex + 1;
      this.setData({
        currentIndex: newIndex,
        currentQuestion: this.data.questions[newIndex],
        scrollIntoView: `nav-item-${newIndex}`
      });
    }
  },

  // 跳转到指定题目
  jumpToQuestion(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentIndex: index,
      currentQuestion: this.data.questions[index],
      scrollIntoView: `nav-item-${index}`
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
