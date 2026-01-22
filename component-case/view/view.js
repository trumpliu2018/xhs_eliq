const __templateJs = require("./templates.js");
const __mergePageOptions = require("../../util/mergePageOptions.js");
Page(__mergePageOptions({
  onShareAppMessage() {
    return {
      title: 'view',
      path: '/component-case/view/view'
    };
  },
  onLoad() {
    setTimeout(() => {
      this.removeSkeleton?.();
    }, 1000);
  },
  data: {}
}, __templateJs));