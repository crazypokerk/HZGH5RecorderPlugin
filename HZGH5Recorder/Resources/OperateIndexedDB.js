class IndexedDBInstance {
    #DBName;
    #DBVersion;
    DBStatus;

    constructor(dbName, dbVersion) {
        this.#DBName = dbName;
        this.#DBVersion = dbVersion;
        this.DBStatus = false;
    }

    async initLocalForage() {
        localforage.config({
            driver: [localforage.INDEXEDDB],
            name: this.#DBName,
            storeName: 'RecordBlobs',
            version: this.#DBVersion,
            description: 'For store blobs'
        });
        if (!localforage.supports(localforage.INDEXEDDB)) {
            throw new Error('当前浏览器不支持 IndexedDB，无法创建存储对象');
        }
        await localforage.ready().then(() => {
            // 数据库已经准备好
            this.DBStatus = true;
        }).catch(function (err) {
            throw new Error('IndexedDB初始化异常！');
        });
    }

    async setItemInDB(key, blobs) {
        if (!this.DBStatus) {
            throw new Error('IndexedDB未初始化！');
        }
        let keyID = nanoid(10);
        try {
            await localforage.setItem(keyID, [Date.now(), blobs]);
            return keyID;
        } catch (e) {
            throw new Error(`IndexedDB [添加]异常:${e}`);
        }
    }

    async getItemFromDB(key, successCallback) {
        if (!this.DBStatus) {
            throw new Error('IndexedDB未初始化！');
        }
        try {
            let data = await localforage.getItem(key);
            successCallback(data);
        } catch (e) {
            throw new Error(`IndexedDB [获取]异常:${e}`);
        }
    }

    async removeItemFromDB(key) {
        if (!this.DBStatus) {
            throw new Error('IndexedDB未初始化！');
        }
        try {
            await localforage.removeItem(key);
        } catch (e) {
            throw new Error(`IndexedDB [删除]异常:${e}`);
        }
    }

    async clearDB(days) {
        if (!this.DBStatus) {
            throw new Error('IndexedDB未初始化！');
        }

        try {
            await localforage.clear();
        } catch (e) {
            throw new Error(`IndexedDB [清空]异常:${e}`);
        }
    }
}