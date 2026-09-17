<script lang="ts">
    // 设置域组件（prefixui □3 起）：通用——「快捷键与开关」卡已退役（confgather2 期1
    // 2026-09-17，bear 拍板「配置跟功能走不按类型归类」：折叠/展开两行键帽归位编辑器
    // 工具域块折叠卡〔foldCmd 就是块折叠命令〕、复制ID 行归位编辑器工具域文档别名卡、
    // 右键菜单「全部显示」兜底钮迁杂项域头部〔菜单管理=杂事〕）。本域只剩「打开番茄
    // 设置」键帽一行——自指合理：番茄设置的入口就在番茄设置里。
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import { tomatoSettingsOpenHK } from "./libs/entryHotkeys";
</script>

    <!-- 通用（confgather2 期1：按类型集中的尾巴卡退役，仅存自指键帽行） -->
    <div class="settingBox">
        <div class="section-title">{tomatoI18n.通用}<ConfHelpIcon token="XyFPdPBbsol477xl5TFcX9Ttn2e" /></div>
        <div>
            {tomatoSettingsOpenHK.langText()}<HotkeyCap hk={tomatoSettingsOpenHK} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
    </div>
