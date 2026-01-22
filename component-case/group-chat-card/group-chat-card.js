const arr = ['card', 'cell'];

Page({
  data: {
    groupChatList: "Ev+FMMlMReM/fvLBkHwJyvVowUAzEgFlK7HoFR/NoQQ=,q2UWig7ActbQ5Ew96a+Zf3x3UxjdISWczC+tHJYm66U=,sy3YiB1GGlXLTP9KLCLwFtmxWtY3Hno1yfVzYksmLiQ=,bO8PmXJQ/g9ivaRKLJ37m4Rdb9Lh1nRCwtwaQD2VgQ8=,lt62Epn4+F59BGPXHxcoa8DkkT04zvrA9peKXWL+Njg=",
    groupChatStr: "Ev+FMMlMReM/fvLBkHwJyvVowUAzEgFlK7HoFR/NoQQ=,q2UWig7ActbQ5Ew96a+Zf3x3UxjdISWczC+tHJYm66U=,sy3YiB1GGlXLTP9KLCLwFtmxWtY3Hno1yfVzYksmLiQ=,bO8PmXJQ/g9ivaRKLJ37m4Rdb9Lh1nRCwtwaQD2VgQ8=,lt62Epn4+F59BGPXHxcoa8DkkT04zvrA9peKXWL+Njg=",
    type: "card",
    typeIndex: 0,
    arr: arr,
  },
  bindInputGroupChatList: function (e) {
    this.setData({
      groupChatList: e.detail.value,
    });
  },
  bindPickerChange(e) {
    this.setData({
      typeIndex: e.detail.value,
      type: arr[e.detail.value],
    });
  },
  bindBlur() {
    this.setData({
      groupChatStr: this.data.groupChatList
    });
  },
  handleBindJoinGroup(e) {
    console.log('handleBindJoinGroup', e);
  },
  handleBindError(e) {
    console.log('handleBindError', e);
  }
});
