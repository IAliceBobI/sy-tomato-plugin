import { getAllEditor } from "siyuan";
import { siyuan, getTomatoPluginInstance } from "../libs/utils";
import { events } from "../libs/Events";
import { debugLog } from "../libs/logUtils";
import { tomatoI18n } from "../tomatoI18n";
import type { BallAction } from "./index";

// 插件命令球（期2）：v1 仅自家命令（跨插件系已知边界不 做）。执行优先 callback，
// 其次 editorCallback（传当前活跃 protyle，不强抢焦点）；命令可能依赖编辑器态，
// debugLog 打点观察（handoff 期2 踩坑行）。
export function findPluginCommand(cmdKey: string) {
    return (getTomatoPluginInstance()?.commands ?? []).find((c) => c.langKey === cmdKey);
}

// 当前活跃编辑器 protyle：events.protyle 冷启动 null（setReadingPointMap 赋值条件苛刻），
// getAllEditor 全量兜底取首个（kernel.md「Menu 单例」节同款配方）
function currentProtyle() {
    return events.protyle?.protyle ?? (getAllEditor() as any[])[0]?.protyle;
}

export const pluginCmdAction: BallAction = {
    type: "plugincmd",
    defaultConfig() {
        return { type: "plugincmd", icon: "⚡" };
    },
    execute(ball: BallItem) {
        const key = ball.action?.cmdKey;
        const cmd = findPluginCommand(key);
        if (!cmd) {
            // 期2 先 zh 硬文案，期6 i18n 收口补 key
            void siyuan.pushMsg(`${tomatoI18n.未找到命令}: ${key ?? ""}`);
            return;
        }
        debugLog("fball", `plugincmd execute ${key} hasCallback=${!!cmd.callback} hasEditor=${!!cmd.editorCallback} hasProtyle=${!!currentProtyle()}`, "fball");
        if (cmd.callback) {
            cmd.callback();
            return;
        }
        if (cmd.editorCallback) {
            const protyle = currentProtyle();
            if (protyle) {
                cmd.editorCallback(protyle);
            } else {
                void siyuan.pushMsg(tomatoI18n.请先打开一个文档);
            }
        }
    },
    display(ball: BallItem) {
        return ball.icon || "⚡";
    },
    tooltip(ball: BallItem) {
        return ball.label || findPluginCommand(ball.action?.cmdKey)?.langText || ball.action?.cmdKey || "cmd";
    },
};
