class IndexedDBInstance {
    #DBName;
    #DBVersion;
    #db

    constructor(dbName, dbVersion) {
        if (!('indexedDB' in window)) {
            throw new Error('当前浏览器不支持 IndexedDB，无法创建存储对象');
        }
        this.#DBName = dbName;
        this.#DBVersion = dbVersion;
        this.#db = null;
    }

    async checkFullSupportAndOpenDB() {
        try {
            return await this.#openDB();
        } catch {
            throw new Error('IndexedDB 功能异常（如隐私模式禁用）');
        }
    }

    async #openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.#DBName, this.#DBVersion);

            request.onupgradeneeded = (event) => {
                this.#db = event.target.result;
                // 创建名为 'blobs' 的对象存储空间，keyPath 为自增id
                if (!this.#db.objectStoreNames.contains('blobs')) {
                    const store = this.#db.createObjectStore('blobs', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    // 创建索引（可选，用于按名称查询）
                    store.createIndex('time', 'time', {unique: false});
                }
            };

            request.onsuccess = (event) => {
                this.#db = event.target.result;
                resolve(this.#db);
            };

            request.onerror = (event) => {
                reject('数据库打开失败: ' + event.target.error);
            };
        });
    }

    async saveBlob(db, blob, time) {
        if (!this.#db || this.#db.close) await this.#openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['blobs'], 'readwrite');
            const store = transaction.objectStore('blobs');

            const request = store.add({
                blob,
                time,
                timestamp: Date.now()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject('保存失败: ' + e.target.error);
        });
    }

    async getBlobById(id) {
        if (!this.#db || this.#db.close) await this.#openDB();

        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction(['blobs'], 'readonly');
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
        if (!this.#db || this.#db.close) await this.#openDB();

        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction(['blobs'], 'readwrite');
            const store = transaction.objectStore('blobs');

            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = (e) => reject('删除失败: ' + e.target.error);
        });
    }

// 删除7天前的数据
    async cleanupOldBlobs(days = 7) {
        const threshold = Date.now() - days * 86400000;
        const transaction = this.#db.transaction(['blobs'], 'readwrite');
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