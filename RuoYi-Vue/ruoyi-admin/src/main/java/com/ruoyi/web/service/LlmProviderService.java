package com.ruoyi.web.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

/**
 * 管理端智能助手使用的大模型入口：openai-compatible（如 LM Studio）；可选 ollama（需在代码中改 provider）。
 */
@Service
public class LlmProviderService {

    private static final Logger log = LoggerFactory.getLogger(LlmProviderService.class);

    public static final String PROVIDER_OLLAMA = "ollama";
    public static final String PROVIDER_OPENAI_COMPAT = "openai-compatible";

    @Value("${ruoyi.llm.provider:openai-compatible}")
    private String provider;

    @Autowired
    private OllamaService ollamaService;

    @Autowired
    private OpenAiCompatibleLlmService openAiCompatibleLlmService;

    @PostConstruct
    public void logProvider() {
        log.info("智能助手 LLM 提供方: {}", provider == null ? PROVIDER_OPENAI_COMPAT : provider.trim());
    }

    private boolean useOpenAiCompat() {
        return PROVIDER_OPENAI_COMPAT.equalsIgnoreCase(trimProvider());
    }

    private String trimProvider() {
        return provider == null ? PROVIDER_OPENAI_COMPAT : provider.trim();
    }

    public String generate(String prompt, String systemPrompt) {
        if (useOpenAiCompat()) {
            return openAiCompatibleLlmService.generate(prompt, systemPrompt);
        }
        return ollamaService.generate(prompt, systemPrompt);
    }

    public void generateStream(String prompt, String systemPrompt, LlmStreamCallback callback) {
        if (useOpenAiCompat()) {
            openAiCompatibleLlmService.generateStream(prompt, systemPrompt, callback);
        } else {
            ollamaService.generateStream(prompt, systemPrompt, callback);
        }
    }

    public boolean healthCheck() {
        if (useOpenAiCompat()) {
            return openAiCompatibleLlmService.healthCheck();
        }
        return ollamaService.healthCheck();
    }

    /** 当前配置（用于日志或扩展接口） */
    public String getActiveProvider() {
        return trimProvider();
    }
}
