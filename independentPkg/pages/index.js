/* eslint-disable no-debugger */

Page({
  data: {
    dataSize: 10,
    maxValue: 1000,
    selectedSort: 'quick',
    testData: null,
    sortResult: null,
    sortResults: null
  },

  onLoad() {
    console.log('独立分包页面加载成功');
    debugger;

    try {
      // 这里故意尝试访问主包资源，应该会失败
      require("/config.js");
      console.log('错误：不应该能够访问主包资源 ----');
    } catch (error) {
      console.log('✅ 正确：无法访问主包资源 -', error.message);
    }
  },

  selectSort(e) {
    const sort = e?.currentTarget?.dataset?.sort;
    if (!sort) return;
    this.setData({ selectedSort: sort });
    this.runSingleSort(sort);
  },

  onDataSizeChange(e) { this.setData({ dataSize: e.detail.value }); },
  onMaxValueChange(e) { this.setData({ maxValue: e.detail.value }); },

  generateTestData() {
    const { dataSize, maxValue } = this.data;
    const arr = genRandomArray(dataSize, 100, maxValue); // 最小值改为 100
    const stats = calcStatsLite(arr);
    this.setData({ testData: { stats, preview: arr.join(', '), raw: arr }, sortResult: null, sortResults: null });
  },

  runSingleSort(algo) {
    debugger;
    const { testData } = this.data;
    if (!testData?.raw) return wx.showToast?.({ title: '请先生成数据', icon: 'none' });
    const raw = [...testData.raw];
    const start = Date.now();
    let sorted;
    if (algo === 'quick') sorted = simpleQuickSort(raw);
    else if (algo === 'merge') sorted = simpleMergeSort(raw);
    else if (algo === 'heap') sorted = simpleHeapSort(raw);
    else sorted = raw;
    const time = Date.now() - start;
    this.setData({
      sortResult: {
        algorithm: algo,
        executionTime: time,
        dataSize: raw.length,
        isCorrect: isSortedLite(sorted),
        preview: sorted.join(', ')
      },
      sortResults: null
    });
  },

  executeAllSorting() {
    const { testData } = this.data;
    if (!testData?.raw) return wx.showToast?.({ title: '请先生成数据', icon: 'none' });
    const algorithms = [
      { key: 'quick', fn: simpleQuickSort },
      { key: 'merge', fn: simpleMergeSort },
      { key: 'heap', fn: simpleHeapSort }
    ];
    const results = [];
    const base = testData.raw;
    for (const { key, fn } of algorithms) {
      const dataCopy = [...base];
      const t0 = Date.now();
      const out = fn(dataCopy);
      const cost = Date.now() - t0;
      results.push({
        algorithm: key,
        executionTime: cost,
        isCorrect: isSortedLite(out),
        preview: out.join(', ')
      });
    }
    this.setData({ sortResults: results, sortResult: null });
  },

  goToMain() { wx.navigateTo?.({ url: '/pages/index/index' }); }
});

// ---------------- 简单排序算法实现（与 tools.js 中函数名完全不同） ----------------

function simpleQuickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length >> 1];
  const left = [];
  const mid = [];
  const right = [];
  for (let v of arr) {
    if (v < pivot) left.push(v);
    else if (v > pivot) right.push(v);
    else mid.push(v);
  }
  return [...simpleQuickSort(left), ...mid, ...simpleQuickSort(right)];
}

function simpleMergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = arr.length >> 1;
  const left = simpleMergeSort(arr.slice(0, mid));
  const right = simpleMergeSort(arr.slice(mid));
  return mergeTwo(left, right);
}

function mergeTwo(a, b) {
  const res = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) res.push(a[i++]);
    else res.push(b[j++]);
  }
  while (i < a.length) res.push(a[i++]);
  while (j < b.length) res.push(b[j++]);
  return res;
}

function simpleHeapSort(arr) {
  const n = arr.length;
  if (n <= 1) return arr;
  // 建最大堆
  for (let i = (n >> 1) - 1; i >= 0; i--) heapify(arr, n, i);
  // 依次取出堆顶
  for (let end = n - 1; end > 0; end--) {
    swap(arr, 0, end);
    heapify(arr, end, 0);
  }
  return arr;
}

function heapify(arr, size, i) {
  while (true) {
    let largest = i;
    const l = (i << 1) + 1;
    const r = (i << 1) + 2;
    if (l < size && arr[l] > arr[largest]) largest = l;
    if (r < size && arr[r] > arr[largest]) largest = r;
    if (largest === i) return;
    swap(arr, i, largest);
    i = largest;
  }
}

function swap(arr, i, j) {
  const t = arr[i];
  arr[i] = arr[j];
  arr[j] = t;
}

function genRandomArray(len, min, max) {
  const res = [];
  for (let i = 0; i < len; i++) res.push(Math.floor(Math.random() * (max - min + 1)) + min);
  return res;
}


function calcStatsLite(arr) {
  if (!arr.length) return { length: 0, average: 0, min: 0, max: 0 };
  let min = arr[0], max = arr[0], sum = 0;
  for (let v of arr) { if (v < min) min = v; if (v > max) max = v; sum += v; }
  return { length: arr.length, average: +(sum / arr.length).toFixed(2), min, max };
}

function isSortedLite(arr) {
  for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) return false;
  return true;
}
