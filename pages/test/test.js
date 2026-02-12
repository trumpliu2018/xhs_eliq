const api = require('../../util/api.js');
const auth = require('../../util/auth.js');

Page({
  data: {
    questions: [],
    currentIndex: 0,
    answers: [], // 存储答案
    currentQuestion: null,
    currentAnswer: null, // 当前题目的已选答案（维度字母）
    progressPercent: 0,
    isAllAnswered: false,
    showExitModal: false,
    isLoading: true,
    loadError: false,
    testSession: null, // 测试会话信息
    testSessionId: null // 测试会话ID
  },

  onLoad() {
    // 初始化测试会话并加载题目
    this.initTestSession();
  },

  // 初始化测试会话
  initTestSession() {
    xhs.showLoading({
      title: '初始化中...'
    });

    this.setData({
      isLoading: true,
      loadError: false
    });

    // 先检查是否存在正在进行的会话
    api.getCurrentTestSession()
      .then((session) => {
        if (session && session.status === 'in_progress') {
          // 存在进行中的会话，使用该会话
          console.log('找到正在进行的会话:', session);
          this.setData({
            testSession: session,
            testSessionId: session.test_session_id
          });
          
          // 加载题目
          this.loadQuestions();
        } else {
          // 没有进行中的会话，创建新会话
          console.log('没有进行中的会话，创建新会话');
          return api.createTestSession();
        }
      })
      .then((response) => {
        if (response) {
          // 创建了新会话
          console.log('创建新会话成功:', response);
          this.setData({
            testSession: response.session,
            testSessionId: response.test_session_id
          });
          
          // 加载题目
          this.loadQuestions();
        }
      })
      .catch((err) => {
        console.error('初始化测试会话失败:', err);
        
        xhs.hideLoading();
        
        this.setData({
          isLoading: false,
          loadError: true
        });

        // 401 未登录：提示登录并跳转到「我」tab
        if (err.code === 401) {
          xhs.showModal({
            title: '请先登录',
            content: '登录后可进行MBTI测评',
            showCancel: false,
            success: () => {
              xhs.switchTab({
                url: '/pages/profile/profile'
              });
            }
          });
          return;
        }

        xhs.showModal({
          title: '初始化失败',
          content: err.message || '无法初始化测试会话，请检查网络后重试',
          confirmText: '重试',
          cancelText: '返回',
          success: (res) => {
            if (res.confirm) {
              this.initTestSession();
            } else {
              xhs.navigateBack();
            }
          }
        });
      });
  },

  // 从API加载题目
  loadQuestions() {
    // 如果已经在loading状态，不需要再次显示
    if (!this.data.isLoading) {
      xhs.showLoading({
        title: '加载题目中...'
      });
    }

    api.getQuestions()
      .then((data) => {
        // 转换API返回的数据格式
        const questions = data
          .filter(q => q.is_active) // 只使用激活的题目
          .sort((a, b) => a.order - b.order) // 按order排序
          .map(q => ({
            id: q.id,
            question: q.content,
            // 维度对，例如 "EI"、"SN"、"TF"、"JP"
            dimension: q.dimension,
            // 题目两端的具体文案
            positive: q.positive,
            negative: q.negative
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
          currentAnswer: null,
          isPositiveSelected: false,
          isNegativeSelected: false,
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
              } else {
                // 如果都已回答，保持在当前题目并刷新选中状态
                this.updateCurrentSelection(this.data.currentIndex);
              }
            });
          }
        }
      });
    }
  },

  // 选择选项
  selectOption(e) {
    const choice = e.currentTarget.dataset.value; // 'positive' | 'negative'
    const answers = this.data.answers.slice();

    const currentQuestion = this.data.questions[this.data.currentIndex];
    const dim = currentQuestion.dimension || '';

    // 根据题目维度和选择，映射到具体维度字母，例如 'E' / 'I'
    let answerValue = null;
    if (dim && dim.length === 2) {
      // positive 对应第一个字母，negative 对应第二个字母
      answerValue = choice === 'positive' ? dim.charAt(0) : dim.charAt(1);
    }

    if (!answerValue) {
      console.warn('无法根据题目维度计算答案', currentQuestion, choice);
      xhs.showToast({
        title: '题目配置异常，请稍后重试',
        icon: 'none'
      });
      return;
    }

    const index = this.data.currentIndex;
    answers[index] = answerValue;
    
    // 更新当前题目的选中状态
    const isPositiveSelected = answerValue === dim.charAt(0);
    const isNegativeSelected = answerValue === dim.charAt(1);

    this.setData({
      answers: answers,
      currentAnswer: answerValue,
      isPositiveSelected,
      isNegativeSelected
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
      this.updateCurrentSelection(newIndex);
    }
  },

  // 下一题
  nextQuestion() {
    if (this.data.currentIndex < this.data.questions.length - 1) {
      const newIndex = this.data.currentIndex + 1;
      this.updateCurrentSelection(newIndex);
    }
  },

  // 跳转到指定题目
  jumpToQuestion(e) {
    const index = e.currentTarget.dataset.index;
    this.updateCurrentSelection(index);
  },

  // 根据指定题目的答案，更新当前题目和选中态
  updateCurrentSelection(index) {
    const question = this.data.questions[index];
    const answer = this.data.answers[index];
    const dim = question && question.dimension ? question.dimension : '';

    let isPositiveSelected = false;
    let isNegativeSelected = false;
    if (answer && dim && dim.length === 2) {
      isPositiveSelected = answer === dim.charAt(0);
      isNegativeSelected = answer === dim.charAt(1);
    }

    this.setData({
      currentIndex: index,
      currentQuestion: question,
      currentAnswer: answer || null,
      isPositiveSelected,
      isNegativeSelected
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

    if (!this.data.testSessionId) {
      xhs.showToast({
        title: '会话异常，请重新开始测评',
        icon: 'none'
      });
      return;
    }

    xhs.showLoading({
      title: '提交中...'
    });

    // 构造答案数据（answer 为具体维度字母，如 'E' / 'I' 等）
    const answers = this.data.questions.map((q, index) => ({
      question_id: q.id,
      answer: this.data.answers[index] // 'E' / 'I' / 'S' / 'N' / 'T' / 'F' / 'J' / 'P'
    }));

    // 提交到服务器
    api.submitAnswers(this.data.testSessionId, answers)
      .then((response) => {
        console.log('提交成功:', response);
        
        const mbtiType = response.mbti_type;
        const hasXType = mbtiType && mbtiType.includes('X');
        
        // 保存结果到本地
        const result = {
          type: mbtiType,
          result: response.result,
          timestamp: new Date().getTime()
        };
        xhs.setStorageSync('mbti_result', result);
        
        // 更新用户信息中的 mbti_type（不修改头像）
        if (auth.isLoggedIn()) {
          const userInfo = auth.getCurrentUser();
          if (userInfo) {
            userInfo.mbti_type = mbtiType;
            auth.saveAuthInfo(auth.getToken(), userInfo);
            console.log('已更新用户MBTI类型:', mbtiType);
          }
        }
        
        // 清除测评进度
        xhs.removeStorageSync('mbti_test_progress');
        
        xhs.hideLoading();
        
        // 根据是否包含X决定跳转目标
        if (hasXType) {
          console.log('检测到X类型，跳转到"我"页面');
          xhs.showToast({
            title: '测评完成',
            icon: 'success',
            duration: 1500
          });
          
          // 跳转到"我"tab页
          setTimeout(() => {
            xhs.switchTab({
              url: '/pages/profile/profile'
            });
          }, 1500);
        } else {
          console.log('正常类型，跳转到结果页');
          xhs.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 1500
          });
          
          // 跳转到结果页面
          setTimeout(() => {
            xhs.redirectTo({
              url: '/pages/result/result'
            });
          }, 1500);
        }
      })
      .catch((err) => {
        console.error('提交失败:', err);
        
        xhs.hideLoading();
        
        xhs.showModal({
          title: '提交失败',
          content: err.message || '无法提交答案，请稍后重试',
          confirmText: '重试',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              this.submitTest();
            }
          }
        });
      });
  },

  // 计算MBTI类型
  calculateMBTI() {
    const scores = {
      E: 0, I: 0,
      S: 0, N: 0,
      T: 0, F: 0,
      J: 0, P: 0
    };

    // 统计各维度得分：本地 answers 已经是具体维度字母
    this.data.answers.forEach((answer) => {
      if (answer && scores.hasOwnProperty(answer)) {
        scores[answer]++;
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
