import { fetchSyncPost } from "siyuan";
import { v4 as uuid } from "uuid";

export function dateFormat(date: Date) {
    let year: any = date.getFullYear();
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
}


export function dateFromYYYYMMDDHHmmss(date: string) {
    return new Date(date)
}

export async function currentTime(secs: number=0) {
    const response = await fetchSyncPost("/api/system/currentTime", {})
    return dateFormat(new Date(response.data + secs * 1000));
}

export async function pushMsg(msg: string, timeoutMs: number = 7000) {
    const url = "/api/notification/pushMsg"
    const response = await fetchSyncPost(url, { msg, timeout: timeoutMs })
    if (response.code != 0) {
        throw Error(`${url}: code=${response.code}, msg=${response.msg}`)
    }
    return response.data
}

async function call(url: string, reqData: any) {
    const method = "POST"
    const headers = { 'Content-Type': 'application/json' }
    const data = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(reqData),
    })
    const json = await data.json()
    if (json?.code && json?.code != 0) {
        console.warn("code=%s %s", json?.code, json?.msg)
        return null
    }
    if (json?.data === undefined)
        return data
    return json.data
}

async function sql(stmt: string) {
    return call('/api/query/sql', { stmt })
}

async function sqlOne(stmt: string) {
    const ret = await sql(stmt)
    if (ret.length >= 1) {
        return ret[0]
    }
    return {}
}

export async function setBlockAttrs(id: string, attrs: any) {
    return call("/api/attr/setBlockAttrs", { id, attrs })
}

export async function getNotebookConf(notebookID: string) {
    return call("/api/notebook/getNotebookConf", { "notebook": notebookID })
}

export async function getDocIDByBlockID(id: string): Promise<string> {
    const row = await sqlOne(`select root_id from blocks where id='${id}'`);
    return row['root_id'] ?? ""
}

export async function getRowByID(id: string) {
    const row = await sqlOne(`select * from blocks where id='${id}'`);
    return row ?? {}
}

export async function getChildBlocks(id: string) {
    return call("/api/block/getChildBlocks", { id })
}

export async function deleteBlock(id: string) {
    return call("/api/block/deleteBlock", { id })
}

export async function moveBlockToParent(id: string, parentID: string) {
    return call("/api/block/moveBlock", { id, parentID })
}

export async function moveBlockAfter(id: string, previousID: string) {
    return call("/api/block/moveBlock", { id, previousID })
}

export function newID() {
    return "ID" + uuid().replace("-", "")
}