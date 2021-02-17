var callBK;

function updateENG_PCC_BASIC() {
    doAjax("getENG_PCC_BASIC", {}, getENG_PCC_BASIC);
}

function getENG_PCC_BASIC(msg) {
    db_check();
    db.transaction(
                   function (tx) {
                   var data = msg["getENG_PCC_BASIC"];
                   
                   sqlcmd = "delete from ENG_PCC_BASIC";
                   tx.executeSql(sqlcmd);
                   for (var i = 0; i < data.length; i++) {
                   sqlcmd = "insert into ENG_PCC_BASIC(idx, ActualBidAwardDate, CountyTown, ProjectName, ProjectKind, ExecuteUnitName, ProjectNo, BidAwardAmount, Appealer, PosX, PosY, HostUnitName, ContactName, ContactTele, MonitorUnitName, ContractedUnitName, AnnounceBudget, BidAwardAmount, PeriodKind, TotalExecuteDays, WorkAddr, EngKind, ActualWorkDate, PreWorkDate, ActualFinishDate) values('" + chkWords(data[i]["idx"]) + "','" + chkWords(data[i]["ActualBidAwardDate"]) + "','" + chkWords(data[i]["CountyTown"]) + "','" + chkWords(data[i]["ProjectName"]) +"','" + chkWords(data[i]["ProjectKind"]) + "','" + chkWords(data[i]["ExecuteUnitName"]) + "','" + chkWords(data[i]["ProjectNo"]) + "','" + chkWords(data[i]["BidAwardAmount"]) + "','" + chkWords(data[i]["Appealer"]) + "','" + chkWords(data[i]["PosX"]) + "','" + chkWords(data[i]["PosY"]) + "','" + chkWords(data[i]["HostUnitName"]) + "','" + chkWords(data[i]["ContactName"]) + "','" + chkWords(data[i]["ContactTele"]) + "','" + chkWords(data[i]["MonitorUnitName"]) + "','" + chkWords(data[i]["ContractedUnitName"]) + "','" + chkWords(data[i]["AnnounceBudget"]) + "','" + chkWords(data[i]["BidAwardAmount"]) + "','" + chkWords(data[i]["PeriodKind"]) + "','" + chkWords(data[i]["TotalExecuteDays"]) + "','" + chkWords(data[i]["WorkAddr"]) + "','" + chkWords(data[i]["EngKind"]) + "','" + chkWords(data[i]["ActualWorkDate"]) + "','" + chkWords(data[i]["PreWorkDate"]) + "','" + chkWords(data[i]["ActualFinishDate"]) + "')";
                   //console.log(sqlcmd);
                   tx.executeSql(sqlcmd);
                   }
                   updateCASE_HEADER();
                   },
                   function (e) {
                   console.log("ERROR: " + e.message);
                   },
                   function (e) {
                   console.log("PCC Updated ");
                   
                   }
                   );
}

function updateCASE_HEADER() {
    doAjax("getCASE_HEADER", {}, getCASE_HEADER);
}

function getCASE_HEADER(msg) {
    db_check();
    db.transaction(
                   function (tx) {
                   var data = msg["getCASE_HEADER"];
                   
                   sqlcmd = "delete from CASE_HEADER";
                   tx.executeSql(sqlcmd);
                   for (var i = 0; i < data.length; i++) {
                       sqlcmd = "insert into CASE_HEADER(CASE_ID, CASE_YEAR, CASE_MONTH, CASE_NO, CASE_SOURCE, CASE_APPLY_USER, CASE_CONTENT, CASE_APPLY_DATE, CASE_PRE_CLOSE_DATE, CASE_CLOSE_DATE, CASE_WORK_AREA, CASE_POS_X, CASE_POS_Y, CASE_CONTRACT_NO, IS_VALID) values('" + chkWords(data[i]["CASE_ID"]) + "','" + chkWords(data[i]["CASE_YEAR"]) + "','" + chkWords(data[i]["CASE_MONTH"]) + "','" + chkWords(data[i]["CASE_NO"]) + "','" + chkWords(data[i]["CASE_SOURCE"]) + "','" + chkWords(data[i]["CASE_APPLY_USER"]) + "','" + chkWords(data[i]["CASE_CONTENT"]) + "','" + chkWords(data[i]["CASE_APPLY_DATE"]) + "','" + chkWords(data[i]["CASE_PRE_CLOSE_DATE"]) + "','" + chkWords(data[i]["CASE_CLOSE_DATE"]) + "','" + chkWords(data[i]["CASE_WORK_AREA"]) + "','" + chkWords(data[i]["CASE_POS_X"]) + "','" + chkWords(data[i]["CASE_POS_Y"]) + "','" + chkWords(data[i]["CASE_CONTRACT_NO"]) + "','" + chkWords(data[i]["IS_VALID"]) + "')";
                   //console.log(sqlcmd);
                   tx.executeSql(sqlcmd);
                   }
                   updateENG_PCC_PROGRESS();
                   },
                   function (e) {
                   console.log("ERROR: " + e.message);
                   },
                   function (e) {
                   console.log("CASE_HEADER Updated ");
                   
                   }
                   );
}

function updateENG_PCC_PROGRESS() {
    doAjax("getENG_PCC_PROGRESS", {}, getENG_PCC_PROGRESS);
}

function getENG_PCC_PROGRESS(msg) {
    db_check();
    db.transaction(
                   function (tx) {
                   var data = msg["getENG_PCC_PROGRESS"];
                   
                   sqlcmd = "delete from ENG_PCC_PROGRESS";
                   tx.executeSql(sqlcmd);
                   for (var i = 0; i < data.length; i++) {
                   sqlcmd = "insert into ENG_PCC_PROGRESS(ProjectNo, ProgYear, ProgMonth, PreTotalProgress, ActTotalProgress, PreTotalAmount, ActTotalAmount, PreYearProgress, ActYearProgress, PreYearAmount, ActYearAmount, TotalEstimationAmount, EstimationReserveAmount, ExecuteState, ActExecuteAbstract, DelayPaymentReason, NotPaymentAmount, DelayReason, DelayAnalysis, DelaySolution, IS_VALID) values('" + chkWords(data[i]["ProjectNo"]) + "','" + chkWords(data[i]["ProgYear"]) + "','" + chkWords(data[i]["ProgMonth"]) + "','" + chkWords(data[i]["PreTotalProgress"]) + "','" + chkWords(data[i]["ActTotalProgress"]) + "','" + chkWords(data[i]["PreTotalAmount"]) + "','" + chkWords(data[i]["ActTotalAmount"]) + "','" + chkWords(data[i]["PreYearProgress"]) + "','" + chkWords(data[i]["ActYearProgress"]) + "','" + chkWords(data[i]["PreYearAmount"]) + "','" + chkWords(data[i]["ActYearAmount"]) + "','" + chkWords(data[i]["TotalEstimationAmount"]) + "','" + chkWords(data[i]["EstimationReserveAmount"]) + "','" + chkWords(data[i]["ExecuteState"]) + "','" + chkWords(data[i]["ActExecuteAbstract"]) + "','" + chkWords(data[i]["DelayPaymentReason"]) + "','" + chkWords(data[i]["NotPaymentAmount"]) + "','" + chkWords(data[i]["DelayReason"]) + "','" + chkWords(data[i]["DelayAnalysis"]) + "','" + chkWords(data[i]["DelaySolution"]) + "','" + chkWords(data[i]["IS_VALID"]) + "')";
                   //console.log(sqlcmd);
                   tx.executeSql(sqlcmd);
                   }
                   updateCASE_PROCESS();
                   },
                   function (e) {
                   console.log("ERROR: " + e.message);
                   },
                   function (e) {
                   console.log("ENG_PCC_PROGRESS Updated ");
                   
                   }
                   );
}

function updateCASE_PROCESS() {
    doAjax("getCASE_PROCESS", {}, getCASE_PROCESS);
}

function getCASE_PROCESS(msg) {
    db_check();
    db.transaction(
                   function (tx) {
                   var data = msg["getCASE_PROCESS"];
                   
                   sqlcmd = "delete from CASE_PROCESS";
                   tx.executeSql(sqlcmd);
                   for (var i = 0; i < data.length; i++) {
                   sqlcmd = "insert into CASE_PROCESS(CASE_ID, PROC_ID, PROC_DATE, PROC_CONTENT, IS_VALID, CREATE_TIME, CREATE_USER, UPDATE_TIME, UPDATE_USER) values('" + chkWords(data[i]["CASE_ID"]) + "', '" + chkWords(data[i]["PROC_ID"]) + "', '" + chkWords(data[i]["PROC_DATE"]) + "', '" + chkWords(data[i]["PROC_CONTENT"]) + "', '" + chkWords(data[i]["IS_VALID"]) + "', '" + chkWords(data[i]["CREATE_TIME"]) + "', '" + chkWords(data[i]["CREATE_USER"]) + "', '" + chkWords(data[i]["UPDATE_TIME"]) + "', '" + chkWords(data[i]["UPDATE_USER"]) + "')";
                   //console.log(sqlcmd);
                   tx.executeSql(sqlcmd);
                   }
                   updateENG_WEEKLY_PROGRESS();
                   },
                   function (e) {
                   console.log("ERROR: " + e.message);
                   },
                   function (e) {
                   console.log("CASE_PROCESS Updated ");
                   
                   }
                   );
}

function updateENG_WEEKLY_PROGRESS() {
    doAjax("getENG_WEEKLY_PROGRESS", {}, getENG_WEEKLY_PROGRESS);
}

function getENG_WEEKLY_PROGRESS(msg) {
    db_check();
    db.transaction(
                   function (tx) {
                   var data = msg["getENG_WEEKLY_PROGRESS"];
                   
                   sqlcmd = "delete from ENG_WEEKLY_PROGRESS";
                   tx.executeSql(sqlcmd);
                   for (var i = 0; i < data.length; i++) {
                   sqlcmd = "insert into ENG_WEEKLY_PROGRESS(ENG_ID, Cycle, StartDate, EndDate, PreProgress, ActProgress, ReturnState, ReturnTime, IS_VALID) values('" + chkWords(data[i]["ENG_ID"]) + "', '" + chkWords(data[i]["Cycle"]) + "', '" + chkWords(data[i]["StartDate"]) + "', '" + chkWords(data[i]["EndDate"]) + "', '" + chkWords(data[i]["PreProgress"]) + "', '" + chkWords(data[i]["ActProgress"]) + "', '" + chkWords(data[i]["ReturnState"]) + "', '" + chkWords(data[i]["ReturnTime"]) + "', '" + chkWords(data[i]["IS_VALID"]) + "')";
                   //console.log(sqlcmd);
                   tx.executeSql(sqlcmd);
                   }
                   updateENG_REL_FILE();
                   },
                   function (e) {
                   console.log("ERROR: " + e.message);
                   },
                   function (e) {
                   console.log("ENG_WEEKLY_PROGRESS Updated ");
                   
                   }
                   );
}

function updateENG_REL_FILE() {
    doAjax("getENG_REL_FILE", {}, getENG_REL_FILE);
}

function getENG_REL_FILE(msg) {
    db_check();
    db.transaction(
                   function (tx) {
                   var data = msg["getENG_REL_FILE"];
                   
                   sqlcmd = "delete from ENG_REL_FILE";
                   tx.executeSql(sqlcmd);
                   for (var i = 0; i < data.length; i++) {
                   sqlcmd = "insert into ENG_REL_FILE(ENG_ID, IDX, FILE_KIND, FILE_PATH, FILE_COMMENT) values('" + chkWords(data[i]["ENG_ID"]) + "', '" + chkWords(data[i]["IDX"]) + "', '" + chkWords(data[i]["FILE_KIND"]) + "', '" + chkWords(data[i]["FILE_PATH"]) + "', '" + chkWords(data[i]["FILE_COMMENT"]) + "')";
                   //console.log(sqlcmd);
                   tx.executeSql(sqlcmd);
                   }
                   callBK();
                   
                   },
                   function (e) {
                   console.log("ERROR: " + e.message);
                   },
                   function (e) {
                   console.log("ENG_REL_FILE Updated ");
                   
                   }
                   );
}
