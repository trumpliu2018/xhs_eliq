let performance;

Page({
  data: {
    entriesText: '',
    entriesByName: '',
    nameValue: ''
  },

  onLoad() {
    performance = xhs.getPerformance();
    const observer = performance.createObserver((entryList) => {
      console.log('entryList', entryList.getEntries());
      this.setData('entriesText', JSON.stringify(entryList.getEntries()));
      console.log('allentryList', performance.getEntries());
    });
    observer.observe({ type: 'paint' });
    console.log('observer', observer);
    this.observer = observer;
  },

  onReady() {
    console.log('onReady', Date.now());
  },

  onHide() {
    this.observer.disconnect();
  },

  onUnload() {
    console.log('disconnect');
    this.observer.disconnect();
  },


  getEntries() {
    const entries = performance?.getEntries();
    console.log('entries',  entries);
    this.setData('entriesText', JSON.stringify(entries));
  },

  getEntriesByName() {
    const entries = performance?.getEntriesByName(this.data.nameValue);
    this.setData('entriesByName', JSON.stringify(entries));
  },

  onNameInput(e) {
    this.setData('nameValue', e.detail.value);
  }
});