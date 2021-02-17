var debugMsg = false; // enable debug msg or not
(function () {
    var SpatialiteFactory, SpatialitePlugin, SpatialitePluginTransaction;
    root = this;
    SpatialitePlugin = function (path) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = e => {
            alert(5);
            var uInt8Array = new Uint8Array(xhr.response);
            dbInstance = null;
            dbInstance = new SQL.Database(uInt8Array);
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
        
        var contents = dbInstance.exec(sql);
        
        for (var x = 0; contents.length && x < contents[0].columns.length; x++)
        {
            for(var y = 0; y < contents[0].values.length; y++)
            {
                if (items[y] == undefined)
                    items[y] = {};

                items[y][contents[0].columns[x]] = contents[0].values[y][x];
            }
        }
        
        res = {
            rows: {
                item: function (i) {
                    return items[i];
                },
                length: items.length
            }
        };
        return success(txself, res);
    };

    SpatialiteFactory = {
        opendb: function (path) {
            return new SpatialitePlugin(path);
        }
    };

    return root.SpatialitePlugin = {
        openDatabase: SpatialiteFactory.opendb
    };
})();
