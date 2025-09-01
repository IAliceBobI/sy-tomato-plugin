import { siyuan } from "./utils";

async function _findLink2BlockIDs(lnkIDs: string[], seenBlockIDs: Set<string>) {
    const newBlockIDs = await siyuan
        .sqlAttr(`select block_id from attributes 
            where name="custom-lnk-my-id" 
            and value in (${lnkIDs.map(i => `"${i}"`).join(",")}) 
            limit 999999`)
        .then(attrs => attrs.map(a => a.block_id));
    return newBlockIDs.filter(id => !seenBlockIDs.has(id))
}

export async function findLink2BlockIDs(lnkIDs: string[], seenBlockIDs: Set<string>, depath = 1) {
    while (lnkIDs.length > 0) {
        const blockIDs = await _findLink2BlockIDs(lnkIDs, seenBlockIDs);
        seenBlockIDs.addAll(blockIDs);
        if (--depath <= 0) break;
        lnkIDs = await siyuan
            .sqlAttr(`select value from attributes 
            where name="custom-lnk-to-ids" 
            and block_id in (${blockIDs.map(i => `"${i}"`).join(",")}) 
            limit 999999`)
            .then(attrs => attrs.mapfilter(a => a?.value?.split(",")).flat());
    }
}
