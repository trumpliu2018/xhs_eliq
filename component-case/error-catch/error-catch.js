Page({
  data: {

  },
  handlePromise(){
    return new Promise((_, rej) => {
      rej(new Error('promise错误'));
    });
  },
  handleTimer(){
    setTimeout(() => {
      throw new Error('setTimeout错误');
    }, 1000);
  },
  handleStringError(){
    return new Promise((_, rej) => {
      rej('promise string错误');
    });
  },
  handleSyncError() {
    throw new Error('同步错误');
  }
});