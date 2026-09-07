function extractNumbers(headings) {
  for (var i = 0; i < headings.length; ++i) {
    const h = headings[i];
    if (typeof h.text !== "string") continue;
    const m = h.text.match(/([0-9]+)?\.?([0-9]+)?\.?([0-9]+)?\.?([0-9]+)?\.?([0-9]+)?\.?([0-9]+)?[. ]*(.+)?/);
    if (m == null) continue;
    if (m == undefined) continue;
    if (m.length == 0) continue;
    h.n1 = parseInt0(m[1]);
    h.n2 = parseInt0(m[2]);
    h.n3 = parseInt0(m[3]);
    h.n4 = parseInt0(m[4]);
    h.n5 = parseInt0(m[5]);
    h.n6 = parseInt0(m[6]);
    h.n = h.n1 * 10000000000 + h.n2 * 100000000 + h.n3 * 1000000 + h.n4 * 10000 + h.n5 * 100 + h.n6;
    h.t = m[7];
    h.sNumbering = buildNumbering(h);
    //console.log(h);
  }//for
}//extractNumbers

function parseInt0(s) {
  try {
    const i = parseInt(s);
    if (isNaN(i)) return 0;
    return i;
  } catch (e) {
    return 0;
  }
}//parseInt0

function buildNumbering(h) {
  var l = [];
  if (h.n1 > 0) l.push(h.n1); else return "";
  if (h.n2 > 0) l.push(h.n2); else return l.join(".");
  if (h.n3 > 0) l.push(h.n3); else return l.join(".");
  if (h.n4 > 0) l.push(h.n4); else return l.join(".");
  if (h.n5 > 0) l.push(h.n5); else return l.join(".");
  if (h.n6 > 0) l.push(h.n6); else return l.join(".");
  return l.join(".");
}//buildNumbering
