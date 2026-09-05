<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { siyuan } from "./libs/utils";
    import {
        cozeSearchAppID,
        cozeSearchDoubaoID,
        cozeSearchKnowledgeID,
        cozeSearchSpaceID,
    } from "./libs/stores";
    import { tomatoI18n } from "./tomatoI18n";
    import { Plugin } from "siyuan";
    import {
        cleanCozeDocs,
        coze_get_all_files,
        cozeAddDocTree,
        cozeDeleteFromKnowledgeByName,
        getCozeName,
    } from "./libs/cozeAI";
    import { events } from "./libs/Events";
    import { OpenSyFile2 } from "./libs/docUtils";

    interface Props {
        dm: DestroyManager;
        text: string;
        anchorID: string;
        plugin: Plugin;
    }

    let {
        dm,
        text = $bindable(),
        anchorID,
        plugin
    }: Props = $props();
    let docID: string = $state();
    let docName: string = $state();
    let cozeFileRows: Block[] = $state([]);

    onMount(async () => {
        if (anchorID) {
            const doc = await siyuan.getDocRowByBlockID(anchorID);
            docID = doc?.id;
            docName = doc?.content;
        }
        const cozeFiles = (await coze_get_all_files()).map((doc) => {
            const t = doc?.name?.split(".");
            return { content: t?.at(0), id: t?.at(1) } as Block;
        });

        (
            await siyuan.getRows(
                cozeFiles.filter((i) => !!i.id).map((i) => i.id),
                "content",
            )
        ).forEach((row) => {
            const cf = cozeFiles.find((c) => c.id === row.id);
            if (cf) {
                cf.content = row.content;
                cf.exists = true;
            }
        });

        cozeFileRows = cozeFiles;
    });

    onDestroy(() => {
        dm.destroyBy("2");
    });
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<div class="fn__flex-column">
    <textarea hidden class="b3-text-field divMargin text" bind:value={text}
    ></textarea>
    <div style="max-height: 400px;overflow: auto;">
        {#each cozeFileRows as row}
            <div>
                <span class="divMargin">{row.content}</span>
                {#if row.exists}
                    <button
                        class="b3-button b3-button--outline divMargin"
                        title={tomatoI18n.上传当前文档以及所有子文档 +
                            " " +
                            row.content}
                        onclick={async () => {
                            await cozeAddDocTree(row.id, "");
                            dm.destroyBy();
                        }}
                        >⬆️
                    </button>
                    <button
                        class="b3-button b3-button--outline divMargin"
                        title={tomatoI18n.定位 + " " + row.content}
                        onclick={async () => {
                            await OpenSyFile2(plugin, row.id);
                            dm.destroyBy();
                        }}
                        >🔍
                    </button>
                {/if}
                <button
                    class="b3-button b3-button--outline divMargin"
                    title={tomatoI18n.删除Coze中当前文件以及子文件 +
                        " " +
                        row.content}
                    onclick={async () => {
                        await cozeDeleteFromKnowledgeByName(
                            getCozeName(row.content, row.id),
                        );
                        dm.destroyBy();
                    }}
                    >🚫
                </button>
            </div>
        {/each}
    </div>
    <table>
        <tbody>
            <tr>
                <td colspan="4">
                    <a
                        class="b3-button b3-button--outline divMargin"
                        href="https://www.coze.cn/space/{$cozeSearchSpaceID}/knowledge/{$cozeSearchKnowledgeID}"
                        >{tomatoI18n.打开知识库}</a
                    >
                    <a
                        class="b3-button b3-button--outline divMargin"
                        href="https://www.coze.cn/space/{$cozeSearchSpaceID}/bot/{$cozeSearchAppID}"
                        >{tomatoI18n.调试智能体}</a
                    >
                    <a
                        title={tomatoI18n.需要先发布到豆包再填写发布后的豆包智能体ID}
                        class="b3-button b3-button--outline divMargin"
                        class:codeNotValid={!$cozeSearchDoubaoID}
                        href="https://www.doubao.com/chat/{$cozeSearchDoubaoID}"
                        >Doubao豆包</a
                    >
                </td>
            </tr>
            <tr>
                <td>
                    <button
                        class="b3-button b3-button--outline divMargin"
                        onclick={async () => {
                            await cleanCozeDocs();
                            dm.destroyBy();
                        }}>{tomatoI18n.清理所有文件}</button
                    >
                </td>
                <td>
                    {#if events.boxID}
                        <button
                            class="b3-button b3-button--outline divMargin"
                            onclick={async () => {
                                if (events.boxID) {
                                    await cozeAddDocTree("", events.boxID);
                                    dm.destroyBy();
                                }
                            }}
                            >{tomatoI18n.上传当前笔记本}
                        </button>
                    {/if}
                </td>
            </tr>
            {#if anchorID}
                <tr>
                    <td colspan="4">
                        <span class="divMargin">{docName}</span>
                        <button
                            class="b3-button b3-button--outline divMargin"
                            title={tomatoI18n.上传当前文档以及所有子文档 +
                                " " +
                                docName}
                            onclick={async () => {
                                await cozeAddDocTree(docID, "");
                                dm.destroyBy();
                            }}
                            >⬆️
                        </button>
                        <button
                            class="b3-button b3-button--outline divMargin"
                            title={tomatoI18n.删除Coze中当前文件以及子文件 +
                                " " +
                                docName}
                            onclick={async () => {
                                await cozeDeleteFromKnowledgeByName(
                                    getCozeName(docName, docID),
                                );
                                dm.destroyBy();
                            }}
                            >🚫
                        </button>
                    </td>
                </tr>
            {/if}
        </tbody>
    </table>
</div>

<style>
    .text {
        height: 300px;
    }
    .divMargin {
        margin: 10px;
    }
    .codeNotValid {
        opacity: 30%;
    }
</style>
