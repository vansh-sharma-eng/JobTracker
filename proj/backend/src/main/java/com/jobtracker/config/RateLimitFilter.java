package com.jobtracker.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory fixed-window rate limiter for sensitive auth endpoints
 * (register/login/refresh/logout). Limits each client IP to a fixed number
 * of requests per rolling window.
 *
 * Intentionally dependency-free. For a multi-instance deployment, replace
 * the in-memory map with a shared store (e.g. Redis) so limits are enforced
 * consistently across instances.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    @org.springframework.beans.factory.annotation.Value("${app.rate-limit.enabled:true}")
    private boolean enabled = true;

    @org.springframework.beans.factory.annotation.Value("${app.rate-limit.max-requests:100}")
    private int maxRequests = 100;

    private static final long WINDOW_MILLIS = 60_000L; // 1 minute

    private final ConcurrentMap<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {

        if (enabled && request.getRequestURI().startsWith("/api/v1/auth/")) {
            String key = clientIp(request);
            Window window = windows.computeIfAbsent(key, k -> new Window());

            if (!window.tryConsume(maxRequests)) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded, please try again later\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /** Fixed-window counter that resets itself once the window elapses. */
    private static final class Window {
        private volatile long windowStart = Instant.now().toEpochMilli();
        private final AtomicInteger count = new AtomicInteger(0);

        synchronized boolean tryConsume(int limit) {
            long now = Instant.now().toEpochMilli();
            if (now - windowStart > WINDOW_MILLIS) {
                windowStart = now;
                count.set(0);
            }
            return count.incrementAndGet() <= limit;
        }
    }
}
