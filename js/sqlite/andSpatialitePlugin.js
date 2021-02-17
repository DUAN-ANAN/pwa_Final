var debugMsg = false; // enable debug msg or not
(function () {
    var SpatialiteFactory, SpatialitePlugin, SpatialitePluginCallback, SpatialitePluginTransaction, SpatialitePluginTransactionCB, get_unique_id, pcb, root, transaction_callback_queue, transaction_queue;
    root = this;
    SpatialitePlugin = function (openargs, openSuccess, openError) {
        var dbname;
        console.log("SpatialitePlugin");
        if (!(openargs && openargs['name'])) {
            throw new Error("Cannot create a SpatialitePlugin instance without a db name");
        }
        dbname = openargs.name;
        console.log("dbname : " + dbname);
        this.openargs = openargs;
        this.dbname = dbname;
        this.openSuccess = openSuccess;
        this.openError = openError;
        this.openSuccess || (this.openSuccess = function () {
            return console.log("DB opened: " + dbname);
        });
        this.openError || (this.openError = function (e) {
            return console.log(e.message);
        });
        this.open(this.openSuccess, this.openError);
    };
    SpatialitePlugin.prototype.openDBs = {};
    SpatialitePlugin.prototype.transaction = function (fn, error, success) {
        var t;
        t = new SpatialitePluginTransaction(this.dbname);
        fn(t);
        t.complete(success, error);
    };
    SpatialitePlugin.prototype.open = function (success, error) {
        console.log("SpatialitePlugin.prototype.open");
        if (!(this.dbname in this.openDBs)) {
            this.openDBs[this.dbname] = true;
            cordova.exec(success, error, "SpatialitePlugin", "open", [this.openargs]);
        }
    };
    SpatialitePlugin.prototype.close = function (success, error) {
        console.log("SpatialitePlugin.prototype.close");
        if (this.dbname in this.openDBs) {
            delete this.openDBs[this.dbname];
            cordova.exec(null, null, "SpatialitePlugin", "close", [this.dbname]);
        }
    };
    pcb = function () {
        return 1;
    };
    SpatialitePlugin.prototype.executePragmaStatement = function (statement, success, error) {
        console.log("SpatialitePlugin::executePragmaStatement");
        pcb = success;
        cordova.exec((function () {
            return 1;
        }), error, "SpatialitePlugin", "executePragmaStatement", [this.dbname, statement]);
    };
    SpatialitePluginCallback = {
        p1: function (id, result) {
            var mycb;
            console.log("PRAGMA CB");
            mycb = pcb;
            pcb = function () {
                return 1;
            };
            mycb(result);
        }
    };
    get_unique_id = function () {
        var id, id2;
        id = new Date().getTime();
        id2 = new Date().getTime();
        while (id === id2) {
            id2 = new Date().getTime();
        }
        return id2 + "000";
    };
    transaction_queue = [];
    transaction_callback_queue = {};
    SpatialitePluginTransaction = function (dbname) {
        this.dbname = dbname;
        this.executes = [];
        this.trans_id = get_unique_id();
        this.__completed = false;
        this.__submitted = false;
        this.optimization_no_nested_callbacks = false;
        console.log("SpatialitePluginTransaction - this.trans_id:" + this.trans_id);
        transaction_queue[this.trans_id] = [];
        transaction_callback_queue[this.trans_id] = new Object();
    };
    SpatialitePluginTransactionCB = {};
    SpatialitePluginTransactionCB.queryCompleteCallback = function (transId, queryId, result) {
        var query, x;
        console.log("SpatialitePluginTransaction.queryCompleteCallback");
        query = null;
        for (x in transaction_queue[transId]) {
            if (transaction_queue[transId][x]["query_id"] === queryId) {
                query = transaction_queue[transId][x];
                //alert("queryCompleteCallback:"+transId+":before:"+transaction_queue[transId].length);
                if (transaction_queue[transId].length === 1) {
                    transaction_queue[transId] = [];
                } else {
                    transaction_queue[transId].splice(x, 1);
                }
                //alert("queryCompleteCallback:"+transId+":after:"+transaction_queue[transId].length);
                break;
            }
        }
        if (query && query["callback"]) return query["callback"](result);
    };
    SpatialitePluginTransactionCB.queryErrorCallback = function (transId, queryId, result) {
        var query, x;
        query = null;
        for (x in transaction_queue[transId]) {
            if (transaction_queue[transId][x]["query_id"] === queryId) {
                query = transaction_queue[transId][x];
                if (transaction_queue[transId].length === 1) {
                    transaction_queue[transId] = [];
                } else {
                    transaction_queue[transId].splice(x, 1);
                }
                break;
            }
        }
        if (query && query["err_callback"]) return query["err_callback"](result);
    };
    SpatialitePluginTransactionCB.txCompleteCallback = function (transId) {
        if (typeof transId !== "undefined") {
            if (transId && transaction_callback_queue[transId] && transaction_callback_queue[transId]["success"]) {
                /* 20141022 fixed by Aa for continuous query begin*/
                //alert("txCompleteCallback:"+transId+":"+transaction_queue[transId].length);
                for (var i = 0; i < transaction_queue[transId].length; i++) {
                    //alert(JSON.stringify(['/KMDB/km.db3', [transaction_queue[transId][i]]]));
                    //cordova.exec(null, null, "SpatialitePlugin", "executeSqlBatch", ['/ChiayiDB/db.sqlite', [transaction_queue[transId][i]]]);
                }
                /* 20141022 fixed by Aa for continuous query end*/
                return transaction_callback_queue[transId]["success"]();
            }
        } else {
            return console.log("SpatialitePluginTransaction.txCompleteCallback---transId = NULL");
        }
    };
    SpatialitePluginTransactionCB.txErrorCallback = function (transId, error) {
        if (typeof transId !== "undefined") {
            console.log("SpatialitePluginTransaction.txErrorCallback---transId:" + transId);
            if (transId && transaction_callback_queue[transId]["error"]) {
                transaction_callback_queue[transId]["error"](error);
            }
            delete transaction_queue[transId];
            return delete transaction_callback_queue[transId];
        } else {
            return console.log("SpatialitePluginTransaction.txErrorCallback---transId = NULL");
        }
    };
    SpatialitePluginTransaction.prototype.add_to_transaction = function (trans_id, query, params, callback, err_callback) {
        var new_query;
        new_query = new Object();
        new_query["trans_id"] = trans_id;
        if (callback || !this.optimization_no_nested_callbacks) {
            new_query["query_id"] = get_unique_id();
        } else {
            if (this.optimization_no_nested_callbacks) new_query["query_id"] = "";
        }
        new_query["query"] = query;
        if (params) {
            new_query["params"] = params;
        } else {
            new_query["params"] = [];
        }
        new_query["callback"] = callback;
        new_query["err_callback"] = err_callback;
        if (!transaction_queue[trans_id]) transaction_queue[trans_id] = [];
        transaction_queue[trans_id].push(new_query);
    };
    SpatialitePluginTransaction.prototype.executeSql = function (sql, values, success, error) {
        var errorcb, successcb, txself;
        if (debugMsg) console.log("SpatialitePluginTransaction.prototype.executeSql");
        errorcb = void 0;
        successcb = void 0;
        txself = void 0;
        txself = this;
        successcb = null;
        if (success) {
            if(debugMsg) console.log("success not null:" + sql);
            successcb = function (execres) {
                var res, saveres;
                if(debugMsg) console.log("executeSql callback:" + JSON.stringify(execres));
                res = void 0;
                saveres = void 0;
                saveres = execres;
                res = {
                    rows: {
                        item: function (i) {
                            return saveres[i];
                        },
                        length: saveres.length
                    },
                    rowsAffected: saveres.rowsAffected,
                    insertId: saveres.insertId || null
                };
                return success(txself, res);
            };
        } else {
            if (debugMsg) console.log("success NULL:" + sql);
        }
        errorcb = null;
        if (error) {
            errorcb = function (res) {
                return error(txself, res);
            };
        }
        if(debugMsg) console.log("executeSql - add_to_transaction" + sql);
        this.add_to_transaction(this.trans_id, sql, values, successcb, errorcb);
    };
    SpatialitePluginTransaction.prototype.complete = function (success, error) {
        var errorcb, successcb, txself;
        console.log("SpatialitePluginTransaction.prototype.complete");
        if (this.__completed) throw new Error("Transaction already run");
        if (this.__submitted) throw new Error("Transaction already submitted");
        this.__submitted = true;
        txself = this;
        successcb = function () {
        //這段主要是做最佳化計算，如果添加這段會造成有的時候最佳化計算需要跑10幾秒。因此拿掉它 20130221 by orange
//            if (transaction_queue[txself.trans_id].length > 0 && !txself.optimization_no_nested_callbacks) {
//                txself.__submitted = false;
//                return txself.complete(success, error);
//            } else {
                this.__completed = true;
                if (success) return success(txself);
          //  }
        };
        errorcb = function (res) {
            return null;
        };
        if (error) {
            errorcb = function (res) {
                return error(txself, res);
            };
        }
        transaction_callback_queue[this.trans_id]["success"] = successcb;
        transaction_callback_queue[this.trans_id]["error"] = errorcb;
        cordova.exec(null, null, "SpatialitePlugin", "executeSqlBatch", [this.dbname, transaction_queue[this.trans_id]]);
    };
    SpatialiteFactory = {
        opendb: function () {
            var errorcb, first, okcb, openargs;
            if (arguments.length < 1) return null;
            first = arguments[0];
            openargs = null;
            okcb = null;
            errorcb = null;
            if (first.constructor === String) {
                openargs = {
                    name: first
                };
                if (arguments.length >= 5) {
                    okcb = arguments[4];
                    if (arguments.length > 5) errorcb = arguments[5];
                }
            } else {
                openargs = first;
                if (arguments.length >= 2) {
                    okcb = arguments[1];
                    if (arguments.length > 2) errorcb = arguments[2];
                }
            }
            return new SpatialitePlugin(openargs, okcb, errorcb);
        }
    };
    root.SpatialitePluginCallback = SpatialitePluginCallback;
    root.SpatialitePluginTransactionCB = SpatialitePluginTransactionCB;
    return root.SpatialitePlugin = {
        openDatabase: SpatialiteFactory.opendb
    };
})();
