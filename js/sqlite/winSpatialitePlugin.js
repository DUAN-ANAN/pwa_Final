var needDot = "";

function chkSpecifiedOS() {
    ///<summary>取得檔案系統成功</summary>
    var userAgent="";
	if((navigator.userAgent.match(/(Android|android)/g)))
		userAgent = "Android";
	else if((navigator.userAgent.match(/(iPad|iPhone|iPod)/g)))
		userAgent = "iOS";
	else if((navigator.userAgent.match(/(MSApp)/g)))
		userAgent = "Windows";
	
    switch (userAgent) {
        case "iOS":
            needDot = "";
            break;
        case "Android":
            needDot = "";
            break;
        case "Windows":
            needDot = ".";
            break;
        default:
    }
}

(function () {
    var SpatialiteFactory, SpatialitePlugin, SpatialitePluginCallback, SpatialitePluginTransaction, SpatialitePluginTransactionCB, get_unique_id, pcb, root, transaction_callback_queue, transaction_queue, sqliteConn=null;
    root = this;
    SpatialitePlugin = function (openargs, connAsync, openSuccess, openError) {
        var dbname;
        console.log("SpatialitePlugin");
        if (!(openargs && openargs['name'])) {
            throw new Error("Cannot create a SpatialitePlugin instance without a db name");
        }
        chkSpecifiedOS();
        dbname = needDot + openargs.name;
        this.openargs = openargs;
        this.dbname = dbname;
        this.connAsync = connAsync;
        this.openSuccess = openSuccess;
        this.openError = openError;
        this.openSuccess || (this.openSuccess = function () {
            return console.log("DB opened: " + dbname);
        });
        this.openError || (this.openError = function (e) {
            return console.log(e.message);
        });
        this.open(this.connAsync, this.openSuccess, this.openError);
    };

    SpatialitePlugin.prototype.openDBs = {};

    SpatialitePlugin.prototype.transaction = function (fn, error, success) {
        var t;
        t = new SpatialitePluginTransaction(this.dbname);
        fn(t);
        t.complete(success, error);
    };

    SpatialitePlugin.prototype.open = function (connAsync, success, error) {
        console.log("SpatialitePlugin.prototype.open");
        if (!(this.dbname in this.openDBs)) {
            this.openDBs[this.dbname] = true;
            //cordova.exec(success, error, "SpatialitePlugin", "open", [this.openargs]);
            if (sqliteConn==null)
                sqliteConn = connAsync ? new SqliteConn.createSqliteConnAsync() : new SqliteConn.createSqliteConn();
            sqliteConn.openDatabase(this.dbname);
        }
    };

    SpatialitePlugin.prototype.close = function (success, error) {
        console.log("SpatialitePlugin.prototype.close");
        if (this.dbname in this.openDBs) {
            delete this.openDBs[this.dbname];
            cordova.exec(null, null, "SpatialitePlugin", "close", [this.dbname]);
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
        console.log("SpatialitePluginTransaction SpatialitePlugin !!!!!!!");
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
                if (transaction_queue[transId].length === 1) {
                    transaction_queue[transId] = [];
                } else {
                    // transaction_queue[transId].splice(x, 1); // marked by Aa // splice is not good in loop for retrieving
                    // remove element
                    transaction_queue[transId][x] = [];
                }
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
        /// <summary>Execute Sql</summary>
        /// <param name="sql">sql command</param>
        /// <param name="values">JSON query parameters</param>
        /// <param name="success">success callback</param>
        /// <param name="error">error callback</param>
        /// <returns >None</returns>

        var errorcb, successcb, txself;
        console.log("SpatialitePluginTransaction.prototype.executeSql");
        errorcb = void 0;
        successcb = void 0;
        txself = void 0;
        txself = this;
        successcb = null;
        if (success) {
            console.log("success not null:" + sql);
            successcb = function (execres) {
                var res, saveres;
                //console.log("executeSql callback:" + JSON.stringify(execres));
                res = void 0;
                saveres = void 0;
                saveres = JSON.parse(execres);
                res =
                {
                    rows:
                    {
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
            console.log("success NULL:" + sql);
        }
        errorcb = null;
        if (error) {
            errorcb = function (res) {
                return error(txself, res);
            };
        }
        console.log("executeSql - add_to_transaction" + sql);
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
            // removed optimization code
            this.__completed = true;
            if (success) return success(txself);
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
        // for friendly check dbname
        var dbnmaeStr = { "dbname": this.dbname };
        if (transaction_queue[this.trans_id].length > 0) {

            if (sqliteConn instanceof SqliteConn.createSqliteConnAsync) {
                for (var i = 0; i < transaction_queue[this.trans_id].length; i++) {
                    var trans_id_inner = this.trans_id;
                    // using async
                    sqliteConn.executeSqlBatch(JSON.stringify([dbnmaeStr, transaction_queue[this.trans_id][i]]), i)
                    .then(function (result) {
                        window.SpatialitePluginTransactionCB.queryCompleteCallback(trans_id_inner, transaction_queue[trans_id_inner][result[1]].query_id, result[0]);
                    })
                    .done(function (result) {
                        // remove all elements Async mode by Aa
                        // transaction_queue[trans_id_inner] = [];
                        // transaction_queue[trans_id_inner] = null;
                    });
                }
            }
            else {
                for (var i = 0; i < transaction_queue[this.trans_id].length; i++) {
                    //try
                    //{
                        var result = sqliteConn.executeSqlBatch(JSON.stringify([dbnmaeStr, transaction_queue[this.trans_id][i]]));
                        window.SpatialitePluginTransactionCB.queryCompleteCallback(this.trans_id, transaction_queue[this.trans_id][i].query_id, result);
                        window.SpatialitePluginTransactionCB.txCompleteCallback(this.trans_id); // this line is workaround, may fixed by Aa 20131113
                   // }
                    //catch (e)
                    //{
                   //     window.SpatialitePluginTransactionCB.queryErrorCallback(this.trans_id, transaction_queue[this.trans_id][i].query_id, "");
                   //     window.SpatialitePluginTransactionCB.txErrorCallback(this.trans_id,e); // this line is workaround, may fixed by Aa 20131113
                   //     console.log(e);
                   // }
                }

                // remove all elements sync mode by Aa
                transaction_queue[this.trans_id] = [];
                transaction_queue[this.trans_id] = null;
            }
        }
    };

    SpatialiteFactory = {
        opendb: function () {
            var errorcb, first, okcb, openargs, connAsync;

            if (arguments.length < 1) return null;
            first = arguments[0];
            openargs = null;
            okcb = null;
            errorcb = null;
            connAsync = false;
            if (first.constructor === String) {
                openargs = {
                    name: first
                };

                if (arguments.length >= 5) {
                    connAsync = arguments[4]; // add sync or async connection by Aa
                    if (arguments.length > 5)
                        okcb = arguments[5];
                    if (arguments.length > 6)
                        errorcb = arguments[6];
                }


            } else {
                openargs = first;
                if (arguments.length >= 2) {
                    okcb = arguments[1];
                    if (arguments.length > 2) errorcb = arguments[2];
                }
            }
            return new SpatialitePlugin(openargs, connAsync, okcb, errorcb);
        }
    };
    root.SpatialitePluginCallback = SpatialitePluginCallback;
    root.SpatialitePluginTransactionCB = SpatialitePluginTransactionCB;
    return root.SpatialitePlugin = {
        openDatabase: SpatialiteFactory.opendb
    };
})();