import { Constants, IOperation, fetchSyncPost } from "siyuan";
import { v4 as uuid } from "uuid";

const timeRegex = /^(\d{4})-(\d{1,2})-(\d{1,2}) ?(\d{1,2}):(\d{1,2}):(\d{1,2})$/;
export const IDRegexp = /id="[^"]+"/;
export const RIFFRegexp = /custom-riff-decks="[^"]+"/;

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function padStart(input: string, targetLength: number, padString: string): string {
    const inputLength = input.length;
    if (inputLength >= targetLength) {
        return input;
    }
    const paddingLength = targetLength - inputLength;
    const padding = padString.repeat(Math.ceil(paddingLength / padString.length)).slice(0, paddingLength);
    return padding + input;
}

export function findBookOpennedFirst(bookID: string, bookIDList: string[]): string {
    if (bookIDList.length === 0) return bookID;
    if (bookIDList.indexOf(bookID) === -1) {
        return bookIDList[0];
    }
    return bookID;
}

function randStr(length: number): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars.charAt(randomIndex);
    }
    return result;
}

export function newNodeID(): string {
    const now = new Date();
    const formattedDate = now.toISOString().replace(/[-T:Z.]/g, "").slice(0, 14);
    const randomStr = randStr(7);
    return formattedDate + "-" + randomStr;
}

export function newID() {
    return "ID" + uuid().replace(/-/g, "");
}

export const timeUtil = {
    dateFormat(date: Date) {
        const year: any = date.getFullYear();
        let month: any = date.getMonth() + 1;
        let day: any = date.getDate();
        let hours: any = date.getHours();
        let minutes: any = date.getMinutes();
        let seconds: any = date.getSeconds();
        month = (month < 10 ? "0" : "") + month;
        day = (day < 10 ? "0" : "") + day;
        hours = (hours < 10 ? "0" : "") + hours;
        minutes = (minutes < 10 ? "0" : "") + minutes;
        seconds = (seconds < 10 ? "0" : "") + seconds;
        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    },
    dateFromYYYYMMDDHHmmss(date: string) {
        return new Date(date);
    },
    checkTimeFormat(input: string) {
        return timeRegex.test(input);
    },
    makesureDateTimeFormat(input: string) {
        const zeroPad = (value: string) => {
            const v = value?.toString() ?? "";
            return padStart(v, 2, "0");
        };
        const formattedTimeString = input.replace(timeRegex, (_match, year, month, day, hour, minute, second) => {
            return `${year}-${zeroPad(month)}-${zeroPad(day)} ${zeroPad(hour)}:${zeroPad(minute)}:${zeroPad(second)}`;
        });
        if (new Date(formattedTimeString).toDateString() === "Invalid Date") {
            return "";
        }
        return formattedTimeString;
    },
};

export const siyuan = {
    async pushMsg(msg: string, timeoutMs = 7000) {
        const url = "/api/notification/pushMsg";
        const response = await fetchSyncPost(url, { msg, timeout: timeoutMs });
        if (response.code != 0) {
            throw Error(`${url}: code=${response.code}, msg=${response.msg}`);
        }
        return response.data;
    },
    async currentTime(secs = 0) {
        return timeUtil.dateFormat(new Date(await siyuan.currentTimeMs(secs)));
    },
    async currentTimeMs(secs = 0) {
        const response = await fetchSyncPost("/api/system/currentTime", {});
        return response.data + secs * 1000;
    },
    async getFile(path: string) {
        const method = "POST";
        const headers = { "Content-Type": "application/json" };
        const data = await fetch("/api/file/getFile", {
            method,
            headers,
            body: JSON.stringify({ path }),
        });
        return await data.json();
    },
    // =================================
    async call(url: string, reqData: any) {
        const method = "POST";
        const headers = { "Content-Type": "application/json" };
        const data = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(reqData),
        });
        const json = await data.json();
        if (json?.code && json?.code != 0) {
            console.warn("code=%s %s", json?.code, json?.msg);
            return null;
        }
        if (json?.data === undefined)
            return data;
        return json.data;
    },
    async openNotebook(notebookID: string) {
        const notebook = notebookID;
        return siyuan.call("/api/notebook/openNotebook", { notebook });
    },
    async lsNotebooks(closed: boolean) {
        const resp = await siyuan.call("/api/notebook/lsNotebooks", {});
        const l = [];
        for (const book of resp["notebooks"]) {
            if (book.closed === closed) {
                l.push(book.id);
            }
        }
        return l;
    },
    async sql(stmt: string) {
        return siyuan.call("/api/query/sql", { stmt });
    },
    // await globalThis.progressive_zZmqus5PtYRi.siyuan.sqlOne(`select * from blocks where id='20231106015952-wjqufut'`)
    async sqlOne(stmt: string) {
        const ret = await siyuan.sql(stmt);
        if (ret.length >= 1) {
            return ret[0];
        }
        return {};
    },
    async createDocWithMdIfNotExists(notebookID: string, path_readable: string, markdown: string) {
        const row = await siyuan.sqlOne(`select id from blocks where hpath="${path_readable}" and type='d' limit 1`);
        const docID = row?.id ?? "";
        if (!docID) {
            return siyuan.createDocWithMd(notebookID, path_readable, markdown);
        }
        return docID;
    },
    async createDocWithMd(notebookID: string, path_readable: string, markdown: string, id = "") {
        const notebook = notebookID;
        const path = path_readable;
        const params = { notebook, path, markdown, id };
        if (!id) delete params["id"];
        return siyuan.call("/api/filetree/createDocWithMd", params);
    },
    async removeDoc(notebookID: string, path: string) {
        return siyuan.call("/api/filetree/removeDoc", { notebook: notebookID, path });
    },
    async checkBlockExist(id: string) {
        return siyuan.call("/api/block/checkBlockExist", { id });
    },
    async setBlockAttrs(id: string, attrs: any) {
        return siyuan.call("/api/attr/setBlockAttrs", { id, attrs });
    },
    async transactions(doOperations: IOperation[]) {
        return siyuan.call("/api/transactions", {
            session: Constants.SIYUAN_APPID,
            app: Constants.SIYUAN_APPID,
            transactions: [{
                doOperations
            }]
        });
    },
    async getNotebookConf(notebookID: string) {
        // {
        //     "box": "20231109134354-obnhgjv",
        //     "conf": {
        //         "name": "33",
        //         "sort": 0,
        //         "icon": "",
        //         "closed": false,
        //         "refCreateSavePath": "",
        //         "docCreateSavePath": "",
        //         "dailyNoteSavePath": "/daily note/{{now | date \"2006/01\"}}/{{now | date \"2006-01-02\"}}",
        //         "dailyNoteTemplatePath": "",
        //         "sortMode": 15
        //     },
        //     "name": "33"
        // }
        return siyuan.call("/api/notebook/getNotebookConf", { "notebook": notebookID });
    },
    async getDocIDByBlockID(id: string): Promise<string> {
        const row = await siyuan.sqlOne(`select root_id from blocks where id='${id}'`);
        return row["root_id"] ?? "";
    },
    async getRowByID(id: string) {
        const row = await siyuan.sqlOne(`select * from blocks where id='${id}'`);
        return row ?? {};
    },
    async getChildBlocks(id: string) {
        // return {id, type}
        return siyuan.call("/api/block/getChildBlocks", { id });
    },
    async getIDsByHPath(hpath: string, notebookID: string) {
        // return ['20231102203317-gj54aex']
        return siyuan.call("/api/filetree/getIDsByHPath", { path: hpath, notebook: notebookID });
    },
    async getBlocksWordCount(ids: string[]) {
        // {runeCount: 0, wordCount: 0, linkCount: 0, imageCount: 0, refCount: 0}
        // if ids.length > 1, like wordCount will be the sum of blocks.
        return siyuan.call("api/block/getBlocksWordCount", { ids });
    },
    async clearAll(docID: string) {
        for (const child of await siyuan.getChildBlocks(docID)) {
            await siyuan.deleteBlock(child["id"]);
        }
    },
    async deleteBlock(id: string) {
        return siyuan.call("/api/block/deleteBlock", { id });
    },
    async moveBlockToParent(id: string, parentID: string) {
        return siyuan.call("/api/block/moveBlock", { id, parentID });
    },
    async moveBlockAfter(id: string, previousID: string) {
        return siyuan.call("/api/block/moveBlock", { id, previousID });
    },
    async getBlockKramdown(id: string) {
        return siyuan.call("/api/block/getBlockKramdown", { id });
    },
    async getBlockMarkdownAndContent(id: string) {
        const row: { [key: string]: string } = await siyuan.sqlOne(`select markdown, content from blocks where id="${id}"`);
        return { markdown: row?.markdown ?? "", content: row?.content ?? "" }
    },
    async listDocsByPath(notebookID: string, notReadablePath: string, sort = 15) {
        // {
        //     "box": "20220705180858-r5dh51g",
        //     "files": [
        //         {
        //             "path": "/20231109151158-92arxkh.sy",
        //             "name": "📚C.sy",
        //             "icon": "",
        //             "name1": "",
        //             "alias": "",
        //             "memo": "",
        //             "bookmark": "",
        //             "id": "20231109151158-92arxkh",
        //             "count": 0,
        //             "size": 809,
        //             "hSize": "809 B",
        //             "mtime": 1699515172,
        //             "ctime": 1699513918,
        //             "hMtime": "刚刚",
        //             "hCtime": "2023-11-09 15:11:58",
        //             "sort": 0,
        //             "subFileCount": 0,
        //             "hidden": false,
        //             "newFlashcardCount": 0,
        //             "dueFlashcardCount": 0,
        //             "flashcardCount": 0
        //     ],
        //     "path": "/"
        // }
        return siyuan.call("/api/filetree/listDocsByPath", { notebook: notebookID, path: notReadablePath, sort });
    },
    async insertBlockAfter(data: string, previousID: string, dataType = "markdown") {
        // dataType [markdown, kramdown]
        return siyuan.call("/api/block/insertBlock", { data, dataType, previousID });
    },
    async insertBlockBefore(data: string, nextID: string, dataType = "markdown") {
        // dataType [markdown, kramdown]
        return siyuan.call("/api/block/insertBlock", { data, dataType, nextID });
    },
    async insertBlockAsChildOf(data: string, parentID: string, dataType = "markdown") {
        // dataType [markdown, kramdown]
        return siyuan.call("/api/block/insertBlock", { data, dataType, parentID });
    },
    async removeBookmarks(docID: string, keepBlockID: string) {
        const bookmark = "";
        const rows = await siyuan.sql(`select id from blocks where root_id='${docID}' and ial like '%bookmark=%'`);
        for (const row of rows) {
            const id = row["id"];
            if (keepBlockID === id) continue;
            await siyuan.setBlockAttrs(id, { bookmark });
        }
    },
    async addBookmark(id: string, bookmark: string) {
        return siyuan.setBlockAttrs(id, { bookmark });
    },
    async addRiffCards(blockIDs: Array<string>, deckID = "20230218211946-2kw8jgx") {
        return siyuan.call("/api/riff/addRiffCards", { blockIDs, deckID });
    },
    async getRiffCards(page = 1, deckID = "") {
        return siyuan.call("/api/riff/getRiffCards", { "id": deckID, page });
    },
    async getRiffDecks() {
        return siyuan.call("/api/riff/getRiffDecks", {});
    },
    async removeRiffCards(blockIDs: Array<string>, deckID = "") {
        return siyuan.call("/api/riff/removeRiffCards", { deckID, blockIDs });
    },
    async findListType(thisID: string) {
        let theUpperestListID = "";
        let theMD = "";
        let count = 500;
        while (count > 0) {
            count -= 1;
            const thisBlock = await siyuan.getRowByID(thisID);
            if (!theMD) {
                theMD = thisBlock["content"];
                if (!theMD) theMD = " ";
            }
            const thisType = thisBlock["type"];
            if (thisType === "l") {
                theUpperestListID = thisID;
            }
            else if (thisType === "d" || thisType === undefined) {
                break;
            }
            if (!thisID) break;
            thisID = thisBlock["parent_id"];
            if (!thisType) break;
        }
        return [theUpperestListID, theMD];
    },
    async deleteBlocks() {
        const startPoint = await siyuan.sqlOne("select id,root_id from blocks where content='aacc1'");
        const endPoint = await siyuan.sqlOne("select id,root_id from blocks where content='aacc2'");
        const [doc1, doc2] = [startPoint["root_id"], endPoint["root_id"]];
        if (!doc1 || !doc2 || doc1 !== doc2) {
            return "";
        }
        let doDelete = false;
        const blocks = await siyuan.getChildBlocks(doc1);
        for (const child of blocks) {
            if (child["id"] === startPoint["id"]) {
                doDelete = true;
            }
            if (doDelete) {
                await siyuan.deleteBlock(child["id"]);
            }
            if (child["id"] === endPoint["id"]) break;
        }
        return doc1;
    },
    async moveBlocks(copy = false) {
        const startPoint = await siyuan.sqlOne("select id,root_id from blocks where content='aacc1'");
        const endPoint = await siyuan.sqlOne("select id,root_id from blocks where content='aacc2'");
        const insertPoint = await siyuan.sqlOne("select id,root_id from blocks where content='aacc3'");
        const [startDocID, endDocID] = [startPoint["root_id"], endPoint["root_id"]];
        if (!startDocID || !endDocID || startDocID !== endDocID) {
            return [];
        }
        let found = false;
        const blocks = await siyuan.getChildBlocks(startDocID);
        const ids = [];
        for (const child of blocks) {
            if (child["id"] === startPoint["id"]) {
                found = true;
                continue;
            }
            if (child["id"] === endPoint["id"]) break;
            if (found) {
                ids.push(child["id"]);
            }
        }
        ids.reverse();
        for (const id of ids) {
            if (copy) {
                const l = await siyuan.getBlockKramdownWithoutID(id);
                await siyuan.insertBlockAfter(l, insertPoint["id"]);
            } else {
                await siyuan.moveBlockAfter(id, insertPoint["id"]);
            }
        }
        await siyuan.deleteBlock(startPoint["id"]);
        await siyuan.deleteBlock(endPoint["id"]);
        await siyuan.deleteBlock(insertPoint["id"]);
        return [startDocID, insertPoint["root_id"]];
    },
    async getBlockKramdownWithoutID(id: string) {
        const { kramdown } = await siyuan.getBlockKramdown(id);
        const lines: Array<string> = kramdown.split("\n");
        let attrs = lines.pop();
        attrs = attrs.replace(IDRegexp, "");
        attrs = attrs.replace(RIFFRegexp, "");
        lines.push(attrs);
        return lines.join("\n");
    },
    async removeBrokenCards() {
        const invalidCardIDs = [];
        for (let page = 1; page < Number.MAX_SAFE_INTEGER; page++) {
            const resp = await siyuan.getRiffCards(page);
            const cards = resp["blocks"];
            if (!cards.length) break;
            for (const i in cards) {
                const card = cards[i];
                const valid = card["box"] && card["markdown"];
                if (!valid) {
                    invalidCardIDs.push(card["id"]);
                }
            }
        }
        if (invalidCardIDs.length) {
            await siyuan.removeRiffCards(invalidCardIDs);
        }
        return invalidCardIDs;
    },
};
