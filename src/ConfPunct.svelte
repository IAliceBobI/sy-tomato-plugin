<script lang="ts">
    // 打字标点域（2026-09-10 punctcfg 升级，bear 提议独立导航项）：本功能全家自通用域
    // 「快捷键与开关」迁出——总开关+速记折叠子开关+结构化映射规则编辑器（每条=源→目标
    // 两框+行删除，可增可删，替代自由文本 textarea）。store 字符串 punctTidyCustomMap
    // 仍是唯一事实源（一行一条 源→目标）——本组件=它的结构化编辑器（行列表↔字符串互转），
    // 保存链/引擎/parsePunctMap 零改动，存量规则原样呈现。灰态联动照 punct-row-disabled 先例。
    import ConfHelpIcon from "./ConfHelpIcon.svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import { punctTidyEnable, punctTidyExtRules, punctTidyCustomMap } from "./libs/stores";

    interface Rule { id: number; src: string; dst: string }
    let ruleSeq = 0;

    // 解析与引擎 parsePunctMap 逐条同义（注释行/无箭头/多字源/astral 源/空目标拒收，review P1/P2）：
    // 非法行 UI 不显——配合源框 maxlength=1 与 serialize 过滤，UI 能建的规则引擎必收（零死规则）
    function parseRules(s: string): Rule[] {
        return s.split(/\r?\n/).map(l => {
            const t = l.trim();
            if (t.startsWith("#")) return null;
            const i = t.indexOf("→");
            if (i < 0) return null;
            const src = t.slice(0, i).trim();
            const dst = t.slice(i + 1).trim();
            if (Array.from(src).length !== 1 || src.codePointAt(0)! > 0xFFFF || !dst) return null;
            return { id: ruleSeq++, src, dst };
        }).filter((r): r is Rule => r != null);
    }
    function serialize(rules: Rule[]): string {
        // 空源/空白目标的行跳过（新添未填的行不落盘，本挂载周期内留着继续填——
        // 切域/关面板即卸载，半填行不跨挂载存活，取舍如此）；each 以 id 为键防删行错位
        return rules.filter(r => r.src && r.dst.trim()).map(r => `${r.src}→${r.dst}`).join("\n");
    }

    // 快照式初始化：仅挂载时 parse 一次，盘上热更改不回流（编辑会话语义，同卡开关行是活 bind）
    let rules = $state<Rule[]>(parseRules(punctTidyCustomMap.get()));

    function writeBack() {
        punctTidyCustomMap.set(serialize(rules));
    }
    function addRule() {
        rules.push({ id: ruleSeq++, src: "", dst: "" });
    }
    function delRule(i: number) {
        rules.splice(i, 1);
        writeBack();
    }
</script>

<div class="settingBox">
    <div class="section-title">{tomatoI18n.打字标点}<ConfHelpIcon token="AFKRdsQjCo933yxu95tcnXuYnUf" /></div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$punctTidyEnable} />
        {tomatoI18n.打字标点自动整理}
    </div>
    <div class:punct-row-disabled={!$punctTidyEnable}>
        <input type="checkbox" class="b3-switch" bind:checked={$punctTidyExtRules} disabled={!$punctTidyEnable} />
        {tomatoI18n.速记折叠标点规则}
    </div>
    <!-- 规则行：源框窄（单字符）+箭头+目标框+删除钮；英文引号映射到任一中文引号形态即可，
         对称整理（奇偶配对）在其后兜底成对——详细说明见帮助文档 -->
    {#each rules as r, i (r.id)}
        <div class:punct-row-disabled={!$punctTidyEnable} class="punct-rule-row">
            <input
                class="b3-text-field punct-rule-src"
                maxlength="1"
                placeholder={tomatoI18n.标点映射源}
                bind:value={r.src}
                onchange={writeBack}
                disabled={!$punctTidyEnable}
            />
            <span class="punct-rule-arrow">→</span>
            <input
                class="b3-text-field punct-rule-dst"
                placeholder={tomatoI18n.标点映射目标}
                bind:value={r.dst}
                onchange={writeBack}
                disabled={!$punctTidyEnable}
            />
            <button
                class="b3-button b3-button--text punct-rule-del"
                aria-label={tomatoI18n.删除映射}
                onclick={() => delRule(i)}
                disabled={!$punctTidyEnable}
            >✕</button>
        </div>
    {/each}
    <div>
        <button class="b3-button b3-button--outline punct-rule-add" onclick={addRule} disabled={!$punctTidyEnable}>
            + {tomatoI18n.添加映射}
        </button>
    </div>
</div>
