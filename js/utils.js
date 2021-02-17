function dynamicScriptByOS() // load before device ready
{
    var userAgent = "";
    if ((navigator.userAgent.match(/(Android|android)/g)))
        userAgent = "Android";
    else if ((navigator.userAgent.match(/(iPad|iPhone|iPod)/g)))
        userAgent = "iOS";
    else if ((navigator.userAgent.match(/(MSApp)/g)))
        userAgent = "Windows";
    console.log('userAgent: ' + userAgent);
    switch (userAgent) {
        case "iOS":
            $("<script/>").attr({
                src: './js/cordova/ioscordova_455.js',
                type: 'text/javascript'
            }).appendTo($('head'));
            $("<script/>").attr({
                src: './js/sqlite/iosSpatialitePlugin.js',
                type: 'text/javascript'
            }).appendTo($('head'));
            break;
        case "Android":
            $("<script/>").attr({
                src: './js/cordova/andcordova_700.js',
                type: 'text/javascript'
            }).appendTo($('head'));
            $("<script/>").attr({
                src: './js/sqlite/andSpatialitePlugin.js',
                type: 'text/javascript'
            }).appendTo($('head'));
            break;
        case "Windows":
            $("<script/>").attr({
                src: './scripts/cordova/wincordova_281.js',
                type: 'text/javascript'
            }).appendTo($('head'));
            $("<script/>").attr({
                src: './scripts/sqlite/winSpatialitePlugin.js',
                type: 'text/javascript'
            }).appendTo($('head'));
            break;
        default:
    }
    window.localStorage["platform"] = userAgent;
}

function doAjax(action, params, callback, errCallback) {
    $.ajax({
        crossDomain: true,
        cache: false,
        headers: {
            "cache-control": "no-cache"
        },
        url: remoteURI + "/service.asmx/" + action,
        data: params,
        contentType: "application/json; charset=utf-8",
        dataType: "jsonp",
        success: function (msg) {
            callback(msg, params);
        },
        error: function (e) {
            if (errCallback)
                errCallback(msg, params);
            else
                alert("無法取得資料");
        }
    });
}

function GetParam(str) {
    ///<summary>取得網址參數</summary>
    var url = window.location.toString();
    var str_value = "";
    if (url.indexOf("?") != -1) {
        var ary = url.split("?")[1].split("&");
        for (var i = 0; i < ary.length; i++) {
            if (str == ary[i].toString().split("=")[0])
                str_value = decodeURI(ary[i].toString().split("=")[1]);
        }
    }
    return str_value;
}

function removeDirty(words) {
    return words.replace(/'/g, "").replace(/\"/g, "");
}

var toast = function (msg) {
    ///<summary>顯示系統訊息</summary>
    $("<div class='ui-loader ui-overlay-shadow ui-body-a ui-corner-all'><h3>" + msg + "</h3></div>")
        .css({
            display: "block",
            opacity: 0.90,
            position: "fixed",
            padding: "7px",
            "text-align": "center",
            width: "270px",
            left: ($(window).width() - 284) / 2,
            top: $(window).height() / 2
        })
        .appendTo($.mobile.pageContainer).delay(1500)
        .fadeOut(400, function () {
            $(this).remove();
        });
}

function formatNumber(number) {
    if (number == undefined || number == "" || number == null)
        return "0";
    ///<summary>格式化數字</summary>
    number = parseFloat(number);
    number = number.toFixed(0) + '';
    x = number.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function checkConnection() {
    var networkState = navigator.connection.type;;
    var states = {};
    if (networkState == Connection.NONE) {
        return false;
    } else {
        return true;
    }
}

function getCurrentDateAD() {
    var date = new Date();
    var currentYear = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    var currentDate = date.getDate();
    return leftPad(String(currentYear), 3) + "/" +
        leftPad(String(currentMonth), 2) + "/" +
        leftPad(currentDate, 2);
}

function getCurrentYearMin() {
    var date = new Date();
    var currentYear = date.getFullYear();
    return currentYear-1911;
}

function leftPad(val, length) {
    var str = '' + val;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

function chkValue(value) {
    if (value == "null" || value == "")
        value = "--";
    return value;
}

/* 資料更新 */
function downloadByOS(serverpath, fileName, endFunc) {
    if (checkConnection()) {
        switch (window.localStorage["platform"]) {
            case "iOS":
            case "Android":
                downloadfile(serverpath, fileName, endFunc); // 不需要解壓縮
                break;
            case "Windows":
                dlFileZip(serverpath, fileName, endFunc);
                break;
        }
    } else {
        navigator.notification.alert('請開啟網路進行系統初始化設定', function () {
            setTimeout(chk_download, 5000);
        }, '提示', '已確認網路正常');
    }
}

function init_download_end(fileName) {
    bindEvents();
    $("#updateProgress").html("資料下載已完成");
    dialogOff();
}

function downloaddb_end(fileName) {
    //alert(fileName);
    $("#updateCloseRTBtn ,#updateCloseRBBtn").on(eventTrigger, function () {
        setTimeout(function () {
            $("#updateCloseRTBtn ,#updateCloseRBBtn").prop("disabled", true);
        }, 1000);

    });

    $("#updateCloseRTBtn ,#updateCloseRBBtn").prop("disabled", false);
    $("#updateStatus").html("資料下載已完成");

    updateDate2DB();
}

function downloadppl_end(fileName) {
    //alert(fileName);
    $("#updateCloseRTBtn ,#updateCloseRBBtn").on(eventTrigger, function () {
        setTimeout(function () {
            $("#updateCloseRTBtn ,#updateCloseRBBtn").prop("disabled", true);
        }, 1000);

    });

    $("#updateCloseRTBtn ,#updateCloseRBBtn").prop("disabled", false);
    $("#updateStatus").html("大頭貼下載已完成");

    var d = new Date();
    var upd = ((d.getFullYear() - 1911) + "-" + (d.getMonth() + 1) + "-" + d.getDate());
    $("#updateItem99").html(upd);

    infodb_check();
    infodb.transaction(function (tx) {
        var d = new Date();
        var updFull = (d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()) + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getMinutes();

        var sqlcmd = "update KM_UPDATE_DATE set update_time='" + updFull + "' where NO = '99'";
        console.log("sqlcmd: " + sqlcmd);
        tx.executeSql(sqlcmd, [], function (tx2, res) {

        }, function (e) {
            console.log("ERROR: " + e.message);
        });
    });
}

// for android/ios download
function downloadfile(serverpath, fileName, endFunc) {
    ///<summary>下載檔案</summary>
    var fileTransfer = new FileTransfer();

    var filePath = window.localStorage["rootDir"] + "/" + fileName;
    var uri = encodeURI(serverpath + "/" + fileName);

    fileTransfer.onprogress = function (progressEvent) {
        if (progressEvent.lengthComputable) {
            var percent = (progressEvent.loaded / progressEvent.total) * 100;
            if (window.localStorage["platform"] == "Android")
                percent *= 0.5; // fixed bug for Android
            $("#updateStatus, #updateProgress").html("下載中 " + percent.toFixed(2) + " %");
        } else { }
    };

    fileTransfer.download(uri, filePath,
        function (entry) {
            console.log("download complete: " + entry.fullPath);
            endFunc(fileName);
        },
        function (error) {
            console.log("download error source " + error.source);
            console.log("download error target " + error.target);
            console.log("upload error code" + error.code);
            if (fileName.indexOf(allDBs[0]) > -1 || fileName.indexOf(allDBs[1]) > -1) {
                $h = $("<button onclick='chk_download();'>請確認網路連線，按此重新下載</button>");
                $h.on("click", function () {
                    $(this).hide()
                });
                $("#updateStatus, #updateProgress").html($h);
            }
        }, true
    );
}

/// <summary>解壓縮 for win8</summary>
/// <param name="serverpath+fileName" type="string">放壓縮檔的網址</param>
/// <param name="folder" type="string">device端要放壓縮檔跟解壓縮的位置</param>
/// <returns>no return</returns>
function dlFileZip(serverpath, fileName, callback /*, doUnZip*/) {
    var download = null;
    var promise = null;
    var imageStream = null;
    var uriString = encodeURI(serverpath + "/" + fileName);
    try {

        var fileName = uriString.substring(uriString.lastIndexOf("/") + 1, uriString.length);
        // Asynchronously的方式去建立devie端的解壓縮資料夾的位置
        Windows.Storage.ApplicationData.current.localFolder.createFileAsync(fileName, Windows.Storage.NameCollisionOption.replaceExisting).done(
            function (newFile) {
                var uri = Windows.Foundation.Uri(uriString);

                // 背景執行下載
                var downloader = new Windows.Networking.BackgroundTransfer.BackgroundDownloader();

                // 新建一個下載任務
                download = downloader.createDownload(uri, newFile);

                // 開始執行非同步下載
                promise = download.startAsync()
                    .done(
                        function () {
                            //if (doUnZip)
                            //    callback(fileName, folder, updateLastInfo, obj);
                            //else {
                            Windows.Storage.ApplicationData.current.localFolder.getFolderAsync(dbDir).done(function (dbFolder) {
                                newFile.moveAsync(dbFolder, fileName, Windows.Storage.NameCollisionOption.replaceExisting)
                                    .done(function () {
                                        callback(fileName);
                                    });
                            });
                            //}
                        },
                        function (e) {
                            console.log(e.message);
                            $("#updateStatus, #updateProgress").html("<center>" + e.message + "<br/><a href='#' onclick='chk_download();'>重新下載</a></center>");
                        },
                        function (progress) {
                            $("#updateStatus, #updateProgress").html("下載中 " + ((progress.progress.bytesReceived * 100 / progress.progress.totalBytesToReceive).toPrecision(3)) + "%");
                            console.log("Bytes retrieved: " + progress.progress.bytesReceived);
                        }
                    );
            },
            function () {
                console.log("error");
            });
    } catch (err) {
        console.log(err);
    }
}

function chkWords(words) {
    return String(words).replace(/\'/g, "''");
}

Number.prototype.pad = function (size) {
    ///<summary>擴充數字補0</summary>
    if (typeof (size) !== "number") {
        size = 2;
    }
    var s = String(this);
    while (s.length < size) s = "0" + s;
    return s;
}