package com.ruoyi.web.service;

/**
 * 大模型流式输出回调（Ollama 与 OpenAI 兼容接口共用）
 */
public interface LlmStreamCallback {

    void onChunk(String chunk);

    void onComplete();

    void onError(String error);
}
