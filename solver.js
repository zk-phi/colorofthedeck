var deckNum;
var handNum;
var targets;
var searches;

/*
 * [引数]
 * deckNum  ... Int      デッキ枚数
 * handNum  ... Int      ハンド枚数
 * targets  ... Int[]    欲しいカードの枚数の配列
 * searches ... Search[] サーチカードの配列、それぞれの要素は以下のどちらか：
 * - 確率固定サーチ { type: 'prob', successRate: 成功率%, num: 枚数, target: サーチ対象 }
 * - 枚数固定サーチ { type: 'count', count: 見れる枚数, num: 枚数, target: サーチ対象 }
 * - (確定サーチは確率 1.0 の確率固定サーチ)
 *
 * [例]
 * // デッキ枚数６０枚から８枚を引いて、各４枚投入された欲しいカード A, B を揃えたい
 * // 50% の確率で成功する A のサーチと、 25% の B のサーチが各４枚入っている
 * solve({
 *   deckNum: 60,
 *   handNum: 8,
 *   targets: [4, 4],
 *   searches: [
 *     { type: 'prob', successRate: 50, num: 4, target: 0 },
 *     { type: 'prob', successRate: 25, num: 4, target: 1 }
 *   ]
 * })
 *
 * [戻り値]
 * - すべての欲しいカードに最低１枚は触れる確率
 */

function solve (params) {
    deckNum = params.deckNum;
    handNum = params.handNum;
    targets = params.targets;
    /* 失敗率に変換しておく */
    searches = params.searches.map(function (s) {
        if (s.type == 'prob') {
            return { failRate: 1.0 - (s.prob / 100.0), num: s.num, target: s.target };
        } else {
            /* 枚数固定サーチの失敗率も計算しておく */
            var a = ncr(params.deckNum - params.handNum - params.targets[s.target], s.count);
            var b = ncr(params.deckNum - params.handNum, s.count);
            return { failRate: a / b, num: s.num, target: s.target };
        }
    });
    return solveR({
        /* 今の手札 */
        targets: params.targets.map(function () { return 0 }),
        searches: params.searches.map(function () { return 0 }),
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
        searchesIx: 0
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
                searches: state.searches,
                other: state.other,
                prob: caseProb
            }],
            successRate: caseProb * successRate  /* この手札になる確率 x サーチの成功率 */
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
                searches: state.searches,
                other: state.other,
                cases: state.cases * ncr(targetNum, i),
                failRate: state.failRate.map(function (v, ix) {
                    return v * (ix == state.targetsIx ? Math.pow(0, i) : 1)
                }),
                handNum: state.handNum - i,
                deckNum: state.deckNum - targetNum,
                targetsIx: state.targetsIx + 1,
                searchesIx: state.searchesIx
            });
            hands = hands.concat(res.hands);
            successRate += res.successRate;
        }
        return { hands: hands, successRate: successRate };
    } else if (state.searchesIx < searches.length) {
        /* サーチを各何枚引くかの場合分け */
        var hands = [];
        var successRate = 0;
        var search = searches[state.searchesIx];
        for (var i = 0; i <= Math.min(search.num, state.handNum); i++) {
            /* searchesIx 番目のサーチを i 枚素引きする場合 */
            var res = solveR({
                targets: state.targets,
                searches: state.searches.map(function (v, ix) {
                    return v + (ix == state.searchesIx ? i : 0)
                }),
                other: state.other,
                cases: state.cases * ncr(search.num, i),
                failRate: state.failRate.map(function (v, ix) {
                    return v * (ix == search.target ? Math.pow(search.failRate, i) : 1)
                }),
                handNum: state.handNum - i,
                deckNum: state.deckNum - search.num,
                targetsIx: state.targetsIx,
                searchesIx: state.searchesIx + 1
            });
            hands = hands.concat(res.hands);
            successRate += res.successRate;
        }
        return { hands: hands, successRate: successRate };
    } else {
        /* 「欲しいカード」とサーチを引く枚数が確定 → 残りは適当なカード */
        return solveR({
            targets: state.targets,
            searches: state.searches,
            other: state.other + state.handNum,
            cases: state.cases * ncr(state.deckNum, state.handNum),
            failRate: state.failRate,
            handNum: 0,
            deckNum: state.deckNum - state.handNum,
            targetsIx: state.targetsIx,
            searchesIx: state.searchesIx
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
