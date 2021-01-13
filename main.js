const vm = new Vue({
    el: "#app",
    data: {
        preset: "",
        param: {
            handNum: 8,
            deckNum: 60,
            targets: [4],
            targetLabels: [""],
            searches: [],
            searchLabels: []
        },
        result: {
            hands: [],
            successRate: "-"
        }
    },
    watch: {
        param: {
            handler: function () {
                vm.result.hands = [];
                vm.result.successRate = "-";
            },
            deep: true
        }
    },
    filters: {
        formatProb: function (prob) {
            const match = (prob + "").match(/^[^1-9]*\.00+[^0]/);
            if (match) return match[0];

            const parts = (prob + "").split(".");
            return parts[0] + "." + (parts[1] || "").substring(0, 2);
        }
    },
    methods: {
        delTarget: function (ix) {
            vm.param.targets.splice(ix, 1);
            vm.param.targetLabels.splice(ix, 1);
        },
        addTarget: function () {
            vm.param.targets.push(4);
            vm.param.targetLabels.push("");
        },
        delSearch: function (ix) {
            vm.param.searches.splice(ix, 1);
            vm.param.searchLabels.splice(ix, 1);
        },
        add100Search: function () {
            vm.param.searches.push({ type: 'prob', prob: 100, target: 0, num: 4 });
            vm.param.searchLabels.push("");
        },
        addProbSearch: function () {
            vm.param.searches.push({ type: 'prob', prob: 50, target: 0, num: 4 });
            vm.param.searchLabels.push("");
        },
        addCountSearch: function () {
            vm.param.searches.push({ type: 'count', count: 7, target: 0, num: 4 });
            vm.param.searchLabels.push("");
        },
        compute: function () {
            try {
                vm.result = solve({
                    deckNum: vm.param.deckNum,
                    handNum: vm.param.handNum,
                    targets: vm.param.targets,
                    searches: vm.param.searches,
                });
            } catch {
                vm.result = { hands: [], successRate: "N/A" };
            }
        },
        changePreset: function () {
            if (vm.preset == 'tane8') {
                vm.param.deckNum = 60;
                vm.param.handNum = 7;
                vm.param.targets = [8, 1];
                vm.param.targetLabels = ["種", "デデンネ"];
                vm.param.searches = [];
                vm.param.searchLabels = [];
            } else if (vm.preset == 'support8') {
                vm.param.deckNum = 60;
                vm.param.handNum = 8;
                vm.param.targets = [8];
                vm.param.targetLabels = ["サポート"];
                vm.param.searches = [{ type: 'count', count: 7, target: 0, num: 2 }];
                vm.param.searchLabels = ["ポケギア"];
            } else if (vm.preset == 'exo') {
                vm.param.deckNum = 40;
                vm.param.handNum = 5;
                vm.param.targets = [1, 1, 1, 1, 1];
                vm.param.targetLabels = ["左腕", "右腕", "左脚", "右脚", "本体"];
                vm.param.searches = [];
                vm.param.searchLabels = [];
            } else if (vm.preset == 'land') {
                vm.param.deckNum = 60;
                vm.param.handNum = 7;
                vm.param.targets = [20];
                vm.param.targetLabels = ["土地"];
                vm.param.searches = [];
                vm.param.searchLabels = [];
            } else if (vm.preset == 'evo') {
                vm.param.deckNum = 60;
                vm.param.handNum = 8;
                vm.param.targets = [3];
                vm.param.targetLabels = ["進化前"];
                vm.param.searches = [
                    { type: 'prob', prob: 100, target: 0, num: 4 },
                    { type: 'prob', prob: 100, target: 0, num: 4 },
                ];
                vm.param.searchLabels = ["クイック", "通信"];
            } else {
                vm.param.deckNum = 60;
                vm.param.handNum = 8;
                vm.param.targets = [4];
                vm.param.targetLabels = [""];
                vm.param.searches = [];
                vm.param.searchLabels = [];
            }
        }
    }
});
