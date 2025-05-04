import { tomatoI18n } from "../tomatoI18n";
import { cozeSearchKnowledgeID, cozeSearchOauthTokenID } from "./stores";
import { chunks, getMarkdownsByTrees, siyuan } from "./utils";

async function postData(url: string, data = {}, headers = {}) {
    return fetch('https://api.coze.cn' + url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + cozeSearchOauthTokenID.get(),
            'Agw-Js-Conv': 'str',
            ...headers,
        },
        body: JSON.stringify(data),
    });
}

async function postGetJson(url: string, data = {}, headers = {}) {
    return postData(url, data, headers).then(r => r.json())
}

export async function cozeAddDocTree(docID: string, boxID = "") {
    const rows = await getMarkdownsByTrees([docID], boxID)
    let name: string;
    if (!boxID) {
        for (const r of rows) {
            if (r.id === docID) {
                name = getCozeName(r.content, r.id)
                break
            }
        }
    } else {
        const nb = await siyuan.getNotebookConf(boxID)
        name = getCozeName(nb.name, boxID)
    }
    await coze_big_file(rows, name);
    siyuan.pushMsg(tomatoI18n.更新所有文档成功)
}

export function getCozeName(name: string, id: string) {
    return name?.replaceAll(".", "")?.slice(0, 20) + "." + id
}

async function coze_big_file(rows: Block[], name: string) {
    await cozeDeleteFromKnowledgeByName(name);
    const payload: any = {
        dataset_id: cozeSearchKnowledgeID.get(),
        chunk_strategy: {
            remove_extra_spaces: true,
            remove_urls_emails: true,
            chunk_type: 0
        },
        format_type: 0,
        document_bases: [
            {
                source_info: {
                    file_type: "md",
                    file_base64: encodeToBase64(rows.map(r => r.markdown).join("\n\n")),
                },
                name,
            }
        ]
    };
    await postGetJson("/open_api/knowledge/document/create", payload);
}

export async function cozeDeleteFromKnowledgeByName(name: string) {
    const all = await coze_get_all_files()
    for (const f of all) {
        if (f.name === name) {
            await postGetJson("/open_api/knowledge/document/delete", { document_ids: [f.document_id] });
        }
    }
}

export async function cleanCozeDocs() {
    const document_ids = await coze_get_all_files().then(fs => fs.map(f => f.document_id))
    for (const ids of chunks(document_ids, 10)) {
        await postGetJson("/open_api/knowledge/document/delete", { document_ids: ids });
    }
}

// https://app.quicktype.io/?l=ts
export async function coze_get_all_files(size = 100) {
    const all = [] as CozeDocumentInfo[]
    let page = 1;
    while (true) {
        const ret = await postGetJson("/open_api/knowledge/document/list", {
            "dataset_id": cozeSearchKnowledgeID.get(),
            "page": page++,
            size,
        }) as CozeListDoc;
        if (ret.document_infos) all.push(...ret.document_infos)
        if (all.length >= ret.total) break;
        if (ret.code != 0) break;
    }
    return all;
}

function encodeToBase64(str: string): string {
    const utf8Bytes = new TextEncoder().encode(str);
    const binaryArray = [];
    for (const byte of utf8Bytes) {
        binaryArray.push(String.fromCharCode(byte));
    }
    const binaryString = binaryArray.join('');
    return btoa(binaryString);
}
