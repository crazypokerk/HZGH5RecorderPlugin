class IndexedDBInstance {
    DBName;
    DBVersion;

    constructor(dbName, dbVersion) {
        if (!window.indexedDB) {
            console.warn('当前浏览器不支持IndexedDB');
            // 可降级使用 localStorage（注意有容量限制）
        }
        this.DBName = dbName;
        this.DBVersion = dbVersion;
        this.db = null;
    }
    
    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, dbVersion);

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                // 创建名为 'blobs' 的对象存储空间，keyPath 为自增id
                if (!this.db.objectStoreNames.contains('blobs')) {
                    const store = this.db.createObjectStore('blobs', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    // 创建索引（可选，用于按名称查询）
                    store.createIndex('name', 'name', {unique: false});
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                reject('数据库打开失败: ' + event.target.error);
            };
        });
    }

    async saveBlob(blob, name = '') {
        if (!this.db || this.db.close) await this.openDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['blobs'], 'readwrite');
            const store = transaction.objectStore('blobs');

            const request = store.add({
                blob,
                name,
                timestamp: Date.now()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject('保存失败: ' + e.target.error);
        });
    }

    async getBlobById(id) {
        if (!this.db || this.db.close) await this.openDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['blobs'], 'readonly');
            const store = transaction.objectStore('blobs');

            const request = store.get(id);

            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.blob);
                } else {
                    reject('未找到对应数据');
                }
            };
            request.onerror = (e) => reject('读取失败: ' + e.target.error);
        });
    }

    async deleteBlob(id) {
        if (!this.db || this.db.close) await this.openDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['blobs'], 'readwrite');
            const store = transaction.objectStore('blobs');

            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = (e) => reject('删除失败: ' + e.target.error);
        });
    }

// 删除7天前的数据
    async cleanupOldBlobs(days = 7) {
        const threshold = Date.now() - days * 86400000;
        const transaction = this.db.transaction(['blobs'], 'readwrite');
        const store = transaction.objectStore('blobs');
        const request = store.openCursor();

        request.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                if (cursor.value.timestamp < threshold) {
                    cursor.delete();
                }
                cursor.continue();
            }
        };
    }
}

export default IndexedDBInstance;