// 動態載入需要的JS Library
//dynamicScriptByOS();
//db_check();
console.log('list.js on load..............');
// 全域參數
var sDate = "1070101";
var eDate = String(getCurrentDate());
var template = "";
var templateB = "";
var templatePrj = "";
var templatePhoto = "";
var templatePrjKind = "";
var templateAnalysisUnit = "";
var serachEvent;
var serachEventB;

// 圖台網址
var mapURL = "http://203.66.65.120/ChiayiwaterManagerAppMap/Map.aspx";

// app 初始化
var app = {
    initialize: function () {
        this.bindEvents();
    },
    bindEvents: function () {
         document.addEventListener('deviceready', this.onDeviceReady, false); // 這邊會中斷，所以沒辦法往下做事 
    },
    onDeviceReady: function () {
        setLayout(); // 版面初始化
        bindEvent(); // 綁定事件
      
        getData(); // 從service取得資料
    }
};

// 從service取得資料
function getData() {
    // 設定圖台端查詢的日期
    setMapDataDuration();

    // 取得工程資料
    getPCC();
    getCASE_HEADERList();

    // 取得統計資料
    getAnalysisA();
    getAnalysisB();
    getAnalysisC();
}

// 版面初始化
function setLayout() {
    var width = $(window).width();
    var height = $(window).height();
    var heightHearder = $("header[class='cd-main-header']").height();
    var heightBottom = $("nav[class='BottomNav']").height()+1;
    var heightTime = $("div[class='TimeBox']").height()+8;
    var heightContent = height - (heightHearder + heightBottom + heightTime);
    
    template = $("#item-1").html();
    templateB = $("#itemB-CS008").html();
    templatePrj = $("#itemPrj-1").html();
    templatePhoto = $("div[class='photoAll']").html();
    templatePrjKind = $("div[class='LakeGreenBox'] > div").html() + "<hr class=\"line-white\">";
    templateAnalysisUnit = $("#AnalysisUnit").html();
    
    $("#sDate").val(sDate.substring(0, 3) + "年" + sDate.substring(3, 5) + "月" + sDate.substring(5, 7) + "日");
    $("#eDate").val(eDate.substring(0, 3) + "年" + eDate.substring(3, 5) + "月" + eDate.substring(5, 7) + "日");
    $("div[class='TimeBox'] > font").html($("#sDate").val() + " ~ " + $("#eDate").val());
    
    $("#pageMap").width(width).height(heightContent);
    $("#remoteFrame").src = mapURL;
    $("#remoteFrame").width(width).height(heightContent);
}

// 綁定JQuery事件
function bindEvent() {
    // 綁定登出事件
    $("div[class='cd-header-logout']").off().on("click", function () {
        localStorage.setItem("NAME", "");
        localStorage.setItem("PWD", "");
        location.href = 'login.html';
    });

    // 綁定下方功能換頁事件
    $(".BottomNav > ul > li").off().on("click", function () {
        $(".BottomNav > ul > li").removeClass("active");
        $(this).addClass("active");
        switch ($(".BottomNav > ul > li").index($(this))) {
            case 0:
                $("#pageMain").hide();
                $("#pageMainAnalysis").hide();
                $("#pageMap").show();
                break;
            case 1:
                $("#pageMap").hide();
                $("#pageMain").hide();
                $("#pageMainAnalysis").show();
                break;
            case 2:
                $("#pageMap").hide();
                $("#pageMainAnalysis").hide();
                $("#pageMain").show();
                break;
        }

        $("#pageDetail").hide();
        $("#pageDetailB").hide();
        $("#pageDetailAnalysis").hide();
        $("#pageDetailPrj").hide();
    });

    // 綁定起始日期查詢事件
    $("#sDate").off().on("click", function () {
        $('#sDateLB').datetimepicker('show');
    });

    // 綁定結束日期查詢事件
    $("#eDate").off().on("click", function () {
        $('#eDateLB').datetimepicker('show');
    });

    // 綁定BtnSetting事件
    $(".BtnSetting").off().on("click", function () {
        if (($("#sDate").val() != "" && $("#eDate").val() == "") || $("#sDate").val() == "" && $("#eDate").val() != "") {
            alert("請填寫完整的搜尋區間");
            return;
        }

        sDate = $("#sDate").val().replace("年", "").replace("月", "").replace("日", "");
        eDate = $("#eDate").val().replace("年", "").replace("月", "").replace("日", "");

        if ($("#sDate").val() != "" && $("#eDate").val() != "")
            $("div[class='TimeBox'] > font").html($("#sDate").val() + " ~ " + $("#eDate").val());
        else
            $("div[class='TimeBox'] > font").html("");

        $(".cd-search-trigger").click();

        getData();

    });

    // 綁定選擇後的事件
    $("#selListKind").off().on("change", function () {
        getPCC();
    });

    // 綁定選擇後的事件
    $("#selListAmount").off().on("change", function () {
        getPCC();
    });

    // 綁定選擇後的事件
    $("#selProAmount").off().on("change", function () {
        $("#selProAmountPrj").val($(this).val());
        getAnalysisA();
        getExecuteUnitName();
    });

    // 綁定選擇後的事件
    $("#selProAmountPrj").off().on("change", function () {
        getPCCPRJ(1);
    });

    // 綁定選擇後的事件
    $("div[class='GrayBox-budget-nBG']").off().on("click", function () {
        $("#selProKind").val("");
        $("#selProKindPrj").val("");
        $("#selProAmount").val($("div[class='GrayBox-budget-nBG']").index($(this)) + 1);
        $("#selProAmountPrj").val($("div[class='GrayBox-budget-nBG']").index($(this)) + 1);
        getAnalysisA();
        getExecuteUnitName();
        $("#pageMainAnalysis").hide();
        $("#pageDetailAnalysis").show();
    });

    // 處理起始日期選擇器事件
    $('#sDateLB').datetimepicker({
        lang: 'ch',
        timepicker: false,
        onGenerate: function (ct) {
            //$(this).find('.xdsoft_date.xdsoft_weekend')
            //    .addClass('xdsoft_disabled');
        },
        format: 'Y-m-d',
        maxDate: getCurrentDateAD(), // and tommorow is maximum date calendar
        onSelectDate: function (ct, $i) {
            $("#sDate").val((ct.getFullYear() - 1911) + "年" + leftPad(ct.getMonth() + 1, 2) + "月" + leftPad(ct.getDate(), 2) + "日");
        }
    });

    // 處理結束日期選擇器事件
    $("#eDateLB").datetimepicker({
        lang: 'ch',
        timepicker: false,
        onGenerate: function (ct) {
            //$(this).find('.xdsoft_date.xdsoft_weekend')
            //    .addClass('xdsoft_disabled');
        },
        format: 'Y-m-d',
        maxDate: getCurrentDateAD(), // and tommorow is maximum date calendar
        onSelectDate: function (ct, $i) {
            $("#eDate").val((ct.getFullYear() - 1911) + "年" + leftPad(ct.getMonth() + 1, 2) + "月" + leftPad(ct.getDate(), 2) + "日");
        }
    });

    // 搜尋篩選
    $("#searchPrj").off().on("keyup", function () {
        clearTimeout(serachEvent);
        serachEvent = setTimeout(function () {
            getPCCPRJ(1);
        }, 1000);

    });

    // 搜尋篩選
    $("#listSearch").off().on("keyup", function () {
        clearTimeout(serachEvent);
        serachEvent = setTimeout(function () {
            getPCC();
        }, 1000);
    });

    // 搜尋篩選
    $("#listSearchB").off().on("keyup", function () {
        clearTimeout(serachEventB);
        serachEventB = setTimeout(function () {
            getCASE_HEADERList();
        }, 1000);
    });

    // 更新ENG_PCC_BASIC
    $("ul[class='cd-header-refresh']").off().on("click", function () {
        $("body").loading({
            overlay: $("#custom-overlay")
        });
        callBK = function () {
            $("body").loading('stop');
            getData();
        };
        updateENG_PCC_BASIC();

    });
}

// 圖台日期指定
function setMapDataDuration() {
    var sD = (parseInt(sDate.substring(0, 3)) + 1911) + "-" + sDate.substring(3, 5) + "-" + sDate.substring(5, 7);
    var eD = (parseInt(eDate.substring(0, 3)) + 1911) + "-" + eDate.substring(3, 5) + "-" + eDate.substring(5, 7);

    document.getElementById('remoteFrame').src = mapURL + "#startDate=" + sD + "&endDate=" + eD;
}

// 取得PCC資料
function getPCC() {
    for (var i = 1; i <= 5; i++) {
        $("#item-" + i).empty();
    }

    var where = "";
    var where2 = "where 1=1 ";
    var kind = $("#selListKind").val();
    var amount = parseInt($("#selListAmount").val());
    var keyword = $("#listSearch").val();

    if (sDate != "" && eDate != "") {
        where = "and cast((ProgYear || substr('000000000', 1, (2-length(ProgMonth))) || ProgMonth) as integer) >= " + sDate.substring(0, 5) + " and ";
        where += "cast((ProgYear || substr('000000000', 1, (2-length(ProgMonth))) || ProgMonth) as integer) <= " + eDate.substring(0, 5) + " ";
        where2 += "and ActualBidAwardDate >= " + sDate + " and ActualBidAwardDate <= " + eDate + " ";
    }

    if (kind != "") {
        if (kind != "other")
            where2 += "and ProjectKind='" + kind + "' ";
        else
            where2 += "and ProjectKind in ('',null,'null','非屬專案') ";
    }

    switch (amount) {
        case 0:
            amount = "";
            break;
        case 1:
            amount = "and BidAwardAmount >= 200000 ";
            break;
        case 2:
            amount = "and BidAwardAmount >= 50000 and BidAwardAmount < 200000 ";
            break;
        case 3:
            amount = "and BidAwardAmount >= 10000 and BidAwardAmount < 50000 ";
            break;
        case 4:
            amount = "and BidAwardAmount >= 1000 and BidAwardAmount < 10000 ";
            break;
        case 5:
            amount = "and BidAwardAmount < 1000 ";
            break;
    }

    if (keyword != "")
        where2 += "and (ProjectName like '%" + keyword + "%' or Appealer like '%" + keyword + "%') ";

    db_check();
    var sqlcmd = "select    idx,( ";
    sqlcmd += "select case    when ExecuteState in ('準備開工中', '施工中') Then 1 ";
    sqlcmd += "when ExecuteState in ('完工待驗收', '驗收中', '驗收完成', '保固中','已結案') Then 2 ";
    sqlcmd += "when ExecuteState in ('停工中') Then 3 ";
    sqlcmd += "when ExecuteState in ('未開工', '公告中', '審標中', '準備招標文件中', '設計中', '解約重新發包', '解約') Then 4 ";
    sqlcmd += "else 5 ";
    sqlcmd += "end ExecuteState ";
    sqlcmd += "from ENG_PCC_PROGRESS ";
    sqlcmd += "where ProjectNo=b.ProjectNo ";
    sqlcmd += where;
    sqlcmd += "order by ProgYear desc, ProgMonth desc limit 1 ";
    sqlcmd += ") ExecuteState, ";
    sqlcmd += "(select ActProgress from ENG_WEEKLY_PROGRESS where ENG_ID=b.ProjectNo order by Cycle desc limit 1 ";
    sqlcmd += " ) ActTotalProgress, ";
    sqlcmd += "(select ActProgress-PreProgress from ENG_WEEKLY_PROGRESS where ENG_ID=b.ProjectNo order by Cycle desc limit 1 ";
    sqlcmd += " ) NowProgress, ";
    sqlcmd += "ActualBidAwardDate, CountyTown, ProjectName, b.ProjectNo, BidAwardAmount, Appealer, PosX, PosY, HostUnitName, ContactName, ContactTele, MonitorUnitName, ContractedUnitName, AnnounceBudget, PeriodKind, TotalExecuteDays, WorkAddr, EngKind, ActualWorkDate, PreWorkDate, ActualFinishDate  ";
    sqlcmd += "from ENG_PCC_BASIC b " + where2 + " " + amount + " order by idx desc";

    db.transaction(
        function (tx) {
            tx.executeSql(sqlcmd, [], function (tx2, res) {
                for (var i = 0; i < res.rows.length; i++) {

                    var ExecuteState = res.rows.item(i).ExecuteState;
                    var state = res.rows.item(i).ExecuteState;
                        if (ExecuteState == null || ExecuteState == undefined || ExecuteState == "" || ExecuteState == "5")
                        ExecuteState = 5;
                    $("#item-" + ExecuteState).append(template);

                    var county = res.rows.item(i).CountyTown;
                    if (res.rows.item(i).CountyTown.length > 3)
                        county = res.rows.item(i).CountyTown.substring(3, 6);

                    var progress = res.rows.item(i).ActTotalProgress;
                    if (progress == null || progress == "null")
                        progress = "--";
                    else
                        progress = parseFloat(progress).toFixed(0) + "%";

                    var nowProgress = res.rows.item(i).NowProgress;
                    if (nowProgress == null || nowProgress == "null")
                        nowProgress = "--";
                    else {
                        if (nowProgress > 0)
                            nowProgress = "<font color='blue'>(進度超前" + parseFloat(nowProgress).toFixed(2) + "%)</font>";
                        else if (nowProgress < 0)
                            nowProgress = "<font color='red'>(進度落後" + parseFloat(nowProgress).toFixed(2) + "%)</font>";
                        else
                            nowProgress = "<font color='green'>(進度符合)</font>";
                    }

                    var BidAwardAmount = res.rows.item(i).BidAwardAmount;
                    if (BidAwardAmount == "null")
                        BidAwardAmount = "--";
                    else
                        BidAwardAmount = formatNumber(parseFloat(BidAwardAmount).toFixed(0));

                    $("div[class='List PCC'] > label").html(String(res.rows.item(i).ActualBidAwardDate.substring(0, 3)) + "年度/" + county);
                    $("div[class='List PCC'] > span").html(res.rows.item(i).ProjectName);
                    $("div[class='List PCC'] > div > span").eq(0).html(progress);
                    $("div[class='List PCC'] > div > font").eq(0).html(nowProgress);
                    $("div[class='List PCC'] > div > span").eq(1).html(BidAwardAmount);
                    if (parseFloat(res.rows.item(i).PosX) > 0 || parseFloat(res.rows.item(i).PosY) > 0) {
                        $("div[class='List PCC'] > input").off().on("click", {
                            engID: res.rows.item(i).idx
                        }, function (e) {
                            e.stopPropagation();
                            $(".BottomNav > ul > li").eq(0).trigger("click");
                            go2Eng(e.data.engID);
                        })
                    } else {
                        $("div[class='List PCC'] > input").hide();
                    }
                    $("div[class='List PCC']").off().on("click", {
                        ProjectNo: res.rows.item(i).ProjectNo,
                        ProjectName: res.rows.item(i).ProjectName,
                        HostUnitName: res.rows.item(i).HostUnitName,
                        ContactName: res.rows.item(i).ContactName,
                        ContactTele: res.rows.item(i).ContactTele,
                        MonitorUnitName: res.rows.item(i).MonitorUnitName,
                        ContractedUnitName: res.rows.item(i).ContractedUnitName,
                        AnnounceBudget: res.rows.item(i).AnnounceBudget,
                        BidAwardAmount: res.rows.item(i).BidAwardAmount,
                        PeriodKind: res.rows.item(i).PeriodKind,
                        TotalExecuteDays: res.rows.item(i).TotalExecuteDays,
                        WorkAddr: res.rows.item(i).WorkAddr,
                        EngKind: res.rows.item(i).EngKind,
                        ActualWorkDate: res.rows.item(i).ActualWorkDate,
                        PreWorkDate: res.rows.item(i).PreWorkDate,
                        ActualFinishDate: res.rows.item(i).ActualFinishDate
                    }, function (e) {
                        $("#pageMain").hide();
                        $("#pageDetail").show();
                        $("#detailBack").off().on("click", function () {
                            goBack();
                        });

                        $("#pageDetail > p").html(chkValue(e.data.ProjectName));
                        $("div[class='DetailLine']").eq(0).find("span").eq(1).html(chkValue(e.data.ProjectNo));
                        $("div[class='DetailLine']").eq(1).find("span").eq(1).html(chkValue(e.data.HostUnitName));
                        $("div[class='DetailLine']").eq(2).find("span").eq(1).html(chkValue(e.data.ContactName));
                        $("div[class='DetailLine']").eq(3).find("span").eq(1).html(chkValue(e.data.ContactTele));
                        $("div[class='DetailLine']").eq(4).find("span").eq(1).html(chkValue(e.data.MonitorUnitName));
                        $("div[class='DetailLine']").eq(5).find("span").eq(1).html(chkValue(e.data.ContractedUnitName));
                        $("div[class='DetailLine']").eq(6).find("span").eq(1).html(chkValue(formatNumber(e.data.AnnounceBudget)) + "千元");
                        $("div[class='DetailLine']").eq(7).find("span").eq(1).html(chkValue(formatNumber(e.data.BidAwardAmount)) + "千元");
                        $("div[class='DetailLine']").eq(8).find("span").eq(1).html(chkValue(e.data.PeriodKind));
                        $("div[class='DetailLine']").eq(9).find("span").eq(1).html(chkValue(e.data.TotalExecuteDays));
                        $("div[class='DetailLine']").eq(10).find("span").eq(1).html(chkValue(e.data.WorkAddr));
                        $("div[class='DetailLine']").eq(11).find("span").eq(1).html(chkValue(e.data.EngKind));
                        $("div[class='DetailLine']").eq(12).find("span").eq(1).html(chkValue(e.data.ActualWorkDate));
                        $("div[class='DetailLine']").eq(13).find("span").eq(1).html(chkValue(e.data.PreWorkDate));
                        $("div[class='DetailLine']").eq(14).find("span").eq(1).html(chkValue(e.data.ActualFinishDate));

                        getPrjPhoto(e.data.ProjectNo);
                    });
                    $("div[class='List PCC']").attr("class", "List PCC" + i);
                }

                $("label[class='Label-Num']").eq(0).html("(" + $("#item-1 > div").length + ")");
                $("label[class='Label-Num']").eq(1).html("(" + $("#item-2 > div").length + ")");
                $("label[class='Label-Num']").eq(2).html("(" + $("#item-3 > div").length + ")");
                $("label[class='Label-Num']").eq(3).html("(" + $("#item-4 > div").length + ")");
                $("label[class='Label-Num']").eq(4).html("(" + $("#item-5 > div").length + ")");
            },
                function (e) {
                    console.log("ERROR: " + e.message);
                });
        }
    );
}

// 取得CASE_HEADERList
function getCASE_HEADERList() {
    var where = "";
    var where2 = "";
    var keyword = $("#listSearchB").val();

    $("#itemB-CS008").empty();
    $("#itemB-CS001").empty();
    $("#itemB-CS003").empty();
    $("#itemB-CS006").empty();

    if (sDate != "" && eDate != "") {
        var sYYYYDate = (parseInt(sDate.substring(0, 3)) + 1911) + sDate.substring(3);
        var eYYYYDate = (parseInt(eDate.substring(0, 3)) + 1911) + eDate.substring(3);
        where = "and cast(replace(CASE_APPLY_DATE,'/','') as Integer) >= " + sYYYYDate + " and cast(replace(CASE_APPLY_DATE,'/','') as Integer) <= " + eYYYYDate + " and (CASE_NO like '" + sDate.substring(0, 3) + "%' or CASE_NO like '" + eDate.substring(0, 3) + "%')";
    }

    if (keyword != "")
        where2 += "and (CASE_APPLY_USER like '%" + keyword + "%') ";

    db_check();
    var sqlcmd = "select  a.CASE_ID CASEID, a.*, (select idx from ENG_PCC_BASIC where ProjectNo=a.CASE_CONTRACT_NO ) idx from CASE_HEADER a left join CASE_PROCESS b on a.CASE_ID=b.CASE_ID where 1=1 and a.IS_VALID='true' and (b.IS_VALID='true' or b.IS_VALID is null or b.IS_VALID='null' ) " + where + " " + where2 + " order by cast(replace(CASE_APPLY_DATE,'/','') as Integer) desc";
    db.transaction(
        function (tx) {
            tx.executeSql(sqlcmd, [], function (tx2, res) {
                for (var i = 0; i < res.rows.length; i++) {
                    // debugger;
                    var CASE_SOURCE = res.rows.item(i).CASE_SOURCE;
                    $("#itemB-" + CASE_SOURCE).append(templateB);
                    
                    $("div[class='List CASE'] > label").eq(0).html(chkValue(res.rows.item(i).CASE_WORK_AREA));
                    $("div[class='List CASE'] > label").eq(1).find("font").html(chkValue(res.rows.item(i).CASE_APPLY_USER));
                    $("div[class='List CASE'] > span").html(chkValue(res.rows.item(i).CASE_CONTENT));
                    $("div[class='List CASE'] > div > span").eq(1).html(chkValue(yyyy2yyy(res.rows.item(i).CASE_APPLY_DATE)));
                    $("div[class='List CASE'] > div > span").eq(3).html(chkValue(yyyy2yyy(res.rows.item(i).CASE_PRE_CLOSE_DATE)));
                    $("div[class='List CASE'] > div > span").eq(5).html(chkValue(yyyy2yyy(res.rows.item(i).CASE_CLOSE_DATE)));
                    if (res.rows.item(i).CASE_POS_X != null && res.rows.item(i).CASE_POS_Y != null && res.rows.item(i).CASE_POS_X != "null" && res.rows.item(i).CASE_POS_Y != "null") {
                        $("div[class='List CASE'] > input").off().on("click", {
                            CASE_ID: res.rows.item(i).CASEID,
                            PosX: res.rows.item(i).CASE_POS_X,
                            PosY: res.rows.item(i).CASE_POS_Y
                        }, function (e) {
                            e.stopPropagation();
                            go2Case(e.data.CASE_ID);
                        })
                    } else {
                        $("div[class='List CASE'] > input").hide();
                    }
                    $("div[class='List CASE']").off().on("click", {
                        CASE_APPLY_USER: res.rows.item(i).CASE_APPLY_USER,
                        CASE_APPLY_DATE: res.rows.item(i).CASE_APPLY_DATE,
                        CASE_PRE_CLOSE_DATE: res.rows.item(i).CASE_PRE_CLOSE_DATE,
                        CASE_CLOSE_DATE: res.rows.item(i).CASE_CLOSE_DATE,
                        CASE_WORK_AREA: res.rows.item(i).CASE_WORK_AREA,
                        CASE_POS_X: res.rows.item(i).CASE_POS_X,
                        CASE_POS_Y: res.rows.item(i).CASE_POS_Y,
                        CASE_CONTENT: res.rows.item(i).CASE_CONTENT,
                        PROC_CONTENT: res.rows.item(i).PROC_CONTENT,
                        CASE_CONTRACT_NO: res.rows.item(i).CASE_CONTRACT_NO,
                        TotalExecuteDays: res.rows.item(i).TotalExecuteDays,
                        WorkAddr: res.rows.item(i).WorkAddr,
                        EngKind: res.rows.item(i).EngKind,
                        ActualWorkDate: res.rows.item(i).ActualWorkDate,
                        PreWorkDate: res.rows.item(i).PreWorkDate,
                        ActualFinishDate: res.rows.item(i).ActualFinishDate
                    }, function (e) {
                        $("#pageMain").hide();
                        $("#pageDetailB").show();

                        $("#pageDetailB > p > font").html(chkValue(e.data.CASE_APPLY_USER));
                        $("#pageDetailB > div[class='DetailLine']").eq(0).find("span").eq(1).html(chkValue(yyyy2yyy(e.data.CASE_APPLY_DATE)));
                        $("#pageDetailB > div[class='DetailLine']").eq(1).find("span").eq(1).html(chkValue(yyyy2yyy(e.data.CASE_PRE_CLOSE_DATE)));
                        $("#pageDetailB > div[class='DetailLine']").eq(2).find("span").eq(1).html(chkValue(yyyy2yyy(e.data.CASE_CLOSE_DATE)));
                        $("#pageDetailB > div[class='DetailLine']").eq(3).find("span").eq(1).html(chkValue(e.data.CASE_WORK_AREA));
                        $("#pageDetailB > div[class='DetailLine']").eq(4).find("span").eq(1).html(chkValue(e.data.CASE_POS_X));
                        $("#pageDetailB > div[class='DetailLine']").eq(5).find("span").eq(1).html(chkValue(e.data.CASE_POS_Y));
                        $("#pageDetailB > div[class='DetailLine']").eq(6).find("span").eq(1).html(chkValue(e.data.CASE_CONTENT));
                        $("#pageDetailB > div[class='DetailLine']").eq(7).find("span").eq(1).html(chkValue(e.data.PROC_CONTENT));
                        $("#pageDetailB > div[class='DetailLine']").eq(10).find("span").eq(1).html(chkValue(e.data.CASE_CONTRACT_NO));

                        getEngData(e.data.CASE_CONTRACT_NO);
                    });
                    $("div[class='List CASE']").attr("class", "List CASE" + i);
                }

                $("label[class='Label-Num']").eq(5).html("(" + $("#itemB-CS008 > div").length + ")");
                $("label[class='Label-Num']").eq(6).html("(" + $("#itemB-CS001 > div").length + ")");
                $("label[class='Label-Num']").eq(7).html("(" + $("#itemB-CS003 > div").length + ")");
                $("label[class='Label-Num']").eq(8).html("(" + $("#itemB-CS006 > div").length + ")");
            },
                function (e) {
                    console.log("ERROR: " + e.message);
                });
        }
    );
}

// 取得工程資料
function getEngData(engNO) {
    if (engNO != "null" && engNO != "") {
        db_check();
        var sqlcmd = "select ProjectName, BidAwardAmount, (";
        sqlcmd += "select case    when ExecuteState in ('準備開工中', '施工中') Then 1 ";
        sqlcmd += "when ExecuteState in ('完工待驗收', '驗收中', '驗收完成', '保固中','已結案') Then 2 ";
        sqlcmd += "when ExecuteState in ('停工中') Then 3 ";
        sqlcmd += "when ExecuteState in ('公告中', '審標中', '準備招標文件中', '設計中', '解約重新發包', '解約') Then 4 ";
        sqlcmd += "else 0 ";
        sqlcmd += "end ExecuteState ";
        sqlcmd += "from ENG_PCC_PROGRESS ";
        sqlcmd += "where ProjectNo=b.ProjectNo ";
        sqlcmd += "order by ProgYear desc, ProgMonth desc limit 1 ";
        sqlcmd += ") ExecuteState, ";
        sqlcmd += "(select ActProgress from ENG_WEEKLY_PROGRESS where ENG_ID=b.ProjectNo order by Cycle desc limit 1) ActProgress ";
        sqlcmd += "from ENG_PCC_BASIC b where ProjectNo='" + engNO + "' limit 1";

        db.transaction(
            function (tx) {
                tx.executeSql(sqlcmd, [], function (tx2, res) {
                    $("div[class='DetailBox'] > span[class='Txt']").eq(0).html(chkValue(res.rows.item(0).ProjectName));
                    $("div[class='DetailBox'] > span[class='Txt']").eq(1).html(chkValue(formatNumber(res.rows.item(0).BidAwardAmount)));
                    $("div[class='DetailBox'] > span[class='Txt']").eq(2).html(chkValue(getEngStatus(res.rows.item(0).ExecuteState)));
                    $("div[class='DetailBox'] > span[class='Txt']").eq(3).html(chkValue(res.rows.item(0).ActProgress));
                },
                    function (e) {
                        console.log("ERROR: " + e.message);
                    });
            }
        );
    } else {
        $("div[class='DetailBox'] > span[class='Txt']").eq(0).html("無發包工程");
        $("div[class='DetailBox'] > span[class='Txt']").eq(1).html("--");
        $("div[class='DetailBox'] > span[class='Txt']").eq(2).html("--");
        $("div[class='DetailBox'] > span[class='Txt']").eq(3).html("--");
    }
}

// 取得工程狀態
function getEngStatus(status) {
    if (status != "null" && status != "") {
        if (status == 0)
            return "在建中";
        else if (status == 1)
            return "已竣工";
        else if (status == 2)
            return "停工中";
        else if (status == 3)
            return "尚未開工";
    }
    return status
}

// 取得工程狀態照片
function getPrjPhoto(id) {
    db_check();

    var sqlcmd = "select * from ENG_REL_FILE where ENG_ID='"+id+"' and FILE_KIND in('WKB','WKI','WKA') order by ENG_ID, case FILE_KIND when 'WKB' then 1  when 'WKI' then 2 when 'WKA' then 3 end , idx";

    $("div[class='photoAll']").empty();
    db.transaction(
        function (tx) {
            tx.executeSql(sqlcmd, [], function (tx2, res) {
                for (var i = 0; i < res.rows.length; i++) {
                    var type = "";
                    if (res.rows.item(i).FILE_KIND == "WKB")
                        type = "施工前";
                    else if (res.rows.item(i).FILE_KIND == "WKI")
                        type = "施工中";
                    else if (res.rows.item(i).FILE_KIND == "WKA")
                        type = "施工後";
                    $("div[class='photoAll']").append(templatePhoto);
                    $("div[class='photoBox'] > figure > img").attr("src", res.rows.item(i).FILE_PATH);
                    $("div[class='photoBox'] > div").eq(0).find("label").html(type);
                    $("div[class='photoBox'] > div").eq(1).html(chkValue(res.rows.item(i).FILE_COMMENT));
                    $("div[class='photoBox']").attr("class", "photoBox done")
                }

            },
                function (e) {
                    console.log("ERROR: " + e.message);
                });
        }
    );
}

// 換頁轉場
function go2Eng(engID) {
    document.getElementById('remoteFrame').src = mapURL+"#engID=" + engID;
    $(".BottomNav>ul>li").eq(0).click();
}

// 換頁轉場
function go2Case(caseID) {
    document.getElementById('remoteFrame').src = mapURL + "#caseID=" + caseID;
    $(".BottomNav>ul>li").eq(0).click();
}

// 取得統計資料
function getAnalysisA() {
    var where = "where 1=1 ";
    var kind = $("#selProKind").val();
    var amount = parseInt($("#selProAmount").val());

    db_check();

    if (sDate != "" && eDate != "") {
        var yearMin = getCurrentYearMin();
        var sYYYYDate = (parseInt(sDate.substring(0, 3)) + 1911) + sDate.substring(3);
        var eYYYYDate = (parseInt(eDate.substring(0, 3)) + 1911) + eDate.substring(3);
        where += "and ( ";
        where += "          (ActualBidAwardDate >= " + sDate + " and ActualBidAwardDate <= " + eDate + ") ";
        where += "    ) ";
    }

    if (kind != "") {
        if (kind != "other")
            where += "and ProjectKind='" + kind + "' ";
        else
            where += "and ProjectKind in ('',null,'null','非屬專案') ";
    }

    switch (amount) {
        case 0:
            amount = "";
            break;
        case 1:
            amount = "and BidAwardAmount >= 200000 ";
            break;
        case 2:
            amount = "and BidAwardAmount >= 50000 and BidAwardAmount < 200000 ";
            break;
        case 3:
            amount = "and BidAwardAmount >= 10000 and BidAwardAmount < 50000 ";
            break;
        case 4:
            amount = "and BidAwardAmount >= 1000 and BidAwardAmount < 10000 ";
            break;
        case 5:
            amount = "and BidAwardAmount < 1000 ";
            break;
    }

    var sqlcmd = "select count(ProjectNo) ProjectNo, sum(AnnounceBudget) AnnounceBudget, sum(BidAwardAmount) BidAwardAmount from ( ";
    sqlcmd += "select ProjectNo, AnnounceBudget, BidAwardAmount from ENG_PCC_BASIC " + where + " " + amount;
    sqlcmd += ")";

    db.transaction(
        function (tx) {
            tx.executeSql(sqlcmd, [], function (tx2, res) {
                if (kind == "" && amount == "") {
                    $("div[class='GrayBox-analysis'] > div > span").eq(0).html(chkValue(formatNumber(res.rows.item(0).ProjectNo)));
                    $("div[class='GrayBox-analysis'] > div > span").eq(1).html(chkValue(formatNumber(res.rows.item(0).AnnounceBudget)));
                    $("div[class='GrayBox-analysis'] > div > span").eq(2).html(chkValue(formatNumber(res.rows.item(0).BidAwardAmount)));
                }

                // for detail
                $("div[class='Analysis-allBox-c'] > span").eq(0).html(chkValue(formatNumber(res.rows.item(0).ProjectNo)));
                $("div[class='Analysis-allBox-c'] > span").eq(1).html(chkValue(formatNumber(res.rows.item(0).BidAwardAmount)));
                $("div[class='GrayBox-analysis']").off().on("click", function () {
                    $("#selProKind").val("");
                    $("#selProKindPrj").val("");
                    $("#selProAmount").val(0);
                    $("#selProAmountPrj").val(0);
                    getAnalysisA();
                    getExecuteUnitName();
                    $("#pageMainAnalysis").hide();
                    $("#pageDetailAnalysis").show();
                });

                getExecuteUnitName();
            },
                function (e) {
                    console.log("ERROR: " + e.message);
                });
        }
    );
}

// 取得統計資料
function getAnalysisB() {
    var where = "";
    var amount = [0, 0, 0, 0, 0];

    db_check();

    if (sDate != "" && eDate != "") {
        var yearMin = getCurrentYearMin();
        var sYYYYDate = (parseInt(sDate.substring(0, 3)) + 1911) + sDate.substring(3);
        var eYYYYDate = (parseInt(eDate.substring(0, 3)) + 1911) + eDate.substring(3);
        where = "where 1=1 ";
        where += "and ( ";
        where += "          (ActualBidAwardDate >= " + sDate + " and ActualBidAwardDate <= " + eDate + ") ";
        where += "    ) ";

    }

    var sqlcmd = "select BidAwardAmount from ENG_PCC_BASIC " + where;

    db.transaction(
        function (tx) {
            tx.executeSql(sqlcmd, [], function (tx2, res) {
                for (var i = 0; i < res.rows.length; i++) {
                    if (parseInt(res.rows.item(i).BidAwardAmount) >= 200000)
                        amount[0] = amount[0] + 1;
                    else if (parseInt(res.rows.item(i).BidAwardAmount) < 200000 && parseInt(res.rows.item(i).BidAwardAmount) >= 50000)
                        amount[1] = amount[1] + 1;
                    else if (parseInt(res.rows.item(i).BidAwardAmount) < 50000 && parseInt(res.rows.item(i).BidAwardAmount) >= 10000)
                        amount[2] = amount[2] + 1;
                    else if (parseInt(res.rows.item(i).BidAwardAmount) < 10000 && parseInt(res.rows.item(i).BidAwardAmount) >= 1000)
                        amount[3] = amount[3] + 1;
                    else if (parseInt(res.rows.item(i).BidAwardAmount) < 1000)
                        amount[4] = amount[4] + 1;
                }

                for (var i = 0; i < amount.length; i++) {
                    $("div[class='GrayBox-budget-nBG'] > span").eq(i).html(formatNumber(amount[i]));
                }
            },
                function (e) {
                    console.log("ERROR: " + e.message);
                });
        }
    );
}

// 取得統計資料
function getAnalysisC() {
    var where = " where 1=1 ";
    var amount = [0, 0, 0, 0, 0];

    db_check();

    if (sDate != "" && eDate != "") {
        var yearMin = getCurrentYearMin();
        var sYYYYDate = (parseInt(sDate.substring(0, 3)) + 1911) + sDate.substring(3);
        var eYYYYDate = (parseInt(eDate.substring(0, 3)) + 1911) + eDate.substring(3);
        where += "and ( ";
        where += "          (ActualBidAwardDate >= " + sDate + " and ActualBidAwardDate <= " + eDate + ") ";
        where += "    ) ";
    }

    var sqlcmd = "select ProjectKind, sum(BidAwardAmount) BidAwardAmount, count(*) cnt from ( select ProjectKind, BidAwardAmount from ENG_PCC_BASIC " + where;
    sqlcmd += ") group by ProjectKind order by count(*) desc";

    db.transaction(
        function (tx) {
            tx.executeSql(sqlcmd, [], function (tx2, res) {
                var prjKindCnt = 0;
                var prjKindAmount = 0;

                $("div[class='LakeGreenBox'] > div").empty();
                $("#selListKind").empty().append("<option value='' selected>全部</option>");
                $("#selProKind").empty().append("<option value='' selected>全部</option>");
                $("#selProKindPrj").empty().append("<option value='' selected>全部</option>");

                for (var i = 0; i < res.rows.length; i++) {
                    if (res.rows.item(i).ProjectKind == "" || res.rows.item(i).ProjectKind == null || res.rows.item(i).ProjectKind == "null" || res.rows.item(i).ProjectKind == "非屬專案") {
                        prjKindCnt = prjKindCnt + parseInt(res.rows.item(i).cnt);
                        prjKindAmount = prjKindAmount + parseInt(res.rows.item(i).BidAwardAmount);
                    } else {
                        $("div[class='LakeGreenBox'] > div").append(templatePrjKind);
                        $("div[class='LakeGreenBox'] > div > a").addClass("PRJ");
                        $("div[class='LakeGreenBox'] > div > a[class='PRJ'] > div > p").html(res.rows.item(i).ProjectKind);
                        $("div[class='LakeGreenBox'] > div > a[class='PRJ'] > div > div").eq(0).html(res.rows.item(i).cnt + "件");
                        $("div[class='LakeGreenBox'] > div > a[class='PRJ'] > div > div").eq(1).html(formatNumber(res.rows.item(i).BidAwardAmount) + "(千元)");
                        $("div[class='LakeGreenBox'] > div > a[class='PRJ']").attr("class", "donePRJ").attr("alt", res.rows.item(i).ProjectKind);

                        $("#selListKind").append("<option value='" + res.rows.item(i).ProjectKind + "'>" + res.rows.item(i).ProjectKind + "</option>");
                        $("#selProKind").append("<option value='" + res.rows.item(i).ProjectKind + "'>" + res.rows.item(i).ProjectKind + "</option>");
                        $("#selProKindPrj").append("<option value='" + res.rows.item(i).ProjectKind + "'>" + res.rows.item(i).ProjectKind + "</option>");
                    }
                }

                $("div[class='LakeGreenBox'] > div").append(templatePrjKind);
                $("div[class='LakeGreenBox']").parent().append("<div style='height:100px;'> </div>");
                $("div[class='LakeGreenBox'] > div > a").addClass("PRJ");
                $("div[class='LakeGreenBox'] > div > a[class='PRJ'] > div > p").html("其他計畫");
                $("div[class='LakeGreenBox'] > div > a[class='PRJ'] > div > div").eq(0).html(prjKindCnt + "件");
                $("div[class='LakeGreenBox'] > div > a[class='PRJ'] > div > div").eq(1).html(formatNumber(prjKindAmount) + "(千元)");
                $("div[class='LakeGreenBox'] > div > a[class='PRJ']").attr("class", "donePRJ").attr("alt", "other");

                $("div[class='LakeGreenBox'] > div > a").off().on("click", function () {
                    $("#selProKind").val($(this).attr("alt"));
                    $("#selProKindPrj").val($(this).attr("alt"));
                    $("#selProAmount").val(0);
                    $("#selProAmountPrj").val(0);
                    getAnalysisA();
                    getExecuteUnitName();
                    $("#pageMainAnalysis").hide();
                    $("#pageDetailAnalysis").show();
                });

                $("#selListKind").append("<option value='other'>其他計畫</option>");
                $("#selProKind").append("<option value='other'>其他計畫</option>");
                $("#selProKindPrj").append("<option value='other'>其他計畫</option>");
                $("#selProKind").off().on("change", function () {
                    $("#selProKindPrj").val($(this).val())
                    getAnalysisA();
                    getExecuteUnitName();
                });
                $("#selProKindPrj").off().on("change", function () {
                    getPCCPRJ(1);
                });
            },
                function (e) {
                    console.log("ERROR: " + e.message);
                });
        }
    );
}

// 取得執行單位名稱
function getExecuteUnitName() {
    var where = "where 1=1 ";
    var kind = $("#selProKind").val();
    var amount = parseInt($("#selProAmount").val());

    db_check();

    if (sDate != "" && eDate != "") {
        var sYYYYDate = (parseInt(sDate.substring(0, 3)) + 1911) + sDate.substring(3);
        var eYYYYDate = (parseInt(eDate.substring(0, 3)) + 1911) + eDate.substring(3);
        where += "and ActualBidAwardDate >= " + sDate + " and ActualBidAwardDate <= " + eDate + " ";
    }

    if (kind != "") {
        if (kind != "other")
            where += "and ProjectKind='" + kind + "' ";
        else
            where += "and ProjectKind in ('',null,'null','非屬專案') ";
    }

    switch (amount) {
        case 0:
            amount = "";
            break;
        case 1:
            amount = "and BidAwardAmount >= 200000 ";
            break;
        case 2:
            amount = "and BidAwardAmount >= 50000 and BidAwardAmount < 200000 ";
            break;
        case 3:
            amount = "and BidAwardAmount >= 10000 and BidAwardAmount < 50000 ";
            break;
        case 4:
            amount = "and BidAwardAmount >= 1000 and BidAwardAmount < 10000 ";
            break;
        case 5:
            amount = "and BidAwardAmount < 1000 ";
            break;
    }

    var sqlcmd = "select  ExecuteUnitName, count(*) cnt, sum(BidAwardAmount) BidAwardAmount from ENG_PCC_BASIC " + where + " " + amount + " group by ExecuteUnitName order by count(*) desc, sum(BidAwardAmount) desc";

    db.transaction(
        function (tx) {
            tx.executeSql(sqlcmd, [], function (tx2, res) {

                $("#AnalysisUnit").empty();

                for (var i = 0; i < res.rows.length; i++) {

                    $("#AnalysisUnit").append(templateAnalysisUnit);
                    $("div[class='Analysis-c-gray00'] > h2").html(res.rows.item(i).ExecuteUnitName);
                    $("div[class='Analysis-c-gray00'] > div[class='Analysis-Department']").eq(0).find("span").html(formatNumber(res.rows.item(i).cnt));
                    $("div[class='Analysis-c-gray00'] > div[class='Analysis-Department']").eq(1).find("span").html(formatNumber(res.rows.item(i).BidAwardAmount));
                    $("div[class='Num Analysis']").eq(0).attr("class", "Num Analysis 1" + res.rows.item(i).ExecuteUnitName).attr("status", "1").attr("unit", res.rows.item(i).ExecuteUnitName);
                    $("div[class='Num Analysis']").eq(0).attr("class", "Num Analysis 2" + res.rows.item(i).ExecuteUnitName).attr("status", "2").attr("unit", res.rows.item(i).ExecuteUnitName);
                    $("div[class='Num Analysis']").eq(0).attr("class", "Num Analysis 3" + res.rows.item(i).ExecuteUnitName).attr("status", "3").attr("unit", res.rows.item(i).ExecuteUnitName);
                    $("div[class='Num Analysis']").eq(0).attr("class", "Num Analysis 4" + res.rows.item(i).ExecuteUnitName).attr("status", "4").attr("unit", res.rows.item(i).ExecuteUnitName);
                    $("div[class='Num Analysis']").eq(0).attr("class", "Num Analysis 5" + res.rows.item(i).ExecuteUnitName).attr("status", "5").attr("unit", res.rows.item(i).ExecuteUnitName);

                    $("div[class='Analysis-c-gray00']").attr("class", "Analysis-c-gray00 donePRJ");
                }

                $("div[class~='Box-budget'], div[class~='Box-budget-all']").parent().off().on("click", function () {
                    var status = $(this).find("div").find("div").attr("status");
                    var unit = $(this).find("div").find("div").attr("unit");

                    $("div[class='Analysis-c-gray00 Prj'] > h2").html(unit);
                    getPCCPRJ(status);

                    $("#pageDetailAnalysis").hide();
                    $("#pageDetailPrj").show();
                });
                getExecuteUnitPCC(kind, amount);

            },
                function (e) {
                    console.log("ERROR: " + e.message);
                });
        }
    );
}

// 取得ExecuteUnitPCC資料
function getExecuteUnitPCC(kind, amount) {
    db_check();

    var where = "";
    var where2 = "where 1=1 ";
    if (sDate != "" && eDate != "") {
        where = "and cast((ProgYear || substr('000000000', 1, (2-length(ProgMonth))) || ProgMonth) as integer) >= " + sDate.substring(0, 5) + " and ";
        where += "cast((ProgYear || substr('000000000', 1, (2-length(ProgMonth))) || ProgMonth) as integer) <= " + eDate.substring(0, 5) + " ";
        where2 += "and ActualBidAwardDate >= " + sDate + " and ActualBidAwardDate <= " + eDate + " ";
    }

    if (kind != "") {
        if (kind != "other")
            where2 += "and ProjectKind='" + kind + "' ";
        else
            where2 += "and ProjectKind in ('',null,'null','非屬專案') ";
    }

    var sqlcmd = "select  ExecuteUnitName, count(ExecuteUnitName) cnt, ( ";
    sqlcmd += "select case    when ExecuteState in ('準備開工中', '施工中') Then 1 ";
    sqlcmd += "when ExecuteState in ('完工待驗收', '驗收中', '驗收完成', '保固中','已結案') Then 2 ";
    sqlcmd += "when ExecuteState in ('停工中') Then 3 ";
    sqlcmd += "when ExecuteState in ('未開工', '公告中', '審標中', '準備招標文件中', '設計中', '解約重新發包', '解約') Then 4 ";
    sqlcmd += "else 5 ";
    sqlcmd += "end ExecuteState ";
    sqlcmd += "from ENG_PCC_PROGRESS ";
    sqlcmd += "where ProjectNo=b.ProjectNo ";
    sqlcmd += where;
    sqlcmd += "order by ProgYear desc, ProgMonth desc limit 1 ";
    sqlcmd += ") ExecuteState ";
    sqlcmd += "from ENG_PCC_BASIC b " + where2 + " " + amount + " group by ExecuteUnitName ,ExecuteState order by ExecuteUnitName desc, cnt desc ";

    db.transaction(
        function (tx) {
            tx.executeSql(sqlcmd, [], function (tx2, res) {
                $("div[class^='Num Analysis 5']").html(0);
                for (var i = 0; i < res.rows.length; i++) {
                    var state = res.rows.item(i).ExecuteState;
                    if (state == undefined || state == "" || state == "5")
                        $("div[class='Num Analysis 5" + res.rows.item(i).ExecuteUnitName + "']").html(parseInt(res.rows.item(i).cnt) + parseInt($("div[class='Num Analysis 5" + res.rows.item(i).ExecuteUnitName + "']").html()));
                    else
                        $("div[class='Num Analysis " + state + "" + res.rows.item(i).ExecuteUnitName + "']").html(res.rows.item(i).cnt);
                }
            },
                function (e) {
                    console.log("ERROR: " + e.message);
                });
        }
    );
}

// 取得工程
function getPCCPRJ(status) {
    var unit = $("div[class='Analysis-c-gray00 Prj'] > h2").html();
    var kind = $("#selProKindPrj").val();
    var amount = parseInt($("#selProAmountPrj").val());
    var keyword = $("#searchPrj").val();

    for (var i = 1; i <= 4; i++) {
        $("#itemPrj-" + i).empty();
    }

    var where = "";
    var where2 = "where 1=1 ";
    if (sDate != "" && eDate != "") {
        where = "and cast((ProgYear || substr('000000000', 1, (2-length(ProgMonth))) || ProgMonth) as integer) >= " + sDate.substring(0, 5) + " and ";
        where += "cast((ProgYear || substr('000000000', 1, (2-length(ProgMonth))) || ProgMonth) as integer) <= " + eDate.substring(0, 5) + " ";
        where2 += "and ActualBidAwardDate >= " + sDate + " and ActualBidAwardDate <= " + eDate + " ";
    }

    where2 += "and ExecuteUnitName='" + unit + "' ";

    if (kind != "") {
        if (kind != "other")
            where2 += "and ProjectKind='" + kind + "' ";
        else
            where2 += "and ProjectKind in ('',null,'null','非屬專案') ";
    }

    switch (amount) {
        case 0:
            amount = "";
            break;
        case 1:
            amount = "and BidAwardAmount >= 200000 ";
            break;
        case 2:
            amount = "and BidAwardAmount >= 50000 and BidAwardAmount < 200000 ";
            break;
        case 3:
            amount = "and BidAwardAmount >= 10000 and BidAwardAmount < 50000 ";
            break;
        case 4:
            amount = "and BidAwardAmount >= 1000 and BidAwardAmount < 10000 ";
            break;
        case 5:
            amount = "and BidAwardAmount < 1000 ";
            break;
    }

    if (keyword != "")
        where2 += "and (ProjectName like '%" + keyword + "%' or Appealer like '%" + keyword + "%') ";

    db_check();
    var sqlcmd = "select    idx,( ";
    sqlcmd += "select case    when ExecuteState in ('準備開工中', '施工中') Then 1 ";
    sqlcmd += "when ExecuteState in ('完工待驗收', '驗收中', '驗收完成', '保固中','已結案') Then 2 ";
    sqlcmd += "when ExecuteState in ('停工中') Then 3 ";
    sqlcmd += "when ExecuteState in ('公告中', '審標中', '準備招標文件中', '設計中', '解約重新發包', '解約') Then 4 ";
    sqlcmd += "else 5 ";
    sqlcmd += "end ExecuteState ";
    sqlcmd += "from ENG_PCC_PROGRESS ";
    sqlcmd += "where ProjectNo=b.ProjectNo ";
    sqlcmd += where;
    sqlcmd += "order by ProgYear desc, ProgMonth desc limit 1 ";
    sqlcmd += ") ExecuteState, ";
    sqlcmd += "(select ActProgress from ENG_WEEKLY_PROGRESS where ENG_ID=b.ProjectNo order by Cycle desc limit 1 ";
    sqlcmd += " ) ActTotalProgress, ";
    sqlcmd += "(select ActProgress-PreProgress from ENG_WEEKLY_PROGRESS where ENG_ID=b.ProjectNo order by Cycle desc limit 1 ";
    sqlcmd += " ) NowProgress, ";
    sqlcmd += "ActualBidAwardDate, CountyTown, ProjectName, b.ProjectNo, BidAwardAmount, Appealer, PosX, PosY, HostUnitName, ContactName, ContactTele, MonitorUnitName, ContractedUnitName, AnnounceBudget, PeriodKind, TotalExecuteDays, WorkAddr, EngKind, ActualWorkDate, PreWorkDate, ActualFinishDate  ";
    sqlcmd += "from ENG_PCC_BASIC b " + where2 + " " + amount + " order by idx desc";

    db.transaction(
        function (tx) {
            tx.executeSql(sqlcmd, [], function (tx2, res) {
                for (var i = 0; i < res.rows.length; i++) {

                    var ExecuteState = res.rows.item(i).ExecuteState;
                    if (ExecuteState == null || ExecuteState == undefined || ExecuteState == "")
                        ExecuteState = 5
                    $("#itemPrj-" + ExecuteState).append(templatePrj);

                    var county = res.rows.item(i).CountyTown;
                    if (res.rows.item(i).CountyTown.length > 3)
                        county = res.rows.item(i).CountyTown.substring(3, 6);

                    var progress = res.rows.item(i).ActTotalProgress;
                    if (progress == null || progress == "null")
                        progress = "--";
                    else
                        progress = parseFloat(progress).toFixed(0) + "%";

                    var nowProgress = res.rows.item(i).NowProgress;
                    if (nowProgress == null || nowProgress == "null")
                        nowProgress = "--";
                    else {
                        if (nowProgress > 0)
                            nowProgress = "<font color='blue'>(進度超前" + parseFloat(nowProgress).toFixed(2) + "%)</font>";
                        else if (nowProgress < 0)
                            nowProgress = "<font color='red'>(進度落後" + parseFloat(nowProgress).toFixed(2) + "%)</font>";
                        else
                            nowProgress = "<font color='green'>(進度符合)</font>";
                    }

                    var BidAwardAmount = res.rows.item(i).BidAwardAmount;
                    if (BidAwardAmount == "null")
                        BidAwardAmount = "--";
                    else
                        BidAwardAmount = formatNumber(parseFloat(BidAwardAmount).toFixed(0));

                    if (parseFloat(res.rows.item(i).PosX) > 0 || parseFloat(res.rows.item(i).PosY) > 0) {
                        $("div[class='List PRJ'] > input").off().on("click", {
                            engID: res.rows.item(i).idx
                        }, function (e) {
                            e.stopPropagation();
                            $(".BottomNav > ul > li").eq(0).trigger("click");
                            go2Eng(e.data.engID);
                        })
                    } else {
                        $("div[class='List PRJ'] > input").hide();
                    }

                    $("div[class='List PRJ'] > label").html(String(res.rows.item(i).ActualBidAwardDate.substring(0, 3)) + "年度/" + county);
                    $("div[class='List PRJ'] > span").html(res.rows.item(i).ProjectName);
                    $("div[class='List PRJ'] > div > span").eq(0).html(progress);
                    $("div[class='List PRJ'] > div > font").eq(0).html(nowProgress);
                    $("div[class='List PRJ'] > div > span").eq(1).html(BidAwardAmount);
                    $("div[class='List PRJ']").off().on("click", {
                        ProjectNo: res.rows.item(i).ProjectNo,
                        ProjectName: res.rows.item(i).ProjectName,
                        HostUnitName: res.rows.item(i).HostUnitName,
                        ContactName: res.rows.item(i).ContactName,
                        ContactTele: res.rows.item(i).ContactTele,
                        MonitorUnitName: res.rows.item(i).MonitorUnitName,
                        ContractedUnitName: res.rows.item(i).ContractedUnitName,
                        AnnounceBudget: res.rows.item(i).AnnounceBudget,
                        BidAwardAmount: res.rows.item(i).BidAwardAmount,
                        PeriodKind: res.rows.item(i).PeriodKind,
                        TotalExecuteDays: res.rows.item(i).TotalExecuteDays,
                        WorkAddr: res.rows.item(i).WorkAddr,
                        EngKind: res.rows.item(i).EngKind,
                        ActualWorkDate: res.rows.item(i).ActualWorkDate,
                        PreWorkDate: res.rows.item(i).PreWorkDate,
                        ActualFinishDate: res.rows.item(i).ActualFinishDate
                    }, function (e) {
                        $("#pageDetailPrj").hide();
                        $("#pageDetail").show();
                        $("#detailBack").off().on("click", function () {
                            goBackAnalysis();
                        });

                        $("#pageDetail > p").html(chkValue(e.data.ProjectName));
                        $("div[class='DetailLine']").eq(0).find("span").eq(1).html(chkValue(e.data.ProjectNo));
                        $("div[class='DetailLine']").eq(1).find("span").eq(1).html(chkValue(e.data.HostUnitName));
                        $("div[class='DetailLine']").eq(2).find("span").eq(1).html(chkValue(e.data.ContactName));
                        $("div[class='DetailLine']").eq(3).find("span").eq(1).html(chkValue(e.data.ContactTele));
                        $("div[class='DetailLine']").eq(4).find("span").eq(1).html(chkValue(e.data.MonitorUnitName));
                        $("div[class='DetailLine']").eq(5).find("span").eq(1).html(chkValue(e.data.ContractedUnitName));
                        $("div[class='DetailLine']").eq(6).find("span").eq(1).html(chkValue(formatNumber(e.data.AnnounceBudget)) + "千元");
                        $("div[class='DetailLine']").eq(7).find("span").eq(1).html(chkValue(formatNumber(e.data.BidAwardAmount)) + "千元");
                        $("div[class='DetailLine']").eq(8).find("span").eq(1).html(chkValue(e.data.PeriodKind));
                        $("div[class='DetailLine']").eq(9).find("span").eq(1).html(chkValue(e.data.TotalExecuteDays));
                        $("div[class='DetailLine']").eq(10).find("span").eq(1).html(chkValue(e.data.WorkAddr));
                        $("div[class='DetailLine']").eq(11).find("span").eq(1).html(chkValue(e.data.EngKind));
                        $("div[class='DetailLine']").eq(12).find("span").eq(1).html(chkValue(e.data.ActualWorkDate));
                        $("div[class='DetailLine']").eq(13).find("span").eq(1).html(chkValue(e.data.PreWorkDate));
                        $("div[class='DetailLine']").eq(14).find("span").eq(1).html(chkValue(e.data.ActualFinishDate));


                    });
                    $("div[class='List PRJ']").attr("class", "List PRJ" + i);
                }

                $("label[class='Label-Num Prj']").eq(0).html("(" + $("#itemPrj-1 > div").length + ")");
                $("label[class='Label-Num Prj']").eq(1).html("(" + $("#itemPrj-2 > div").length + ")");
                $("label[class='Label-Num Prj']").eq(2).html("(" + $("#itemPrj-3 > div").length + ")");
                $("label[class='Label-Num Prj']").eq(3).html("(" + $("#itemPrj-4 > div").length + ")");
                $("label[class='Label-Num Prj']").eq(4).html("(" + $("#itemPrj-5 > div").length + ")");

                $("label[class='Label-Num Prj']").eq(status - 1).parent().trigger("click");

            },
                function (e) {
                    console.log("ERROR: " + e.message);
                });
        }
    );
}

// 西元轉民國
function yyyy2yyy(date) {
    if (date != "null" && date != "") {
        date = parseInt(date.substring(0, 4)) - 1911 + date.substring(4);
    }

    return date;
}

// 取得當下日期
function getCurrentDate() {
    var myDate = new Date();
    return (myDate.getFullYear() - 1911) + "" + parseInt(myDate.getMonth() + 1).pad(2) + "" + parseInt(myDate.getDate()).pad(2);
}

// 返回轉場
function goBack() {
    $("#pageDetail").hide();
    $("#pageDetailB").hide();
    $("#pageMain").show();
}

// 返回轉場
function goBackAnalysis() {
    $("#pageDetail").hide();
    $("#pageDetailPrj").show();
}

// 返回轉場
function goBackMainAnalysis() {
    $("#pageMainAnalysis").show();
    $("#pageDetailAnalysis").hide();
}

// 返回轉場
function goBackMainAnalysisDetail() {
    $("#pageDetailPrj").hide();
    $("#pageDetailAnalysis").show();
}

// App初始化
app.initialize();
$(function () {
    db_check(); // path in 
    // setLayout(); // 版面初始化
    // bindEvent(); // 綁定事件
  
    // getData(); // 從service取得資料
})