document.getElementById("authenticate").addEventListener("click", function () {
    var targetId;
    chrome.tabs.create({url: 'redirect.html', selected: true}, function (tab) {
        targetId = tab.id;
    });
});