// 思源内核 HTTP API 封装（siyuan 大对象）+ siyuanCache 缓存层。
// 从原 utils.ts 拆出（2026-08 重构），utils.ts 现为 re-export 桶；文件扫描/笔记本/文档树
// 导出等上层工具进一步拆到 fileScanUtils.ts / notebookUtils.ts（2026-08），本文件 re-export
// 保持历史导入路径不变。
// 注意：与 blockUtils.ts / fileScanUtils.ts / notebookUtils.ts 存在循环 import（方法体内互调），
// 与原 utils.ts 内部一致，CJS 打包安全。
import { Config, Constants, fetchSyncPost, confirm } from "siyuan";
import * as gconst from "./gconst";
import { TomatoI18n } from "../tomatoI18n";
import { events } from "./Events";
import { getDocBlocks } from "./docUtils";
import { Siyuan, NewNodeID } from "./globals";
import { timeUtil } from "./timeUtil";
import { extractIDs } from "./strUtils";
import { sleep } from "./miscUtils";
import { getAllFilesAsBigText } from "./fileScanUtils";
import { cleanDivOnly } from "./blockUtils";
import { IUILayoutTabSearchConfigTypes } from "./types";

export const siyuan = {
    async pushMsg(msg: string, timeoutMs = 7000) {
        const url = "/api/notification/pushMsg";
        msg += `<span style="display: none;">${new Date().getTime()}<span>`;
        const response = await fetchSyncPost(url, { msg, timeout: timeoutMs });
        if (response.code != 0) {
            throw Error(`${url}: code=${response.code}, msg=${response.msg}`);
        }
        return response.data;
    },
    async currentTime(secs = 0) {
        return timeUtil.dateFormat(new Date(await siyuan.currentTimeMs(secs)));
    },
    async currentTimeMs(secs = 0): Promise<number> {
        const response = await fetchSyncPost("/api/system/currentTime", {});
        return response.data + secs * 1000;
    },
    async currentTimeSec(secs = 0): Promise<number> {
        return siyuan.currentTimeMs(secs).then(ms => Math.ceil(ms / 1000))
    },
    async getWorkspaces() {
        const response = await fetchSyncPost("/api/system/getWorkspaces", {});
        return response.data
    },
    async copyFile(src: string, dest: string) {
        return siyuan.call("/api/file/copyFile", { src, dest });
    },
    async readDir(path: string): Promise<{ isDir: boolean, isSymlink: boolean, name: string, updated: string }[]> {
        // await utils_zZmqus5PtYRi.siyuan.readDir("/data/plugins/sy-tomato-plugin/i18n")
        return siyuan.call("/api/file/readDir", { path });
    },
    async performSync(upload = false, mobileSwitch = false) {
        return siyuan.call("/api/sync/performSync", { upload, mobileSwitch });
    },
    async performBootSync() {
        return siyuan.call("/api/sync/performBootSync", {});
    },
    async listCloudSyncDir() {
        return siyuan.call("/api/sync/listCloudSyncDir", {});
    },
    async removeFile(path: string) {
        return siyuan.call("/api/file/removeFile", { path });
    },
    async copyFile2(src: string, dest: string) {
        // await utils_zZmqus5PtYRi.siyuan.copyFile("/data/plugins/sy-tomato-plugin/i18n/empty.xmind","/data/assets/abc.xmind")
        const bs = await siyuan.getFileBinary(src);
        return siyuan.putFile(dest, bs);
    },
    async putFile(path: string, value: any) {
        let file: File;
        if (value instanceof ArrayBuffer) {
            const uint8Array = new Uint8Array(value);
            file = new File([new Blob([uint8Array])], path.split("/").pop());
        } else if (typeof value === "object") {
            file = new File([new Blob([JSON.stringify(value)], {
                type: "application/json"
            })], path.split("/").pop());
        } else {
            file = new File([new Blob([value])], path.split("/").pop());
        }
        const formData = new FormData();
        formData.append("path", path);
        formData.append("file", file);
        formData.append("isDir", "false");
        const method = "POST";
        const resp = await fetch("/api/file/putFile", {
            method,
            body: formData,
        });
        const data = await resp.json();
        if (data.code && data.code != 0) {
            console.error("code=%s %s", data.code, data.msg);
            return null;
        }
        return data.data;
    },
    async getFileBinary(path: string): Promise<ArrayBuffer> {
        try {
            const method = "POST";
            const headers = { "Content-Type": "application/json" };
            const response = await fetch("/api/file/getFile", {
                method,
                headers,
                body: JSON.stringify({ path }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const blobData = await response.blob();
            return blobData.arrayBuffer();
        } catch (error) {
            console.error("Error fetching file binary:", error);
            throw error; // re-throw the error so it can be caught by the caller, if needed
        }
    },
    async getFile(path: string) {
        const method = "POST";
        const headers = { "Content-Type": "application/json" };
        const data = await fetch("/api/file/getFile", {
            method,
            headers,
            body: JSON.stringify({ path }),
        });
        return data.text();
    },
    async getJson(path: string) {
        const txt = await siyuan.getFile(path);
        try {
            return JSON.parse(txt);
        } catch (e) {
            console.error(e)
        }
    },
    // =================================
    async call(url: string, reqData: any) {
        const method = "POST";
        const headers = { "Content-Type": "application/json" };
        try {
            const data = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(reqData),
            });
            const json = await data.json();
            if (json?.code && json?.code != 0) {
                console.warn(`p5: ${json?.code} ${json?.msg} ${JSON.stringify(reqData)}`);
                return null;
            }
            if (json?.data === undefined)
                return data;
            return json.data;
        } catch (e) {
            console.warn(e, url, reqData);
        }
    },
    transSetAttrViewColWrap(avID: string, blockID: string, colID: string, wrap = true) {
        const op = {} as IOperation;
        op.action = "setAttrViewColWrap";
        op.avID = avID;
        op.blockID = blockID;
        op.id = colID;
        op.data = wrap;
        return op;
    },
    transSetAttrViewColHidden(avID: string, blockID: string, colID: string, hide = true) {
        const op = {} as IOperation;
        op.action = "setAttrViewColHidden";
        op.avID = avID;
        op.blockID = blockID;
        op.id = colID;
        op.data = hide
        return op;
    },
    transSetAttrViewSorts(avID: string, blockID: string, colID: string, order: "ASC" | "DESC") {
        const op = {} as IOperation;
        op.action = "setAttrViewSorts";
        op.avID = avID;
        op.blockID = blockID;
        op.data = [{ column: colID, order }]
        return op;
    },
    transSetAttrViewColCalc(avID: string, blockID: string, colID: string, operator: CalcOperator) {
        const op = {} as IOperation;
        op.action = "setAttrViewColCalc";
        op.avID = avID;
        op.data = { operator };
        op.blockID = blockID;
        op.id = colID;
        return op;
    },
    transSetAttrViewFilters(avID: string, blockID: string, filters: IAVFilter[]) {
        const op = {} as IOperation;
        op.action = "setAttrViewFilters";
        op.avID = avID;
        op.data = filters;
        op.blockID = blockID;
        return op;
    },
    transSetAttrViewViewName(avID: string, viewID: string, name: string) {
        const op = {} as IOperation;
        op.action = "setAttrViewViewName";
        op.avID = avID;
        op.id = viewID;
        op.data = name;
        return op;
    },
    transUpdateAttrViewCol(avID: string, colId: string, name: string, type?: TAVCol) {
        const op = {} as IOperation;
        op.action = "updateAttrViewCol";
        op.id = colId;
        op.avID = avID;
        op.name = name;
        op.type = type;
        return op;
    },
    transSetAttrViewName(avID: string, name: string) {
        const op = {} as IOperation;
        op.action = "setAttrViewName";
        op.id = avID;
        op.data = name;
        return op;
    },
    transRemoveAttrViewCol(avID: string, colID: string) {
        const op = {} as IOperation;
        op.action = "removeAttrViewCol";
        op.avID = avID;
        op.id = colID;
        return op;
    },
    transAddAttrViewCol(avID: string, name: string, id = NewNodeID(), type: TAVCol = "text", previousID = "") {
        const op = {} as IOperation;
        op.action = "addAttrViewCol";
        op.avID = avID;
        op.name = name;
        op.previousID = previousID;
        op.type = type;
        op.id = id;
        return op;
    },
    transUpdateAttrViewCellBatch(args: { avID: string, cellID?: string, colID: string, rowID_BlockID: string, value: IAVCellValue }[]) {
        return args.map(arg => {
            const op = {} as IOperation;
            op.action = "updateAttrViewCell";
            op.avID = arg.avID;
            op.id = arg.cellID;
            op.keyID = arg.colID;
            op.rowID = arg.rowID_BlockID;
            op.data = arg.value;
            return op;
        })
    },
    transInsertAttrViewBlock(avID: string, blockID: string, srcs: IOperationSrcs[], previousID = "", ignoreFillFilter = true) {
        const op = {} as IOperation;
        op.action = "insertAttrViewBlock";
        op.avID = avID;
        op.blockID = blockID;
        op.previousID = previousID;
        op.ignoreFillFilter = ignoreFillFilter;
        op.srcs = srcs;
        return op;
    },
    transDoUpdateUpdated(blockID: string, data = timeUtil.getYYYYMMDDHHmmss()) {
        const op = {} as IOperation;
        op.action = "doUpdateUpdated";
        op.id = blockID
        op.data = data
        return op;
    },
    async getAttributeView(id: string): Promise<GetAttributeView> {
        return siyuan.call("/api/av/getAttributeView", { id });
    },
    async renderAttributeView(id: string, pageSize = 50, page = 1, query = "", viewID = ""): Promise<RenderAttributeView> {
        if (page <= 0) throw Error("页码必须大于等于1")
        return siyuan.call("/api/av/renderAttributeView", { id, pageSize, query, page, viewID });
    },
    async removeUnusedAsset(path: string): Promise<{ path: string }> {
        return siyuan.call("/api/asset/removeUnusedAsset", { path });
    },
    async removeUnusedAssets(): Promise<{ paths: string[] }> {
        return siyuan.call("/api/asset/removeUnusedAssets", {});
    },
    async getMissingAssets(): Promise<{ missingAssets: string[] }> {
        return siyuan.call("/api/asset/getMissingAssets", {});
    },
    async getUnusedAssets(): Promise<{ unusedAssets: string[] }> {
        return siyuan.call("/api/asset/getUnusedAssets", {});
    },
    async getDocCreateSavePath(notebookID: string): Promise<{ path: string }> {
        const notebook = notebookID;
        return siyuan.call("/api/filetree/getDocCreateSavePath", { notebook });
    },
    async getRefCreateSavePath(notebookID: string): Promise<{ path: string }> {
        const notebook = notebookID;
        return siyuan.call("/api/filetree/getRefCreateSavePath", { notebook });
    },
    async openNotebook(notebookID: string) {
        const notebook = notebookID;
        return siyuan.call("/api/notebook/openNotebook", { notebook });
    },
    async getNotebookByName(name: string): Promise<LsNotebook> {
        const resp = await siyuan.call("/api/notebook/lsNotebooks", {});
        for (const book of resp?.["notebooks"] ?? []) {
            if (book.name === name) {
                return book;
            }
        }
        return {} as LsNotebook;
    },
    async lsNotebooks(closed?: boolean): Promise<LsNotebook[]> {
        const resp = await siyuan.call("/api/notebook/lsNotebooks", {});
        if (closed == null) {
            return resp["notebooks"];
        }
        const l = [];
        for (const book of resp["notebooks"]) {
            if (book.closed === closed) {
                l.push(book);
            }
        }
        return l;
    },
    async sqlAsset(stmt: string): Promise<Asset[]> {
        // from assets
        return (await siyuan.call("/api/query/sql", { stmt })) ?? [];
    },
    async sqlSpan(stmt: string): Promise<Span[]> {
        // from spans
        return (await siyuan.call("/api/query/sql", { stmt })) ?? [];
    },
    async sqlRef(stmt: string): Promise<Ref[]> {
        // from refs
        return (await siyuan.call("/api/query/sql", { stmt })) ?? [];
    },
    async sqlAttr(stmt: string): Promise<Attributes[]> {
        // from attributes
        return (await siyuan.call("/api/query/sql", { stmt })) ?? [];
    },
    async sql(stmt: string): Promise<Block[]> {
        // from blocks
        return (await siyuan.call("/api/query/sql", { stmt })) ?? [];
    },
    async sqlOne(stmt: string): Promise<Block> {
        const ret = await siyuan.sql(stmt);
        if (ret.length >= 1) {
            return ret[0];
        }
        return {} as Block;
    },
    async getParentRowByID(id: string) {
        if (id) {
            return siyuan.sql(`select * from blocks where id in (
                select parent_id from blocks where id="${id}" limit 1
            ) limit 1`).then(rows => rows?.at(0));
        }
    },
    async getDocRowsByName(name: string): Promise<Block[]> {
        if (!name) return []
        return siyuan.sql(`select * from blocks where content="${name}" and type="d" limit 10000000`)
    },
    async getDocAttrs(docID: string, name: string): Promise<Attributes[]> {
        return siyuan.sqlAttr(`select * from attributes where root_id="${docID}" and name="${name}"`);
    },
    async getBlockIndex(id: string): Promise<number> {
        return await siyuan.call("/api/block/getBlockIndex", { id });
    },
    async getBlocksIndexes(ids: string[]): Promise<Record<string, number>> {
        return await siyuan.call("/api/block/getBlocksIndexes", { ids });
    },
    async getBlockBreadcrumb(id: string, excludeTypes: string[] = []): Promise<BreadcrumbPath[]> {
        return await siyuan.call("/api/block/getBlockBreadcrumb", { id, excludeTypes });
    },
    async setUILayout(layout: Config.IUiLayout) {
        return siyuan.call("/api/system/setUILayout", { layout });
    },
    async getConf(): Promise<{ conf: Config.IConf, start: boolean }> {
        return siyuan.call("/api/system/getConf", {});
    },
    async flushTransaction(): Promise<any> {
        return await siyuan.call("/api/sqlite/flushTransaction", {});
    },
    async createDocWithMdIfNotExists(notebookID: string, path_readable: string, markdown: string, attr?: AttrType): Promise<string> {
        return navigator.locks.request("tomato.siyuan.createDocWithMdIfNotExists", { mode: "exclusive" }, async (_lock) => {
            const row = await siyuan.sqlOne(`select id from blocks where box="${notebookID}" and hpath="${path_readable}" and type='d' limit 1`);
            const docID = row?.id ?? "";
            if (!docID) {
                return siyuan.createDocWithMd(notebookID, path_readable, markdown, "", attr);
            }
            return docID;
        });
    },
    async createDocWithMd(notebookID: string, path_readable: string, markdown: string, id = "", attr?: any) {
        const notebook = notebookID;
        const path = path_readable;
        let params: any;
        if (id) {
            params = { notebook, path, markdown, id };
        } else {
            params = { notebook, path, markdown };
        }
        id = await siyuan.call("/api/filetree/createDocWithMd", params);
        if (attr) await siyuan.setBlockAttrs(id, attr);
        return id;
    },
    async getDocRowByBlockID(id: string) {
        return siyuan.sqlOne(`select * from blocks where id in (select root_id from blocks where id="${id}") limit 1`);
    },
    async removeDoc(notebookID: string, path_not_readable: string) {
        return siyuan.call("/api/filetree/removeDoc", { notebook: notebookID, path: path_not_readable });
    },
    async renameDocByID(docID: string, title: string) {
        const row = await siyuan.sqlOne(`select box,path from blocks where type='d' and id="${docID}"`);
        if (row?.box && row?.path) {
            return siyuan.renameDoc(row.box, row.path, title);
        }
    },
    async renameDoc(notebookID: string, path_not_readable: string, title: string) {
        return siyuan.call("/api/filetree/renameDoc", { notebook: notebookID, title, path: path_not_readable });
    },
    async moveDocs(fromPaths: string[], toPath: string, toNotebook: string, callback?: string) {
        if (callback)
            return siyuan.call("/api/filetree/moveDocs", { fromPaths, toPath, toNotebook, callback });
        return siyuan.call("/api/filetree/moveDocs", { fromPaths, toPath, toNotebook });
    },
    async duplicateDoc(id: string): Promise<{ "id": string, "notebook": string, "path": string, "hPath": string }> {
        return siyuan.call("/api/filetree/duplicateDoc", { id });
    },
    async removeDocByIDSiyuan(docID: string) {
        return siyuan.call("/api/filetree/removeDocByID", { id: docID });
    },
    async removeDocByID(docID: string) {
        let count = 10;
        while (count-- > 0) {
            const row = await this.sqlOne(`select box, path from blocks where id="${docID}" and type="d"`);
            const box = row?.box ?? "";
            const path = row?.path ?? "";
            if (box && path) {
                return siyuan.removeDoc(box, path);
            }
            await sleep(1000);
        }
        return {};
    },
    async insertLocalAssets(id: string, assetPaths: string, isUpload = false): Promise<any> {
        return siyuan.call("/api/asset/insertLocalAssets", { id, assetPaths, isUpload });
    },
    async getDocOutline(id: string): Promise<GetDocOutline[]> {
        return siyuan.call("/api/outline/getDocOutline", { id });
    },
    async resolveAssetPath(path: string): Promise<string> {
        // get abs path in the OS.
        return siyuan.call("/api/asset/resolveAssetPath", { path });
    },
    async renameAsset(oldPath: string, newName: string): Promise<any> {
        // copy file to assets/ and then raname
        return siyuan.call("/api/asset/renameAsset", { oldPath, newName });
    },
    async createSnapshot(memo = "created by sy-tomato-plugin") {
        const ret = await siyuan.call("/api/repo/createSnapshot", { memo });
        siyuan.pushMsg("snapshot created");
        return ret;
    },
    async purgeRepo() {
        return siyuan.call("/api/repo/purgeRepo", {});
    },
    async purgeCloudRepo() {
        return siyuan.call("/api/repo/purgeCloudRepo", {});
    },
    async getDocImageAssets(id: string): Promise<string[]> {
        // find and list images only
        return siyuan.call("/api/asset/getDocImageAssets", { id });
    },
    async transferBlockRef(fromID: string, toID: string, reloadUI = true): Promise<any> {
        return siyuan.call("/api/block/transferBlockRef", { fromID, toID, reloadUI });
    },
    async createDailyNote(notebook: string): Promise<{ id: string }> {
        return siyuan.call("/api/filetree/createDailyNote", { notebook });
    },
    async checkBlockExist(id: string): Promise<boolean> {
        if (!id) return false;
        return siyuan.call("/api/block/checkBlockExist", { id });
    },
    async getBlockDOM(id: string): Promise<{ dom: string, id: string }> {
        return siyuan.call("/api/block/getBlockDOM", { id });
    },
    async setBlockAttrs(id: string, attrs: AttrType) {
        return siyuan.call("/api/attr/setBlockAttrs", { id, attrs });
    },
    transbatchSetBlockAttrs(blockAttrs: { id: string, attrs: AttrType }[]) {
        return blockAttrs.map(b => {
            const op = {} as IOperation;
            op.action = "setAttrs";
            op.id = b.id;
            op.data = JSON.stringify(b.attrs);
            return op;
        });
    },
    async batchSetBlockAttrsTrans(blockAttrs: { id: string, attrs: AttrType }[]) {
        return siyuan.transactions(siyuan.transbatchSetBlockAttrs(blockAttrs));
    },
    transBatchUpdateAttrs(blockAttrs: { id: string, old: AttrType, new: AttrType }[]) {
        return blockAttrs.map(b => {
            const op = {} as IOperation;
            op.action = "updateAttrs";
            op.id = b.id;
            op.data = JSON.stringify({ old: b.old, new: b.new });
            return op;
        });
    },
    async batchUpdateAttrsTrans(blockAttrs: { id: string, old: AttrType, new: AttrType }[]) {
        return siyuan.transactions(siyuan.transBatchUpdateAttrs(blockAttrs));
    },
    async batchSetBlockAttrs(blockAttrs: { id: string, attrs: AttrType }[]) {
        if (blockAttrs.length > 0) return siyuan.call("/api/attr/batchSetBlockAttrs", { blockAttrs });
    },
    async batchGetBlockAttrs(ids: string[]): Promise<{ [blockID: string]: AttrType }> {
        return siyuan.call("/api/attr/batchGetBlockAttrs", { ids });
    },
    async getBlockAttrs(id: string): Promise<AttrType> {
        const r = await siyuan.call("/api/attr/getBlockAttrs", { id });
        return r ?? {}
    },
    async getNotebookConf(notebookID: string): Promise<GetNotebookConf> {
        return siyuan.call("/api/notebook/getNotebookConf", { "notebook": notebookID });
    },
    async getDocIDByBlockID(id: string): Promise<string> {
        if (!id) return ""
        const row = await siyuan.sqlOne(`select root_id from blocks where id='${id}'`);
        return row["root_id"] ?? "";
    },
    async getRowByID(id: string) {
        const row = await siyuan.sqlOne(`select * from blocks where id='${id}'`);
        return row;
    },
    async getRows(chilrenIDs: string[], selected = "*", ordered = true, ands: string[] = [], allowNull = false): Promise<Block[]> {
        if (!chilrenIDs || chilrenIDs.length == 0) return [];
        selected = selected.trim();
        if (selected != "*") {
            const s = new Set(selected.split(","));
            s.add("id");
            selected = [...s.values()].join(",");
        }
        const placeholders = chilrenIDs.map(id => `"${id}"`).join(",");
        const sqlBuilder = [];
        sqlBuilder.push(`SELECT ${selected} FROM blocks WHERE id IN (${placeholders})`);
        ands.forEach(a => sqlBuilder.push("AND " + a));
        sqlBuilder.push("limit 100000000");
        const rows = await siyuan.sql(sqlBuilder.join(" "));
        if (ordered) {
            const rowMap = rows.reduce((m, r) => {
                m.set(r.id, r);
                return m;
            }, new Map());
            if (allowNull) {
                return chilrenIDs.map(id => rowMap.get(id));
            } else {
                return chilrenIDs.map(id => rowMap.get(id)).filter(i => i != null);
            }
        }
        return rows;
    },
    async getChildBlocks(id: string): Promise<GetChildBlocks[]> {
        if (!id) return [];
        return siyuan.call("/api/block/getChildBlocks", { id });
    },
    async getIDsByHPath(hpath: string, notebookID: string) {
        // return ['20231102203317-gj54aex']
        return siyuan.call("/api/filetree/getIDsByHPath", { path: hpath, notebook: notebookID });
    },
    async getTag(sort = 4): Promise<Tag[]> {
        return siyuan.call("/api/tag/getTag", { sort });
    },
    async copyStdMarkdown(id: string): Promise<string> {
        if (!id) return ""
        return siyuan.call("/api/lute/copyStdMarkdown", { id });
    },
    async copyStdMarkdownForPromptKeepTitle(id: string): Promise<string> {
        let txt = await siyuan.copyStdMarkdown(id)
        if (!txt) txt = ""
        return txt.split("---").at(0)
    },
    async copyStdMarkdownForPromptWithoutTitle(id: string): Promise<string> {
        let txt = await siyuan.copyStdMarkdown(id)
        if (!txt) txt = ""
        return txt.split("---").at(0).split("\n").slice(1).join("\n")
    },
    async copyStdMarkdownWithoutTitle(id: string): Promise<string> {
        let txt = await siyuan.copyStdMarkdown(id)
        if (!txt) txt = ""
        return txt.split("\n").slice(1).join("\n")
    },
    async copyStdMarkdownForPromptLastN(id: string, num: number): Promise<string> {
        let txt = await siyuan.copyStdMarkdown(id)
        if (!txt) txt = ""
        return txt.split("---").slice(-num).join("\n")
    },
    async getContentWordCount(content: string): Promise<GetBlocksWordCount> {
        return siyuan.call("/api/block/getContentWordCount", { content });
    },
    async getBlocksWordCount(ids: string[]): Promise<GetBlocksWordCount> {
        // if ids.length > 1, like wordCount will be the sum of blocks.
        return siyuan.call("/api/block/getBlocksWordCount", { ids });
    },
    // don't append to doc after clearAll
    async clearAll(docID: string) {
        const blocks = await siyuan.getChildBlocks(docID);
        return siyuan.deleteBlocks(blocks.map((b: any) => b["id"]));
    },
    transDeleteBlocks(ids: string[]) {
        return ids?.map(id => {
            const op = {} as IOperation;
            op.action = "delete";
            op.id = id;
            return op;
        }) ?? [];
    },
    async deleteBlock(id: string) {
        return siyuan.call("/api/block/deleteBlock", { id });
    },
    async deleteBlocks(ids: string[]) {
        if (ids?.length > 0)
            return siyuan.transactions(siyuan.transDeleteBlocks(ids));
    },
    transMoveBlocksAfter(ids: string[], previousID: string) {
        return ids.slice().reverse().map(id => {
            const op = {} as IOperation;
            op.action = "move";
            op.id = id;
            op.previousID = previousID;
            return op;
        });
    },
    async moveBlocksAfter(ids: string[], previousID: string) {
        return siyuan.transactions(siyuan.transMoveBlocksAfter(ids, previousID));
    },
    async moveBlockAfter(id: string, previousID: string) {
        return siyuan.call("/api/block/moveBlock", { id, previousID });
    },
    async moveBlockAsChild(id: string, parentID: string) {
        return siyuan.call("/api/block/moveBlock", { id, parentID });
    },
    transMoveBlocksAsChild(ids: string[], parentID: string) {
        return ids.slice().reverse().map(id => {
            const op = {} as IOperation;
            op.action = "move";
            op.id = id;
            op.parentID = parentID;
            return op;
        });
    },
    async moveBlocksAsChild(ids: string[], parentID: string) {
        return siyuan.transactions(siyuan.transMoveBlocksAsChild(ids, parentID));
    },
    async getDocLastID(id: string) {
        return siyuan.getTailChildBlocks(id, 1).then(r => r?.at(0)?.id)
    },
    async getTailChildBlocks(id: string, n: number): Promise<[{ id: string, type: string }]> {
        return siyuan.call("/api/block/getTailChildBlocks", { id, n });
    },
    async getBlockKramdown(id: string): Promise<GetBlockKramdown> {
        return siyuan.call("/api/block/getBlockKramdown", { id });
    },
    async refreshVirtualBlockRef() {
        return siyuan.call("/api/setting/refreshVirtualBlockRef", {});
    },
    async setAppearance(conf: Config.IAppearance) {
        return siyuan.call("/api/setting/setAppearance", conf);
    },
    async updateBlock(id: string, data: string, dataType: "markdown" | "dom" = "markdown") {
        return siyuan.call("/api/block/updateBlock", { id, data, dataType });
    },
    async safeUpdateBlock(id: string, data: string, dataType: "markdown" | "dom" = "markdown") {
        let i = 20;
        do {
            const e = await siyuan.checkBlockExist(id);
            if (e) {
                return siyuan.call("/api/block/updateBlock", { id, data, dataType });
            }
            await sleep(400);
        } while (--i > 0);
    },
    transUpdateBlocks(ops: { id: string, domStr: string }[]) {
        ops = ops.filter(op => !!op.id);
        if (!(ops.length > 0)) return [];
        return ops.map(({ id, domStr }) => {
            const op = {} as IOperation;
            op.action = "update"; // dom
            op.id = id;
            op.data = domStr;
            return op;
        });
    },
    async updateBlocks(ops: { id: string, domStr: string }[]) {
        return siyuan.transactions(siyuan.transUpdateBlocks(ops));
    },
    async getBlockMarkdownAndContent(id: string): Promise<GetBlockMarkdownAndContent> {
        const row = await siyuan.sqlOne(`select markdown, content from blocks where id="${id}"`);
        return { markdown: row?.markdown ?? "", content: row?.content ?? "", id };
    },
    // session 是发起编辑视图的 protyle.id：内核 PushModeBroadcastExcludeSelf 按它精确排除回声。
    // 默认值 SIYUAN_APPID 匹配不到任何 ws 连接（连接 id 是 protyle.id/genUUID），等于广播给所有
    // 前端——编辑触发的传播回声会打到正在打字的视图，内核缩放局部更新分支在同步组子块 ID
    // 共享时误替换当前视图首块（非 undo 不恢复光标），slave 块打字光标因此不断跳回块首。
    async transactions(doOperations: IOperation[], undoOperations: IOperation[] = [], session?: string) {
        if (doOperations.length == 0 && undoOperations.length == 0) return;
        return siyuan.call("/api/transactions", {
            session: session || Constants.SIYUAN_APPID,
            app: Constants.SIYUAN_APPID,
            transactions: [{
                doOperations, undoOperations
            }],
            reqId: new Date().getTime(),
        });
    },
    async getHeadingDeleteTransaction(id: string): Promise<{ timestamp: number, doOperations: IOperation[], undoOperations: IOperation[] }> {
        return siyuan.call("/api/block/getHeadingDeleteTransaction", { id });
    },
    async getHeadingChildrenIDs(id: string): Promise<string[]> {
        return siyuan.call("/api/block/getHeadingChildrenIDs", { id });
    },
    async getHeadingChildrenDOM(id: string) {
        return siyuan.call("/api/block/getHeadingChildrenDOM", { id });
    },
    async listDocsByPath(notebookID: string, notReadablePath: string, sort = 15): Promise<RetListDocsByPath> {
        return siyuan.call("/api/filetree/listDocsByPath", { notebook: notebookID, path: notReadablePath, sort });
    },
    async listDocTree(notebookID: string, notReadablePath: string): Promise<RetListDocTree> {
        return siyuan.call("/api/filetree/listDocTree", { notebook: notebookID, path: notReadablePath });
    },
    async getRefIDs(id: string) {
        return siyuan.call("/api/block/getRefIDs", { id });
    },
    async getBackmentionDoc(defID: string, refTreeID: string, keyword: string = ""): Promise<GetBackmentionDoc> {
        const containChildren = (Siyuan.config.editor as any).backlinkContainChildren;
        const args = { defID, refTreeID, keyword, containChildren };
        return siyuan.call("/api/ref/getBackmentionDoc", args);
    },
    async getBacklinkDoc(defID: string, refTreeID: string, keyword: string = ""): Promise<GetBacklinkDoc> {
        const containChildren = (Siyuan.config.editor as any).backlinkContainChildren;
        const args = { defID, refTreeID, keyword, containChildren };
        return siyuan.call("/api/ref/getBacklinkDoc", args);
    },
    async getBacklink2(id: string, k = "", mk = "", sort = "3", mSort = "3"): Promise<GetBacklink2> {
        const containChildren = (Siyuan.config.editor as any).backlinkContainChildren;
        //     SortModeNameASC                // 0：文件名字母升序
        //     SortModeNameDESC               // 1：文件名字母降序
        //     SortModeUpdatedASC             // 2：文件更新时间升序
        //     SortModeUpdatedDESC            // 3：文件更新时间降序
        //     SortModeAlphanumASC            // 4：文件名自然数升序
        //     SortModeAlphanumDESC           // 5：文件名自然数降序
        //     SortModeCustom                 // 6：自定义排序
        //     SortModeRefCountASC            // 7：引用数升序
        //     SortModeRefCountDESC           // 8：引用数降序
        //     SortModeCreatedASC             // 9：文件创建时间升序
        //     SortModeCreatedDESC            // 10：文件创建时间降序
        //     SortModeSizeASC                // 11：文件大小升序
        //     SortModeSizeDESC               // 12：文件大小降序
        //     SortModeSubDocCountASC         // 13：子文档数升序
        //     SortModeSubDocCountDESC        // 14：子文档数降序
        //     SortModeFileTree               // 15：使用文档树排序规则
        //     SortModeUnassigned = 256       // 256：未指定排序规则，按照笔记本优先于文档树获取排序规则
        const args = { id, k, mk, sort, mSort, containChildren };
        return siyuan.call("/api/ref/getBacklink2", args);
    },
    async appendDailyNoteBlock(notebook: string, data: string, dataType: "markdown" | "dom" = "markdown"): Promise<gconst.TransactionData[]> {
        return siyuan.call("/api/block/appendDailyNoteBlock", { notebook, data, dataType });
    },
    async prependDailyNoteBlock(notebook: string, data: string, dataType: "markdown" | "dom" = "markdown"): Promise<gconst.TransactionData[]> {
        return siyuan.call("/api/block/prependDailyNoteBlock", { notebook, data, dataType });
    },
    async insertBlockAfter(data: string, previousID: string, dataType: "markdown" | "dom" = "markdown") {
        return siyuan.call("/api/block/insertBlock", { data, dataType, previousID });
    },
    async insertBlockBefore(data: string, nextID: string, dataType: "markdown" | "dom" = "markdown") {
        return siyuan.call("/api/block/insertBlock", { data, dataType, nextID });
    },
    async insertBlockAsChildOf(data: string, parentID: string, dataType: "markdown" | "dom" = "markdown") {
        return siyuan.call("/api/block/insertBlock", { data, dataType, parentID });
    },
    transInsertBlocksBefore(domStrs: string[], nextID: string) {
        return domStrs.slice().reverse().map(data => {
            const op = {} as IOperation;
            op.action = "insert";
            op.data = data;
            op.nextID = nextID;
            return op;
        });
    },
    transInsertBlocksAfter(domStrs: string[], previousID: string) {
        return domStrs.slice().reverse().map(data => {
            const op = {} as IOperation;
            op.action = "insert";
            op.data = data;
            op.previousID = previousID;
            return op;
        });
    },
    transInsertBlocksAsChildOf(domStrs: string[], parentID: string) {
        return domStrs.slice().reverse().map(data => {
            const op = {} as IOperation;
            op.action = "insert";
            op.data = data;
            op.parentID = parentID;
            return op;
        });
    },
    async insertBlocksAfter(domStrs: string[], id: string) {
        if (!id) return;
        return siyuan.transactions(siyuan.transInsertBlocksAfter(domStrs, id));
    },
    async insertBlocksAsChildOf(domStrs: string[], parentID: string) {
        return siyuan.transactions(siyuan.transInsertBlocksAsChildOf(domStrs, parentID));
    },
    transAppendBlocks(ids: string[], parentID: string) {
        return ids.map(id => {
            const op = {} as IOperation;
            op.action = "append";
            op.id = id;
            op.parentID = parentID;
            return op;
        });
    },
    async appendBlocks(domStrs: string[], parentID: string) {
        const tail = await siyuan.getTailChildBlocks(parentID, 1).then(i => {
            if (i) return i[0]?.id
        })
        if (tail) return siyuan.transactions(siyuan.transInsertBlocksAfter(domStrs, tail));
    },
    async appendBlock(data: string, parentID: string, dataType: "markdown" | "dom" = "markdown"): Promise<gconst.TransactionData[]> {
        return siyuan.call("/api/block/appendBlock", { data, dataType, parentID });
    },
    async checkUpdate(showMsg = false) {
        return siyuan.call("/api/system/checkUpdate", { showMsg });
    },
    async getBlockInfo(id: string): Promise<GetBlockInfo> {
        return siyuan.call("/api/block/getBlockInfo", { id });
    },
    async getDocInfo(id: string): Promise<GetDocInfo> {
        return siyuan.call("/api/block/getDocInfo", { id });
    },
    async removeBookmarks(docID: string, keepBlockID: string) {
        const bookmark = "";
        const rows = await siyuan.sql(`select id from blocks where root_id='${docID}' and ial like '%bookmark=%' limit 1000`);
        for (const row of rows) {
            const id = row["id"];
            if (keepBlockID === id) continue;
            await siyuan.setBlockAttrs(id, { bookmark });
        }
    },
    async addBookmark(id: string, bookmark: string) {
        return siyuan.setBlockAttrs(id, { bookmark });
    },
    async getTreeRiffCardsAll(id: string): Promise<GetCardRetBlock[]> {
        const total: GetCardRetBlock[] = [];
        for (let i = 1; ; i++) {
            const ret = await siyuan.getTreeRiffCards(id, i);
            if (!ret?.blocks) break;
            total.push(...ret.blocks);
            if (total.length >= ret.total) break;
            if (i >= ret.pageCount + 3) break;
        }
        return total;
    },
    async getTreeRiffCards(id: string, page: number, pageSize = 10000): Promise<GetCardRet> {
        if (page <= 0) throw Error("页码必须大于等于1")
        return siyuan.call("/api/riff/getTreeRiffCards", { id, page, pageSize });
    },
    async getTreeRiffDueCards(rootID: string): Promise<GetDueCardRet> {
        return siyuan.call("/api/riff/getTreeRiffDueCards", { rootID });
    },
    async getNotebookRiffDueCards(notebook: string): Promise<GetDueCardRet> {
        return siyuan.call("/api/riff/getNotebookRiffDueCards", { notebook });
    },
    async getNotebookRiffCards(id: string, page: number, pageSize = 10000): Promise<GetCardRet> {
        if (page <= 0) throw Error("页码必须大于等于1")
        return siyuan.call("/api/riff/getNotebookRiffCards", { id, page, pageSize });
    },
    async resetRiffCards(type: "notebook" | "tree" | "deck", id: string, blockIDs: string[] = [], deckID = Constants.QUICK_DECK_ID): Promise<GetCardRet> {
        // typ := arg["type"].(string)      // notebook, tree, deck
        // id := arg["id"].(string)         // notebook ID, root ID, deck ID
        // deckID := arg["deckID"].(string) // deck ID
        // blockIDsArg := arg["blockIDs"]   // 如果不传入 blockIDs （或者传入实参为空数组），则重置所有卡片
        return siyuan.call("/api/riff/resetRiffCards", { type, id, blockIDs, deckID });
    },
    transAddRiffCards(blockIDs: string[]) {
        const op = {} as IOperation;
        op.action = "addFlashcards";
        op.deckID = Constants.QUICK_DECK_ID
        op.blockIDs = blockIDs;
        return op;
    },
    transRemoveRiffCards(blockIDs: string[]) {
        const op = {} as IOperation;
        op.action = "removeFlashcards";
        op.deckID = Constants.QUICK_DECK_ID
        op.blockIDs = blockIDs;
        return op;
    },
    async addRiffCards(blockIDs: Array<string>, deckID = Constants.QUICK_DECK_ID): Promise<AddRiffCards> {
        return siyuan.call("/api/riff/addRiffCards", { blockIDs, deckID });
    },
    async skipReviewRiffCard(cardID: string, deckID = Constants.QUICK_DECK_ID) {
        return siyuan.call("/api/riff/skipReviewRiffCard", { cardID, deckID });
    },
    async reviewRiffCard(cardID: string, rating: number, deckID = Constants.QUICK_DECK_ID) {
        return siyuan.call("/api/riff/reviewRiffCard", { cardID, rating, deckID });
    },
    async reviewRiffCardByBlockID(blockID: string, rating: number, deckID = Constants.QUICK_DECK_ID) {
        const all = await siyuan.getRiffCardsByBlockIDs([blockID]);
        if (all.has(blockID)) {
            const card = all.get(blockID).slice().pop();
            if (card) {
                return siyuan.reviewRiffCard(card.riffCardID, rating, deckID);
            }
        }
    },
    async getRiffCards(page = 1, pageSize = 1000, deckID = ""): Promise<GetCardRet> {
        if (page <= 0) throw Error("页码必须大于等于1")
        return siyuan.call("/api/riff/getRiffCards", { "id": deckID, page, pageSize });
    },
    async getRiffCardsByBlockIDs(blockIDs: string[]) {
        const ret: GetCardRet = await siyuan.call("/api/riff/getRiffCardsByBlockIDs", { blockIDs });
        return ret?.blocks?.reduce((m, b) => {
            const cs = m.get(b.id) ?? [];
            cs.push(b);
            m.set(b.id, cs);
            return m;
        }, new Map<string, GetCardRetBlock[]>());
    },
    async batchSetRiffCardsDueTimeByBlockID(blockDues: { id: string, due: string }[]) {
        const all = await siyuan.getRiffCardsByBlockIDs(blockDues.map(c => c.id));
        const cardDues = blockDues.map(block => {
            return all.get(block.id)?.map(card => {
                return { id: card.riffCardID, due: block.due };
            });
        }).filter(c => !!c).flat();
        return siyuan.batchSetRiffCardsDueTimeByCardID(cardDues);
    },
    async batchSetRiffCardsDueTimeByCardID(cardDues: { id: string, due: string }[]) {
        // "due": "20240224214412"
        return siyuan.call("/api/riff/batchSetRiffCardsDueTime", { cardDues });
    },
    async getRiffCardsAllFlat(pageSize = 1000) {
        return [...(await siyuan.getRiffCardsAll(pageSize)).values()].flat()
    },
    async getRiffCardsAll(pageSize = 1000) {
        const total: Map<string, GetCardRetBlock[]> = new Map();
        // let j = 0;
        for (let i = 1; ; i++) {
            const ret = await siyuan.getRiffCards(i, pageSize);
            if (!ret?.blocks) break;
            ret.blocks.forEach(i => { // 存在一个块多卡。
                const a = total.get(i.id) ?? [];
                a.push(i);
                total.set(i.id, a);
            });
            // j+=ret.blocks.length;
            // xx.log(total.size, j,ret.total)
            if (total.size >= ret.total) break;
            if (i >= ret.pageCount + 1) break;
        }
        return total;
    },
    async getRiffDueCards(deckID = ""): Promise<GetDueCardRet> {
        return siyuan.call("/api/riff/getRiffDueCards", { deckID });
    },
    async getRiffDecks() {
        return siyuan.call("/api/riff/getRiffDecks", {});
    },
    async removeRiffCards(blockIDs: Array<string>, deckID = "") {
        if (!blockIDs || blockIDs.length == 0) return null;
        return siyuan.call("/api/riff/removeRiffCards", { deckID, blockIDs });
    },
    async updateEmbedBlock(id: string, content: string) {
        return siyuan.call("/api/search/updateEmbedBlock", { id, content });
    },
    async fullTextSearchBlock(
        /**
         * 搜索传入的查询内容
         */
        query?: string,
        /**
         * Grouping strategy
         * - `0`: No grouping
         * - `1`: Group by document
         */
        groupBy?: number,
        /**
         * Search in the specified paths
         */
        paths?: string[],
        /**
         * Search scheme
         * - `0`: Keyword (default)
         * - `1`: Query syntax
         * - `2`: SQL
         * - `3`: Regular expression
         * @default 0
         */
        method?: number,
        /**
         * Current page number
         */
        page?: number,
        /**
         * Search result sorting scheme
         * - `0`: Block type (default)
         * - `1`: Ascending by creation time
         * - `2`: Descending by creation time
         * - `3`: Ascending by update time
         * - `4`: Descending by update time
         * - `5`: By content order (only valid when grouping by document)
         * - `6`: Ascending by relevance
         * - `7`: Descending by relevance
         * @default 0
         */
        orderBy?: number,
        types?: IUILayoutTabSearchConfigTypes,
    ): Promise<FullTextSearchBlockRet> {
        return siyuan.call("/api/search/fullTextSearchBlock", {
            query, method, types,
            paths,
            groupBy,
            orderBy,
            page,
        });
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
    async deleteBlocksUtil() {
        const { aacc1, aacc2 } = await findAACC();
        {
            if (!aacc1?.id) {
                siyuan.pushMsg("aacc1 not found")
                return
            } else if (!aacc2?.id) {
                siyuan.pushMsg("aacc2 not found")
                return
            } else if (aacc1.root_id !== aacc2.root_id) {
                siyuan.pushMsg("aacc1 aacc2 must be in the same doc")
                return
            }
        }
        let doDelete = false;
        const { root: { children } } = await getDocBlocks(aacc1.root_id, "", false, false, 1);
        const blocks = [];
        for (const child of children) {
            if (child.id === aacc1.id) {
                doDelete = true;
            }
            if (doDelete) {
                blocks.push(child.id);
            }
            if (child.id === aacc2.id) break;
        }
        if (blocks.length === 0) {
            return blocks
        }
        await siyuan.deleteBlocks(blocks);
    },
    async moveBlocksUtil(copy = false) {
        const blocks: Block[] = [];
        const { aacc1, aacc2, aacc3 } = await findAACC();
        {
            if (!aacc1?.id) {
                siyuan.pushMsg("aacc1 not found")
                return blocks
            } else if (!aacc2?.id) {
                siyuan.pushMsg("aacc2 not found")
                return blocks
            } else if (!aacc3?.id) {
                siyuan.pushMsg("aacc3 not found")
                return blocks
            } else if (aacc1.root_id !== aacc2.root_id) {
                siyuan.pushMsg("aacc1 aacc2 must be in the same doc")
                return blocks
            }
        }
        {
            let found = false;
            const { root: { children } } = await getDocBlocks(aacc1.root_id, "", false, false, 1);
            for (const child of children) {
                if (child.id === aacc1.id) {
                    found = true;
                    continue;
                }
                if (child.id === aacc2.id) break;
                if (found) {
                    blocks.push(child);
                }
            }
        }
        if (blocks.length === 0) {
            return blocks
        }
        const ops = [];
        if (copy) {
            const htmls = blocks.map(b => {
                const c = cleanDivOnly(b.div);
                b.div = c.div
                b.id = c.newID
                return b.div;
            }).map(div => div.outerHTML);
            ops.push(...siyuan.transInsertBlocksAfter(htmls, aacc3.id));
        } else {
            ops.push(...siyuan.transMoveBlocksAfter(blocks.map(b => b.id), aacc3.id));
        }
        ops.push(...siyuan.transDeleteBlocks([aacc1.id, aacc2.id, aacc3.id]))
        await siyuan.transactions(ops);
        return blocks;
    },
    async getBlockKramdownWithoutID(id: string, newAttrs: string[] = [], prefix?: string, suffix?: string,) {
        const { kramdown } = await siyuan.getBlockKramdown(id);
        const lines: Array<string> = kramdown.split("\n");
        let attrs = lines.pop();
        if (lines.length > 0) {
            if (prefix) {
                lines[0] = prefix + lines[0];
            }
            if (suffix) {
                lines[lines.length - 1] += suffix;
            }
        }
        const IDRegexp = /id="[^"]+"/;
        const RIFFRegexp = /custom-riff-decks="[^"]+"/;
        attrs = attrs.replace(IDRegexp, "");
        attrs = attrs.replace(RIFFRegexp, "");
        if (newAttrs) {
            attrs = attrs.trim();
            attrs = attrs.slice(0, attrs.length - 1); // rm the '}'
            for (const newattr of newAttrs) {
                attrs += " " + newattr + " ";
            }
            attrs += "}";
        }
        if (attrs != "{: }") {
            lines.push(attrs);
        }
        return lines.join("\n");
    },
    async removeBrokenCards(tomatoI18n: TomatoI18n): Promise<{ bigText: string, allIDs: Set<string> }> {
        if (!events.isDesktop) {
            siyuan.pushMsg("can only run in desktop env.");
            return;
        }
        return navigator.locks.request("removeBrokenCardsLock", { ifAvailable: true }, async (lock) => {
            if (!lock) return;
            if (!(await siyuan.getConf())?.conf?.repo?.key) {
                await siyuan.pushMsg(tomatoI18n.你还没秘钥插件无法为您创建本地快照, 0)
                return;
            }
            siyuan.pushMsg(tomatoI18n.正在确认无效闪卡请耐心等待, 1800);
            const bigText = await getAllFilesAsBigText()
            const allIDs = extractIDs(bigText);
            const invalidCardIDs = [];
            for (const card of [...(await siyuan.getRiffCardsAll()).values()].flat()) {
                if (!allIDs.has(card.id)) {
                    invalidCardIDs.push(card.id);
                }
            }
            if (invalidCardIDs.length > 0) {
                const MAX = 10;
                const lnks = invalidCardIDs.slice(0, MAX).map(id => `<a href="siyuan://blocks/${id}">${id}</a>`).join("<br>")
                let suffix = ""
                if (invalidCardIDs.length > MAX) suffix = "<br>……"
                confirm("⚠️" + tomatoI18n.准备删除失效闪卡(invalidCardIDs.length), tomatoI18n.即将创建快照 + "<br>" + lnks + suffix, async () => {
                    await siyuan.createSnapshot(tomatoI18n.清理所有失效的闪卡);
                    await siyuan.removeRiffCards(invalidCardIDs);
                    await siyuan.pushMsg(tomatoI18n.清理所有失效的闪卡 + " : " + invalidCardIDs.length)
                })
            } else {
                confirm("😄", tomatoI18n.没有失效闪卡)
            }
            return { bigText, allIDs }
        });
    },
    async getDocNameByBlockID(blockID: string) {
        let row = await siyuan.sqlOne(
            `select root_id from blocks where id="${blockID}"`,
        );
        if (row?.root_id) {
            row = await siyuan.sqlOne(
                `select content from blocks where id="${row.root_id}"`,
            );
            if (row?.content) {
                return row.content;
            }
        }
        return "";
    }
};

export const siyuanCache = {
    createDocWithMdIfNotExists: createCache(siyuan.createDocWithMdIfNotExists),
    getRiffCardsByBlockIDs: createCache(siyuan.getRiffCardsByBlockIDs),
};

async function findAACC() {
    return await siyuan
        .sql(`select id,root_id,content from blocks where type='p' and content in ("aacc1","aacc2","aacc3")`)
        .then(rows => {
            let aacc1: Block;
            let aacc2: Block;
            let aacc3: Block;
            rows.forEach(row => {
                switch (row.content) {
                    case 'aacc1':
                        aacc1 = row;
                        break;
                    case 'aacc2':
                        aacc2 = row;
                        break;
                    case 'aacc3':
                        aacc3 = row;
                        break;
                }
            });
            return { aacc1, aacc2, aacc3 };
        });
}

export function createCache
    <T extends Func, R extends Awaited<ReturnType<T>>, P extends Parameters<T>>
    (originalFunction: T): (...args: [number, ...P]) => Promise<R> {
    const cache = new Map<string, { value: R; timestamp: number }>();
    return async function cachedFunction(cacheTime: number, ...args: P): Promise<R> {
        const currentTime = Date.now();
        for (const [k, v] of cache.entries()) {
            if (currentTime - v.timestamp > cacheTime) {
                cache.delete(k);
            }
        }

        const key = JSON.stringify(args);
        if (cache.has(key)) {
            const { value } = cache.get(key);
            return value;
        }

        const result: R = await originalFunction(...args);
        cache.set(key, { value: result, timestamp: Date.now() });
        return result;
    };
}

export * from "./fileScanUtils";
export * from "./notebookUtils";
