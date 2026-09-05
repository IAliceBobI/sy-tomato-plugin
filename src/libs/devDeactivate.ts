import { confirm } from "siyuan";
import { userToken } from "./stores";
import { resetKey } from "./user";
import { reloadSelfPlugin } from "./pluginReload";

// 开发者本地调试：清 token 回未激活态（云端槽位不受影响，可随时「找回激活码」恢复）。
// 文案只面向本人，不走 i18n。必须 await 落盘再 reload：saveData 是异步写，
// 抢跑会让文件保持旧 token（2026-08-24 取消激活白点实测）。
export function deactivateDev() {
    confirm(
        "⚠️",
        "取消激活（仅开发者调试用）？云端槽位不受影响，可随时「找回激活码」恢复。",
        async () => {
            await userToken.write("");
            resetKey();
            await reloadSelfPlugin();
        },
    );
}
