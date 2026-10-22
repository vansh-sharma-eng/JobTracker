package com.jobtracker.service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;

/**
 * Thin client for the Anthropic Messages API (no extra dependencies - uses the JDK HttpClient).
 *
 * Disabled automatically when ANTHROPIC_API_KEY is not set; callers then fall back
 * to the built-in rule-based logic. Any failure (network, HTTP error, bad JSON)
 * returns Optional.empty() so the app never breaks because the AI is unavailable.
 */
@Component
@Slf4j
public class LlmClient {

    private static final int MAX_INPUT_CHARS = 12_000;

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.model:claude-sonnet-5-5}")
    private String model;

    @Value("${app.ai.base-url:https://api.anthropic.com}")
    private String baseUrl;

    @Value("${app.ai.timeout-seconds:45}")
    private int timeoutSeconds;

    @Value("${app.ai.max-output-tokens:2000}")
    private int maxOutputTokens;

    private final ObjectMapper mapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public boolean isEnabled() {
        return apiKey != null && !apiKey.isBlank();
    }

    /** Caps untrusted text so one request cannot send (and bill) a huge prompt. */
    public static String clip(String text) {
        if (text == null) return "";
        return text.length() <= MAX_INPUT_CHARS ? text : text.substring(0, MAX_INPUT_CHARS);
    }

    /**
     * Asks the model for a JSON object and maps it onto {@code type}.
     *
     * @param system     instructions (trusted)
     * @param userPrompt task + user data (user data must already be wrapped in tags by the caller)
     */
    public <T> Optional<T> generate(String system, String userPrompt, Class<T> type) {
        if (!isEnabled()) return Optional.empty();
        try {
            Map<String, Object> body = Map.of(
                    "model", model,
                    "max_tokens", maxOutputTokens,
                    "system", system,
                    "messages", java.util.List.of(Map.of("role", "user", "content", userPrompt))
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/v1/messages"))
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .header("content-type", "application/json")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                // Log status only - never log the key or full prompt.
                log.warn("LLM call failed with HTTP {}", response.statusCode());
                return Optional.empty();
            }

            JsonNode root = mapper.readTree(response.body());
            String text = root.path("content").path(0).path("text").asText("");
            return Optional.ofNullable(mapper.readValue(extractJson(text), type));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("LLM call interrupted");
            return Optional.empty();
        } catch (Exception e) {
            log.warn("LLM call failed: {}", e.getClass().getSimpleName());
            return Optional.empty();
        }
    }

    /** Models sometimes wrap JSON in ```json fences or add a sentence around it. */
    static String extractJson(String text) {
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start < 0 || end <= start) {
            throw new IllegalArgumentException("No JSON object in model output");
        }
        return text.substring(start, end + 1);
    }
}
