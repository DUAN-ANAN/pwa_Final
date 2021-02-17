var debugMsg = false; // enable debug msg or not
(function () {
    var SpatialiteFactory, SpatialitePlugin, SpatialitePluginTransaction;
    root = this; // this = windows
    
    SpatialitePlugin = function (path) {  // path , callback
        console.log("SpatialitePlugin");
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.responseType = 'arraybuffer';
        
        xhr.onload = e => { //  確定資料有回傳，執行？
            alert('xhr.onload');
            var uInt8Array = new Uint8Array(xhr.response);
            dbInstance = null;  // dbInstance：因為不用讓每次query的時候都開一次資料庫 ( 節省效能 ) ==> db_check()
            dbInstance = new SQL.Database(uInt8Array);
            //
            // getData(); // 從service取得資料
            app.onDeviceReady();

        };      
        xhr.send();
    };
    
    SpatialitePlugin.prototype.transaction = function (fn, error, success) {
        var t;
        t = new SpatialitePluginTransaction();
        fn(t);
    };

    SpatialitePluginTransaction = function () {
    };

    SpatialitePluginTransaction.prototype.executeSql = function (sql, values, success, error) {
        console.log(sql);
        var res, txself, items;
        res = void 0;
        txself = void 0;
        txself = this; 
        items = [];
       
        items = dbInstance.exec(sql);  // sql.js[line:109793]：已更改回傳物件型式。
    
        res = {
            rows: {
                item: function (i) {
                    return items[i];
                },
                length: items.length
            }
        };
        console.log(items);
        return success(txself, res);
    };

    SpatialiteFactory = {
        opendb: function (path) { // callback
            return new SpatialitePlugin(path); // path from include.js 
        }
    };

    return root.SpatialitePlugin = {
        openDatabase: SpatialiteFactory.opendb
    };
})();
