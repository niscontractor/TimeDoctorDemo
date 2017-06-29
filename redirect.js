var socket = io.connect('http://34.210.113.0:5002');
var token = localStorage.getItem("token");
var refreshToken = localStorage.getItem("refreshToken");

if (token == "null" || !token) {
    authenticate();
} else {
    refresh();
}

window.onload = function (e) {
    var logoutBtn = document.getElementById('logout');
    logoutBtn.onclick = function () {
        localStorage.setItem("token", null);
        window.close();
    };
}

function authenticate() {
    socket.on('connect', function () {
        console.log('Client connected');
    });
    socket.on('loginSuccess', function (data) {
        console.log(data);
        console.log("success");
        token = data.token.token;
        refreshToken = data.token.refreshToken;
        getCompany(token);
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        socket.close();
    });
    var href = "https://webapi.timedoctor.com/oauth/v2/auth?client_id=735_3hhq9n04qlq8ss8gowg0sog8c44kkc0oww8gkog4w44c04kcos&response_type=code&redirect_uri=http://34.210.113.0:5000/callback";
    chrome.tabs.create({url: href, selected: true}, function (tab) {
        targetId = tab.id;
    });
}

function refresh() {
    targetId = "null";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            console.log(data);
            token = data.access_token;
            refreshToken = data.refresh_token;
            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", refreshToken);
            getCompany(token);
        }
    };
    xhttp.open("GET", 'https://webapi.timedoctor.com/oauth/v2/token?client_id=735_3hhq9n04qlq8ss8gowg0sog8c44kkc0oww8gkog4w44c04kcos&client_secret=9wk10fltts008gk8ggo4w0kgowc800gk0ocwsg44ccgc88ggk&grant_type=refresh_token&refresh_token=' + refreshToken);
    xhttp.send();
}
function getCompany(token) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            if (targetId != "null") {
                chrome.tabs.remove(targetId);
            }
            document.getElementById('header').innerHTML = "Welcome " + data.user.full_name;
            getUsers(token, data.accounts[0].company_id);
        }
    };
    xhttp.open("GET", 'https://webapi.timedoctor.com/v1.1/companies?access_token=' + token, true);
    xhttp.send();
}

function getUsers(token, companyId) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            console.log(data);
            var userTable = document.getElementById("users");
            userTable.style.display = 'table';
            var tbody = userTable.getElementsByTagName('tbody')[0];
            for (var i in data.users) {
                var row = tbody.insertRow(i * 2);
                row.className = "odd";
                var cell0 = row.insertCell(0);
                var cell1 = row.insertCell(1);
                var cell2 = row.insertCell(2);
                var cell3 = row.insertCell(3);
                var button = document.createElement('button');
                button.innerHTML = 'Show Task';
                button.className = "button";
                button.onclick = function () {
                    getTask(data.users[i].company_id, this.user_id);
                    return false;
                };
                cell0.appendChild(button);
                cell1.innerHTML = data.users[i].full_name;
                cell2.innerHTML = data.users[i].email;
                cell3.innerHTML = data.users[i].level;
                button.user_id = data.users[i].user_id;
                cell1.onclick = function () {

                };
                index = (i * 2) + 1;
                var row1 = tbody.insertRow(index);
                row1.id = data.users[i].user_id;
                row1.className = "taskRow";
                cell1 = row1.insertCell(0);
                cell1.colSpan = 4;
            }
        }
    };
    xhttp.open("GET", 'https://webapi.timedoctor.com/v1.1/companies/' + companyId + '/users?access_token=' + token, true);
    xhttp.send();
}

function getTask(companyId, userId) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            console.log(data);
            var row = document.getElementById(userId);
            row.style.display = "table-row";
            var cell1 = row.cells[0];
            if (data.count != "0") {
                cell1.innerHTML = "<table class='header' id=task" + userId + "><thead><tr><th>Task Name</th><th>Active</th><th>URL</th></tr></thead><tbody></tbody></table>";
                var taskTable = document.getElementById("task" + userId);
                var tbody = taskTable.getElementsByTagName('tbody')[0];
                for (var i in data.tasks) {
                    console.log(data.tasks[i]);
                    var row = tbody.insertRow(i);
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    cell1.innerHTML = data.tasks[i].task_name;
                    cell2.innerHTML = data.tasks[i].active;
                    cell3.innerHTML = data.tasks[i].url;
                }
            } else {
                cell1.innerHTML = "There is no task";
            }
        }
    };
    xhttp.open("GET", 'https://webapi.timedoctor.com/v1.1/companies/' + companyId + '/users/' + userId + '/tasks?status=all&access_token=' + token, true);
    xhttp.send();
}