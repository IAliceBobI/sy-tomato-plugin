import type { ILogger } from "siyuan/kernel";
import { createMcpRegistry, type ToolDefinition } from "./kernel/tools";

// 内核插件入口：kernel.js 在内核进程的 goja 虚拟机里执行（v3.7.0+，plugin.json 的 kernels
// 字段门控加载）。全局 siyuan 由内核注入（plugin/lifecycle/logger/storage/rpc/agent），
// 其类型随 "siyuan/kernel" 的 import type 引入（declare global）。
class KernelPlugin {
  private readonly logger: ILogger;
  private registeredToolNames: string[] = [];

  constructor() {
    this.logger = siyuan.logger;
    siyuan.plugin.lifecycle.onload = this.onload.bind(this);
    // 内核对三个 lifecycle 钩子无条件 AssertFunction（null 也会报 not bound），必须绑函数
    siyuan.plugin.lifecycle.onrunning = async () => {};
    siyuan.plugin.lifecycle.onunload = this.onunload.bind(this);
  }

  // 现役通道=siyuan.agent.registerCapability；siyuan.mcp.registerTool 是更老内核的兼容
  // 形态。两通道都没有（理论上 kernel.js 只在 v3.7.0+ 加载，此为防御兜底）时抛错由调用方跳过。
  private async registerCapability(name: string, config: any, handler: any): Promise<any> {
    // kernel.d.ts 的 declare global 是 const 声明（不挂 typeof globalThis），通道探测须 any 视图
    const s = siyuan as any;
    if (s?.agent && typeof s.agent.registerCapability === "function") {
      return await s.agent.registerCapability(name, config, handler);
    }
    if (s?.mcp && typeof s.mcp.registerTool === "function") {
      return await s.mcp.registerTool(name, config, handler);
    }
    throw new Error("no MCP registration channel on this kernel");
  }

  private async unregisterCapability(name: string): Promise<void> {
    const s = siyuan as any;
    if (s?.agent && typeof s.agent.unregisterCapability === "function") {
      await s.agent.unregisterCapability(name);
    } else if (s?.mcp && typeof s.mcp.unregisterTool === "function") {
      await s.mcp.unregisterTool(name);
    }
  }

  private async onload(): Promise<void> {
    const registry: ToolDefinition[] = createMcpRegistry();
    for (const tool of registry) {
      try {
        const registered = await this.registerCapability(tool.name, tool.config, tool.handler);
        this.registeredToolNames.push(tool.name);
        await this.logger.info("[kernel] registered tool:", registered?.name ?? tool.name);
      } catch (error: any) {
        // 注册失败不炸生命周期：记录后继续，前端产物与内核其余面不受影响
        await this.logger.error(`[kernel] register tool ${tool.name} failed:`, error);
      }
    }
  }

  private async onunload(): Promise<void> {
    for (const name of this.registeredToolNames) {
      try {
        await this.unregisterCapability(name);
      } catch (error: any) {
        await this.logger.error(`[kernel] unregister tool ${name} failed:`, error);
      }
    }
    this.registeredToolNames = [];
  }
}

new KernelPlugin();
