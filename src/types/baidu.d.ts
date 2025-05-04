// https://app.quicktype.io/?l=ts

interface AIResponse {
    id: string;
    object: string;
    created: number;
    result: string;
    sentence_id: number;
    is_end: boolean;
    is_truncated: boolean;
    need_clear_history: boolean;
    finish_reason: string;
    usage: Usage;
}

interface Usage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

interface CalcTokensResponse {
    id: string;
    object: string;
    created: number;
    usage: CalcTokenUsage;
}

interface CalcTokenUsage {
    prompt_tokens: number;
    total_tokens: number;
}

type ChatRole = "user" | "assistant"
type Chat = { role: ChatRole, content: string, tokens: number }

interface AppConversationRunsResp {
    request_id: string;
    date: Date;
    answer: string;
    conversation_id: string;
    message_id: string;
    is_completion: null;
    content: AppConversationRunsContent[];
}

interface AppConversationRunsContent {
    result_type: string;
    event_code: number;
    event_message: string;
    event_type: string;
    event_id: string;
    event_status: string;
    content_type: string;
    visible_scope: string;
    outputs: AppConversationRunsContentOutputs;
    usage?: AppConversationRunsContentUsage;
}

interface AppConversationRunsContentOutputs {
    text?: AppConversationRunsContentTextClass | string;
    name_cn?: string;
    references?: AppConversationRunsContentReference[];
}

interface AppConversationRunsContentReference {
    id: string;
    content: string;
    type: string;
    from: string;
    title: string;
    segment_id: string;
    document_id: string;
    document_name: string;
    dataset_name: string;
    dataset_id: string;
}

interface AppConversationRunsContentTextClass {
    arguments: AppConversationRunsContentArguments;
    component_code: string;
    component_name: string;
}

interface AppConversationRunsContentArguments {
    origin_query: string;
}

interface AppConversationRunsContentUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    name: string;
    type: string;
}

interface DescribeDocumentsResp {
    requestId: string;
    marker: string;
    isTruncated: boolean;
    nextMarker: string;
    maxKeys: number;
    data: DescribeDocumentsDocument[];
}

interface DescribeDocumentsDocument {
    id: string;
    name: string;
    sy_doc_id: string;
    sy_exists: boolean;
    createdAt: number;
    wordCount: number;
    enabled: boolean;
    meta: DescribeDocumentsMeta;
}

interface DescribeDocumentsMeta {
    source: string;
    fileId: string;
}