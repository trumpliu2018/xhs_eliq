const __templateJs = require("./templates.js");
const __mergePageOptions = require("../../util/mergePageOptions.js");
Page(__mergePageOptions({
  onShareAppMessage() {
    return {
      title: 'input',
      path: 'page/component/pages/input/input'
    };
  },
  data: {
    // 非受控
    inputNotBindValue: '',
    // 非受控有长度
    inputNotBindValueMaxLength: '',
    // 受控
    inputBindValue: '',
    // 受控只能输入英文
    wordValue: '',
    // 受控有长度
    inputMaxLengthValue: '',
    // 不限制长度
    inputMaxLengthInfinity: '',
    // 密码输入
    inputPassword: '',
    // 数字输入
    inputNumber: '',
    // 不可输入
    disabledValue: 'disabled',
    inputValue: '',
    inputChangeValue: '',
    // 非受控 textarea
    textareaNotBindValue: '',
    // 受控 textarea
    textareaBindValue: '',
    // 受控只能输入英文
    textareaWordValue: '',
    // 受控最大长度
    textareaMaxLengthValue: '',
    // 非受控最大
    textareaNoBindMaxLengthValue: '',
    // 无限长度的 textarea
    textareaInfinityLengthValue: '',
    // 不可输入的 textarea
    textareaDisabled: `I'm disabled
I'm disabled
I'm disabled
    `,
    password: false,
    focus: false,
    value: '',
    type: 'text',
    placeholder: '',
    placeholderClass: 'input-placeholder',
    disabled: false,
    maxlength: 140,
    autoFocus: false,
    cursor: -1,
    selectionStart: -1,
    selectionEnd: -1,
    focusTime: 0,
    blurTime: 0
  },
  // 非受控
  bindNotBindInput(e) {
    this.setData({
      inputNotBindValue: e.detail.value
    });
  },
  // 非受控有长度
  bindInputNotBindValueMaxLength(e) {
    this.setData({
      inputNotBindValueMaxLength: e.detail.value
    });
  },
  // 受控
  bindBindInput(e) {
    this.setData({
      inputBindValue: e.detail.value
    });
  },
  // 受控只能输入英文
  bindWordInput(e) {
    const value = e.detail.value;
    console.log("%c Line:46 🍐 value", "color:#93c0a4", value);
    // 过滤非英文字母
    const valueFilter = value.replace(/[^A-Za-z]/ig, '');
    console.log("%c Line:49 🥕 valueFilter", "color:#42b983", valueFilter);
    this.setData({
      wordValue: valueFilter
    });
  },
  // 受控 textarea 只能输入英文
  bindTextareaWordInput(e) {
    const value = e.detail.value;
    console.log("%c Line:46 🍐 value", "color:#93c0a4", value);
    // 过滤非英文字母
    const valueFilter = value.replace(/[^A-Za-z]/ig, '');
    console.log("%c Line:49 🥕 valueFilter", "color:#42b983", valueFilter);
    this.setData({
      textareaWordValue: valueFilter
    });
  },
  // 受控有长度
  bindMaxLengthInput(e) {
    this.setData({
      inputMaxLengthValue: e.detail.value
    });
  },
  // 受控不限制长度
  bindInputMaxLengthInfinity(e) {
    this.setData({
      inputMaxLengthInfinity: e.detail.value
    });
  },
  // 受控密码输入
  bindPasswordInput(e) {
    this.setData({
      inputPassword: e.detail.value
    });
  },
  // 输入数字
  bindNumberInput(e) {
    this.setData({
      inputNumber: e.detail.value
    });
  },
  // 不可输入
  bindDisabledInput(e) {
    this.setData({
      disabledValue: e.detail.value
    });
  },
  // 非受控 textarea
  bindTextareaNoBindInput(e) {
    this.setData({
      textareaNotBindValue: e.detail.value
    });
  },
  // 受控 textarea
  bindTextareaBindValue(e) {
    console.log("%c Line:63 🌰 e", "color:#6ec1c2", e);
    this.setData({
      textareaBindValue: e.detail.value
    });
  },
  // 最大长度
  bindTextareaMaxLengthInput(e) {
    this.setData({
      textareaMaxLengthValue: e.detail.value
    });
  },
  bindTextareaNoBindMaxLengthValue(e) {
    this.setData({
      textareaNoBindMaxLengthValue: e.detail.value
    });
  },
  // 长度不受限的 textarea
  bindTextareaInfinityLengthValue(e) {
    this.setData({
      textareaInfinityLengthValue: e.detail.value
    });
  },
  // 不可输入的 textarea
  bindTextareaDisabledInput(e) {
    this.setData({
      textareaDisabled: e.detail.value
    });
  },
  bindKeyInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },
  bindReplaceInput(e) {
    xhs.showToast({
      title: e.detail.value,
      icon: 'success',
      duration: 2000
    });
    this.setData({
      value: e.detail.value
    });
    // const value = e.detail.value
    // let pos = e.detail.cursor
    // let left
    // if (pos !== -1) {
    //   // 光标在中间
    //   left = e.detail.value.slice(0, pos)
    //   // 计算光标的位置
    //   pos = left.replace(/11/g, '2').length
    // }

    // // 直接返回对象，可以对输入进行过滤处理，同时可以控制光标的位置
    // return {
    //   value: value.replace(/11/g, '2'),
    //   cursor: pos,
    // }

    // 或者直接返回字符串,光标在最后边
    // return value.replace(/11/g,'2'),
  },

  bindHideKeyboard(e) {
    if (e.detail.value === '123') {
      // 收起键盘
      xhs.hideKeyboard();
    }
  },
  changeValue({
    detail
  }) {
    this.setData({
      value: detail.value
    });
  },
  changePlaceholder({
    detail
  }) {
    this.setData({
      placeholder: detail.value
    });
  },
  changePlaceholderStyle({
    detail
  }) {
    this.setData({
      placeholderStyle: detail.value
    });
  },
  changePlaceholderClass({
    detail
  }) {
    this.setData({
      placeholderClass: detail.value
    });
  },
  changeDisabled() {
    this.setData({
      disabled: !this.data.disabled
    });
  },
  changePassword() {
    this.setData({
      password: !this.data.password
    });
  },
  changeMaxlength({
    detail
  }) {
    this.setData({
      maxlength: detail.value
    });
  },
  changeFocus() {
    this.setData({
      focus: !this.data.focus
    });
  },
  changeCursor({
    detail
  }) {
    this.setData({
      cursor: detail.value
    });
  },
  changeType({
    detail
  }) {
    this.setData({
      type: detail.value
    });
  },
  changeSelectionStart({
    detail
  }) {
    this.setData({
      selectionStart: detail.value
    });
  },
  changeSelectionEnd({
    detail
  }) {
    this.setData({
      selectionEnd: detail.value
    });
  },
  bindTextFocus({
    timeStamp
  }) {
    this.setData({
      focusTime: new Date(timeStamp).toLocaleString()
    });
  },
  bindTextBlur({
    timeStamp
  }) {
    this.setData({
      blurTime: new Date(timeStamp).toLocaleString()
    });
  },
  bindTextInput(e) {
    console.log(`bindTextInput: ${JSON.stringify(e)}`);
    this.setData({
      inputChangeValue: e.detail.value
    });
  },
  onChange(e) {
    console.log('onChange', e);
  },
  bindconfirm(e) {
    console.log('bindconfirm', e);
  }
}, __templateJs));
