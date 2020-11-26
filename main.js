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
            try {
                var successRate = solve({
                    deckNum: vm.deckNum,
                    handNum: vm.handNum,
                    targets: vm.targets,
                    searches: vm.searches,
                });
                vm.result = successRate * 100;
            } catch {
                vm.result = "N/A";
            }
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
