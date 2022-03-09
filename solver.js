var deckNum;
var handNum;
var targets;

/*
 * [引数]
 * deckNum  ... Int   デッキ枚数
 * handNum  ... Int   ハンド枚数
 * targets  ... Int[] 欲しいカードの枚数の配列
 *
 * [例]
 * // デッキ枚数６０枚から８枚を引いて、各４枚投入された欲しいカード A, B を揃えたい
 * solve({
 *   deckNum: 60,
 *   handNum: 8,
 *   targets: [4, 4],
 * })
 *
 * [戻り値]
 * successRate ... Number 欲しいカードが各１枚以上揃う確率 (%)
 * hands       ... Hand[] 各手札になる確率
 * - targets  ... Int[]  それぞれの「欲しいカード」の枚数
 * - other    ... Int     「欲しいカード」でもサーチでもないカードの枚数
 * - prob     ... Numbre その手札が発生する確率 (%)
 */

function solve (params) {
  deckNum = params.deckNum;
  handNum = params.handNum;
  targets = params.targets;
  return solveR({
    /* 今の手札 */
    targets: params.targets.map(function () { return 0 }),
    other: 0,
    /* ここまでの場合の数 */
    cases: 1,
    /* 現時点の手札で各 target に「触れない」確率 */
    failRate: params.targets.map(function () { return 1.0 }),
    /* 今後引けるハンド枚数 */
    handNum: params.handNum,
    /* 今後引けるデッキ枚数 (引かないと決めたカードは除く) */
    deckNum: params.deckNum,
    /* どこまで見たか */
    targetsIx: 0,
  });
}

function solveR (state) {
  if (state.handNum == 0) {
    /* 手札を引き終わった → 確率計算して返す */
    var caseProb = state.cases / ncr(deckNum, handNum);
    var successRate = state.failRate.reduce(function (l, r) { return l * (1.0 - r); }, 1);
    return {
      hands: [{
        targets: state.targets,
        other: state.other,
        prob: caseProb * 100
      }],
      successRate: caseProb * successRate * 100  /* この手札になる確率 x サーチの成功率 */
    };
  } else if (state.targetsIx < targets.length) {
    /* 「欲しいカード」を各何枚素引きするかの場合分け */
    var hands = [];
    var successRate = 0;
    var targetNum = targets[state.targetsIx];
    for (var i = 0; i <= Math.min(targetNum, state.handNum); i++) {
      /* targetsIx 番目の「欲しいカード」を i 枚素引きする場合 */
      var res = solveR({
        targets: state.targets.map(function (v, ix) {
          return v + (ix == state.targetsIx ? i : 0)
        }),
        other: state.other,
        cases: state.cases * ncr(targetNum, i),
        failRate: state.failRate.map(function (v, ix) {
          return v * (ix == state.targetsIx ? Math.pow(0, i) : 1)
        }),
        handNum: state.handNum - i,
        deckNum: state.deckNum - targetNum,
        targetsIx: state.targetsIx + 1,
      });
      hands = hands.concat(res.hands);
      successRate += res.successRate;
    }
    return { hands: hands, successRate: successRate };
  } else {
    /* 「欲しいカード」とサーチを引く枚数が確定 → 残りは適当なカード */
    return solveR({
      targets: state.targets,
      other: state.other + state.handNum,
      cases: state.cases * ncr(state.deckNum, state.handNum),
      failRate: state.failRate,
      handNum: 0,
      deckNum: state.deckNum - state.handNum,
      targetsIx: state.targetsIx,
    });
  }
}

/* 階乗 */
var facts = [1];
function fact (n) {
  if (!facts[n]) {
    facts[n] = fact(n - 1) * n;
  }
  return facts[n];
}

/* n 個から r 個選ぶ組み合わせ */
function ncr (n, r) {
  return fact(n) / fact(n - r) / fact(r);
}
