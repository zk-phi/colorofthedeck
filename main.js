var facts = [1];
function fact (n) {
    if (!facts[n]) {
        facts[n] = fact(n - 1) * n;
    }
    return facts[n];
}

function ncr (n, r) {
    return fact(n) / fact(n - r) / fact(r);
}

var deckNum;
var handNum;
var targets;
var searches;

function solve () {
    deckNum = vm.deckNum;
    handNum = vm.handNum;
    targets = vm.targets;
    searches = vm.searches.map(function (s) {
        if (s.type == 'prob') {
            return { negProb: 1.0 - (s.prob / 100.0), num: s.num, target: s.target };
        } else {
            var a = ncr(vm.deckNum - vm.handNum - vm.targets[s.target], s.count);
            var b = ncr(vm.deckNum - vm.handNum, s.count);
            return { negProb: a / b, num: s.num, target: s.target };
        }
    });
    return solveR({
        /* ここまでの場合の数 */
        cases: 1,
        /* 各 target に「触れない」確率 */
        negProb: vm.targets.map(function () { return 1.0 }),
        /* これから引くハンド枚数 */
        handNum: vm.handNum,
        /* 残りのデッキ枚数 (引かないと決めたカードを除く) */
        deckNum: vm.deckNum,
        /* どこまで見たか */
        targetsIx: 0,
        searchesIx: 0
    });
}

function solveR (state) {
    if (state.handNum == 0) {
        var caseProb = state.cases / ncr(deckNum, handNum);
        return caseProb * state.negProb.reduce(function (l, r) { return l * (1.0 - r); }, 1);
    } else if (state.targetsIx < targets.length) {
        var prob = 0;
        var targetNum = targets[state.targetsIx];
        for (var i = 0; i <= Math.min(targetNum, state.handNum); i++) {
            /* targetsIx 番目の「欲しいカード」を i 枚素引きする場合 */
            prob += solveR({
                cases: state.cases * ncr(targetNum, i),
                negProb: state.negProb.map(function (v, ix) {
                    return v * (ix == state.targetsIx ? Math.pow(0, i) : 1)
                }),
                handNum: state.handNum - i,
                deckNum: state.deckNum - targetNum,
                targetsIx: state.targetsIx + 1,
                searchesIx: state.searchesIx
            });
        }
        return prob;
    } else if (state.searchesIx < searches.length) {
        var prob = 0;
        var search = searches[state.searchesIx];
        for (var i = 0; i <= Math.min(search.num, state.handNum); i++) {
            /* searchesIx 番目のサーチを i 枚素引きする場合 */
            prob += solveR({
                cases: state.cases * ncr(search.num, i),
                negProb: state.negProb.map(function (v, ix) {
                    return v * (ix == search.target ? Math.pow(search.negProb, i) : 1)
                }),
                handNum: state.handNum - i,
                deckNum: state.deckNum - search.num,
                targetsIx: state.targetsIx,
                searchesIx: state.searchesIx + 1
            });
        }
        return prob;
    } else {
        return solveR({
            cases: state.cases * ncr(state.deckNum, state.handNum),
            negProb: state.negProb,
            handNum: 0,
            deckNum: state.deckNum - state.handNum,
            targetsIx: state.targetsIx,
            searchesIx: state.searchesIx
        });
    }
}

const vm = new Vue({
    el: "#app",
    data: {
        preset: "",
        handNum: 8,
        deckNum: 60,
        targets: [4],
        searches: [],
        result: "-"
    },
    methods: {
        delTarget: function (ix) {
            vm.targets.splice(ix, 1);
        },
        addTarget: function () {
            vm.targets.push(4);
        },
        delSearch: function (ix) {
            vm.searches.splice(ix, 1);
        },
        add100Search: function () {
            vm.searches.push({ type: 'prob', prob: 100, target: 0, num: 4 });
        },
        addProbSearch: function () {
            vm.searches.push({ type: 'prob', prob: 50, target: 0, num: 4 });
        },
        addCountSearch: function () {
            vm.searches.push({ type: 'count', count: 7, target: 0, num: 4 });
        },
        compute: function () {
            vm.result = "(計算中)";
            vm.result = solve() * 100;
        },
        changePreset: function () {
            if (vm.preset == 'tane8') {
                vm.deckNum = 60;
                vm.handNum = 7;
                vm.targets = [8];
                vm.searches = [];
                vm.compute();
            } else if (vm.preset == 'support8') {
                vm.deckNum = 60;
                vm.handNum = 8;
                vm.targets = [8];
                vm.searches = [{ type: 'count', count: 7, target: 0, num: 2 }];
                vm.compute();
            } else if (vm.preset == 'exo') {
                vm.deckNum = 40;
                vm.handNum = 5;
                vm.targets = [1, 1, 1, 1, 1];
                vm.searches = [];
                vm.compute();
            } else if (vm.preset == 'land') {
                vm.deckNum = 60;
                vm.handNum = 7;
                vm.targets = [20];
                vm.searches = [];
                vm.compute();
            }
        }
    }
});
