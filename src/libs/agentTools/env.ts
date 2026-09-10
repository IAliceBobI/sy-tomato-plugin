// ToolEnv：工具核心与运行环境之间唯一的水线（A 层同源化，ai-agent □1）。
// kernel 实现=siyuan.client.fetch + siyuan.storage；前端实现=siyuanApi fetch + plugin.loadData。
// 两边读写同一份数据（SQL 索引库 / data/storage/petal/<插件>/），故同一工具双门脸结果一致。

export interface ToolEnv {
  /** 跑一条 SQL 查询（只读面；写操作工具后续期再扩本接口）。
   *  失败语义：抛异常（wrapHandler 统一兜成 errorResponse），成功恒返回数组——
   *  两边实现都不得吞错回空数组（假零比报错更危险，09-10 review P1）。 */
  sql<T = any>(stmt: string): Promise<T[]>;
  /**
   * 读插件 petal 存储里的 JSON 文件（根=data/storage/petal/<插件>/）。
   * 契约：返回解析后的 JSON 对象/数组；文件不存在、坏 JSON、标量负载一律兜成 null，
   * 不抛异常（由实现方兜）。
   */
  readPluginJson(path: string): Promise<any>;
  /**
   * 调内核 HTTP API（POST JSON，普通权限面；□2 起）。契约：code 0 即成功，data 原样返回
   * （可 null）；非 0 code / HTTP 失败 / 响应畸形一律抛异常（同 sql 失败语义，勿吞）。
   * ⚠️ 仅限 data 恒非 null 的读类端点（检索/查询/配置读）——写类端点 data 恒 null，
   * 调用方无法区分成功与失败，后续期若需写操作应另扩专用通道（review P1-2 立牌）。
   */
  postApi(path: string, payload: Record<string, any>): Promise<any>;
  /**
   * 探测语义检索可用性（□2）。判据复制自内核 isEmbeddingEnabled（embedding.go:589）：
   * ai.embedding 存在 + enabled + apiKey 非空。探测失败一律回 available:false
   * （降级方向安全：最多误降级到关键词，不会误报可用）。
   */
  semanticSearchAvailable(): Promise<{ available: boolean }>;
  /**
   * 外网 HTTP 能力（□3）：kernel goja 无 fetch 物理不可达外部域名（如 api.coze.cn）。
   * false 时依赖外网的工具（coze）不装配进该门脸的工具列表（诚实裁剪，勿给 AI 一个
   * 永远失败的工具）。
   */
  canExternalHttp: boolean;
  /**
   * POST 外部 HTTP API（JSON in/out），失败抛异常。Coze 业务码在 body.code（HTTP 仍 200），
   * 由工具层判读。
   */
  postExternal(url: string, body: any, headers?: Record<string, string>): Promise<any>;
  /**
   * GET 外部 HTTP API（JSON out），失败抛异常；query 串进 url。Coze v3 的查对话详情
   * （/v3/chat/retrieve）与消息列表（/v3/chat/message/list）都是 GET+query 形态（09-10
   * 官方文档实锤），postExternal 覆盖不了。
   */
  getExternal(url: string, headers?: Record<string, string>): Promise<any>;
  /**
   * 取思源文档树的 markdown（docID 及其全部子文档，每行 {id,content,markdown}）。
   * 前端实现走文档导出链；kernel 无此通道（canExternalHttp=false 的门脸不会用到）。
   */
  getDocTreeMarkdown(docID: string): Promise<{ id: string; content: string; markdown: string }[]>;
  /** Coze 配置（token/knowledgeID/appID；空串=未配置） */
  getCozeConfig(): Promise<{ token: string; knowledgeID: string; appID: string }>;
  /**
   * 写块通道（□6 受控编辑；可选面=能力水线）：只由前端门脸实现（面板确认闸之后）；
   * kernel env 不实现 → edit 工具不装配进 MCP 面，外部 Agent 恒无写权限。
   * 成功返回 {markdown}（新内容），失败抛异常。
   */
  writeBlock?(blockID: string, markdown: string): Promise<{ markdown: string }>;
  /**
   * 用户 JS 执行面（□6 run_js；可选面）：前端 window 域 new Function + 5s 超时。
   * ⚠️ 非安全沙箱（同域 JS 隔离不了 DOM）——真防线=面板调用前的代码人审确认闸。
   * kernel env 不实现 → run_js 不进 MCP 面。返回序列化结果，失败抛异常。
   */
  runUserJS?(code: string): Promise<{ result: string }>;
  /** 读块 markdown（□6 edit 的预览/撤销快照用；kernel 可实现=纯读） */
  readBlockMarkdown?(blockID: string): Promise<{ markdown: string }>;
}
