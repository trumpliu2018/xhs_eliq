var e = {
  abbr: !0,
  b: !0,
  big: !0,
  code: !0,
  del: !0,
  em: !0,
  i: !0,
  ins: !0,
  label: !0,
  q: !0,
  small: !0,
  span: !0,
  strong: !0,
  sub: !0,
  sup: !0,
};
module.exports = function (n, i) {
  return e[n] || -1 !== (i || "").indexOf("inline");
};
