import { confirm } from "siyuan";
import { userToken } from "./stores";
import { resetKey } from "./user";
import { reloadSelfPlugin } from "./pluginReload";
import { stopClaimHeartbeat } from "./claimLease";

// 开发者本地调试：清 token 回未激活态（云端槽位不受影响，可随时「找回激活码」恢复）。
// 文案只面向本人，不走 i18n。必须 await 落盘再 reload：saveData 是异步写，
// 抢跑会让文件保持旧 token（2026-08-24 取消激活白点实测）。
export function deactivateDev() {
    confirm(
        "⚠️",
        "取消激活（仅开发者调试用）？云端槽位不受影响，可随时「找回激活码」恢复。",
        async () => {
            // 先熔断在途心跳：已发出的 renewOnce 若在 write("") 后返回，会把云端码写回
            stopClaimHeartbeat();
            await userToken.write("");
            resetKey();
            await reloadSelfPlugin();
        },
    );
}
