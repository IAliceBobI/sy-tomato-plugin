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

export async function currentTime(secs: number = 0) {
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

export async function checkBlockExist(id: string) {
    return call("/api/block/checkBlockExist", { id })
}

export async function sql(stmt: string) {
    return call('/api/query/sql', { stmt })
}

export async function sqlOne(stmt: string) {
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

export async function getBlockKramdown(id: string) {
    return call("/api/block/getBlockKramdown", { id })
}

export async function insertBlockAfter(data: string, previousID: string, dataType = 'markdown') {
    // dataType [markdown, kramdown]
    return call('/api/block/insertBlock', { data, dataType, previousID })
}

export async function insertBlockBefore(data: string, nextID: string, dataType = 'markdown') {
    // dataType [markdown, kramdown]
    return call('/api/block/insertBlock', { data, dataType, nextID })
}

export async function insertBlockAsChildOf(data: string, parentID: string, dataType = 'markdown') {
    // dataType [markdown, kramdown]
    return call('/api/block/insertBlock', { data, dataType, parentID })
}

export function newID() {
    return "ID" + uuid().replace("-", "")
}

const timeRegex = /^(\d{4})-(\d{1,2})-(\d{1,2}) ?(\d{1,2}):(\d{1,2}):(\d{1,2})$/;

export function checkTimeFormat(input: string) {
    return timeRegex.test(input);
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

export function makesureDateTimeFormat(input: string) {
    const zeroPad = (value: string) => {
        const v = value?.toString() ?? ""
        return padStart(v, 2, '0');
    };
    const formattedTimeString = input.replace(timeRegex, (_match, year, month, day, hour, minute, second) => {
        return `${year}-${zeroPad(month)}-${zeroPad(day)} ${zeroPad(hour)}:${zeroPad(minute)}:${zeroPad(second)}`;
    });
    if (new Date(formattedTimeString).toDateString() === 'Invalid Date') {
        return ""
    }
    return formattedTimeString
}

export async function removeBookmarks(docID: string, keepBlockID: string) {
    const bookmark = ""
    const rows = await sql(`select id from blocks where root_id='${docID}' and ial like '%bookmark=%'`);
    for (const row of rows) {
        const id = row['id'];
        if (keepBlockID === id) continue
        await setBlockAttrs(id, { bookmark })
    }
}

export async function addBookmark(id: string, bookmark: string) {
    return setBlockAttrs(id, { bookmark })
}

export async function addRiffCards(blockIDs: Array<string>, deckID: string = "20230218211946-2kw8jgx") {
    return call("/api/riff/addRiffCards", { blockIDs, deckID })
}

export async function getRiffCards(page: number = 1, deckID: string = "") {
    return call("/api/riff/getRiffCards", { "id": deckID, page })
}

export async function removeRiffCards(blockIDs: Array<string>, deckID: string = "") {
    return call("/api/riff/removeRiffCards", { deckID, blockIDs })
}

export async function findListType(thisID: string) {
    let theUpperestListID = ""
    while (true) {
        const thisBlock = await getRowByID(thisID);
        const thisType = thisBlock['type'];
        if (thisType === 'l')
            theUpperestListID = thisID;
        else if (thisType === 'd')
            break;
        thisID = thisBlock['parent_id']
    }
    return theUpperestListID;
}

export async function deleteBlocks() {
    const startPoint = await sqlOne("select id,root_id from blocks where content='aacc1'")
    const endPoint = await sqlOne("select id,root_id from blocks where content='aacc2'")
    const [doc1, doc2] = [startPoint["root_id"], endPoint["root_id"]]
    if (!doc1 || !doc2 || doc1 !== doc2) {
        return false
    }
    let doDelete = false
    const blocks = await getChildBlocks(doc1)
    for (const child of blocks) {
        if (child['id'] === startPoint["id"]) {
            doDelete = true
        }
        if (doDelete) {
            await deleteBlock(child['id'])
        }
        if (child['id'] === endPoint["id"]) break
    }
    return true
}

export async function moveBlocks(copy: boolean = false) {
    const startPoint = await sqlOne("select id,root_id from blocks where content='aacc1'")
    const endPoint = await sqlOne("select id,root_id from blocks where content='aacc2'")
    const insertPoint = await sqlOne("select id,root_id from blocks where content='aacc3'")
    const [doc1, doc2] = [startPoint["root_id"], endPoint["root_id"]]
    if (!doc1 || !doc2 || doc1 !== doc2) {
        return false
    }
    let found = false
    const blocks = await getChildBlocks(doc1)
    const ids = []
    for (const child of blocks) {
        if (child['id'] === startPoint["id"]) {
            found = true
            continue
        }
        if (child['id'] === endPoint["id"]) break
        if (found) {
            ids.push(child['id'])
        }
    }
    ids.reverse()
    for (const id of ids) {
        if (copy) {
            const { kramdown } = await getBlockKramdown(id)
            await insertBlockAfter(kramdown, insertPoint["id"])
        } else {
            await moveBlockAfter(id, insertPoint["id"])
        }
    }
    await deleteBlock(startPoint["id"])
    await deleteBlock(endPoint["id"])
    await deleteBlock(insertPoint["id"])
    return true
}

export async function removeBrokenCards() {
    const invalidCardIDs = []
    for (let page = 1; page < Number.MAX_SAFE_INTEGER; page++) {
        const resp = await getRiffCards(page)
        const cards = resp['blocks']
        if (!cards.length) break
        for (const i in cards) {
            const card = cards[i]
            const valid = card['box'] && card['markdown']
            if (!valid) {
                invalidCardIDs.push(card['id'])
            }
        }
    }
    if (invalidCardIDs.length) {
        await removeRiffCards(invalidCardIDs)
    }
    return invalidCardIDs
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}