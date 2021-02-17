//dynamicScriptByOS();   in utils.js 判斷平台後載入js
var app = {
    initialize: function () {
        this.bindEvents();
    },
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function () {
        app.loadDB();
        app.bindHTMLEvents();

    },
    loadDB: function () {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, onFileSystemFail);
    },
    bindHTMLEvents: function () {
        if (window.localStorage["NAME"] != "") {
            $("#uid").val(window.localStorage["NAME"]);
            $("#upwd").val(window.localStorage["PWD"]);
            $("#remember").attr("checked", "checked");
        }
        $("#login-button").off().on("click", function () {
            if ($("#uid").val() == "") {
                alert("請填寫帳號");
                return;
            }
            if ($("#upwd").val() == "") {
                alert("請填寫密碼");
                return
            }

            chkAccount();
        });
    }

};

function onFileSystemSuccess(fileSystem) {
    console.log(fileSystem.name);
    console.log(fileSystem.root.name);
    localFileSystem = fileSystem;
    console.log("onFileSystemSuccess");
    switch (window.localStorage["platform"]) {
        case "iOS":
            separator = "/";
            CreateRootDir(dbDir, fileSystem); 
            break;
        case "Android":
            separator = "/";
            CreateRootDir(dbDir, fileSystem);
            break;
        case "Windows":
            separator = "\\";
            CreateRootDir(dbDir, fileSystem);
            break;
        default:
            break;
    }
}

function onFileSystemFail(error) {
    console.log(error.code);
}

function CreateRootDir(dir, fileSystem) {
    fileSystem.root.getDirectory(dir, {
        create: true,
        exclusive: false
    }, onRootDirectorySuccess, onRootDirectoryFail);
}

function onRootDirectorySuccess(fileSystem) {
    console.log("Path: " + fileSystem.fullPath);
    if (window.localStorage["platform"] == "iOS") window.localStorage["rootDir"] = fileSystem.nativeURL;
    else window.localStorage["rootDir"] = cordova.file.externalRootDirectory + separator + dbDir;
    chk_download();
}

function onRootDirectoryFail(error) {
    console.log("Unable to create new directory: " + error.code);
    window.localStorage["rootDir"] = "";
}

function chk_download() {
    $(".wrapper").loading({
        overlay: $("#custom-overlay")
    });
    chkFileExists(window.localStorage["rootDir"], "db.sqlite");
}

function chkFileExists(path, fileName) {
    var fileSource = "";
    if (window.localStorage["platform"] == "iOS") {
        //fileSource = "file://";
    }
    if (window.localStorage["platform"] == "Windows") {
        separator = "\\";
    }
    fileSource += path + separator + fileName;
    console.log(fileSource);
    window.resolveLocalFileSystemURL(fileSource, function (entry) {
        function success(file) {
            if (file.name == "db.sqlite") {
                if (file.lastModifiedDate >= dbModifiedTime) {
                    updateDB();
                } else {
                    function success2(entry2) {
                        console.log("Removal succeeded: " + entry.name);
                        chkFileExists(path, entry.name);
                    }

                    function fail2(error2) {
                        console.log('Error removing file: ' + error2.code);
                        chkFileExists(path, entry.name);
                    }
                    // remove the file
                    entry.remove(success2, fail2);
                }
            }
        }

        function fail(error) {
            alert("Unable to retrieve file properties: " + error.code);
        }
        entry.file(success, fail);
    }, function () {
        var callback = null;
        if (fileName == "db.sqlite") {
            callback = function () {
                updateDB();
            }
        }
        fileDL(fileName, callback);
    });

    function fail(evt) {
        console.log(evt.target.error.code);
    }
}

function fileDL(sqlite, callback) {
    var fileTransfer = new FileTransfer();
    fileTransfer.download(
        remoteDBURI + sqlite,
        window.localStorage["rootDir"] + separator + sqlite,
        function (theFile) {
            if (callback != null)
                callback();
            console.log("download complete: " + theFile.toURI());
        },
        function (error) {
            console.log("download error source " + error.source);
            console.log("download error target " + error.target);
            console.log("upload error code: " + error.code);
        }
    );
}

function updateDB() {
    //doAjax("getAccount", {}, getAccount); // 20210202 暫時不做 
}

function getAccount(msg) {
    db_check();
    db.transaction(
        function (tx) {
            var data = msg["getAccount"];

            sqlcmd = "delete from Account";
            tx.executeSql(sqlcmd);
            for (var i = 0; i < data.length; i++) {
                sqlcmd = "insert into Account(USER_ID, LOGIN_ACCOUNT, LOGIN_PSD) values('" + data[i]["USER_ID"] + "','" + data[i]["LOGIN_ACCOUNT"] + "','" + data[i]["LOGIN_PSD"] + "')";
                tx.executeSql(sqlcmd);
            }
            if (localStorage.getItem("updateTime") != undefined && localStorage.getItem("updateTime") != "") {
                $(".wrapper").loading('stop');
                if (localStorage.getItem("NAME") != undefined && localStorage.getItem("PWD") != undefined && localStorage.getItem("NAME") != "" && localStorage.getItem("PWD") != "") {
                    chkAccount();
                }
            } else {
                callBK = function () {
                    $(".wrapper").loading('stop');
                    localStorage.setItem("updateTime", new Date().getTime());
                    if (localStorage.getItem("NAME") != undefined && localStorage.getItem("PWD") != undefined && localStorage.getItem("NAME") != "" && localStorage.getItem("PWD") != "") {
                        chkAccount();
                    }
                };
                updateENG_PCC_BASIC();
            }
        },
        function (e) {
            console.log("ERROR: " + e.message);
        },
        function (e) {
            console.log("USERS Updated ");

        }
    );
}


function chkAccount() {
    // db_check();
    var sqlcmd = "select * from Account where LOGIN_ACCOUNT='0x" + hex_md5($("#uid").val().trim()) + "' and LOGIN_PSD='0x" + hex_md5($("#upwd").val().trim()) + "'";
    db.transaction(
        function (tx) {
            tx.executeSql(sqlcmd, [], function (tx2, res) {
                if (res.rows.length > 0) {
                    console.log("Aid:" + res.rows.item(0).Aid);
                    console.log("USER_ID:" + res.rows.item(0).USER_ID);
                    console.log("LOGIN_ACCOUNT:" + res.rows.item(0).LOGIN_ACCOUNT);
                    console.log("LOGIN_PSD:" + res.rows.item(0).LOGIN_PSD);

                    if ($("#remember").is(":checked")) {
                        localStorage.setItem("NAME", $("#uid").val().trim());
                        localStorage.setItem("PWD", $("#upwd").val().trim());
                    } else {
                        localStorage.setItem("NAME", "");
                        localStorage.setItem("PWD", "");
                    }

                    location.href = 'list.html';
                } else {
                    alert("您的帳號或密碼錯誤，請重新輸入。");
                }
            },
                function (e) {
                    console.log("ERROR: " + e.message);
                });
        }
    );
}
console.log('init on load......');
app.initialize();
$(function () {
    app.bindHTMLEvents();
    db_check(); // path in 
})