package com.jobtracker.controller;

import com.jobtracker.dto.response.TagResponse;
import com.jobtracker.entity.User;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.security.CurrentUser;
import com.jobtracker.service.TagService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
@Tag(name = "Tags", description = "User-defined labels for job applications")
public class TagController {

    private final TagService tagService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<TagResponse>> list() {
        return ResponseEntity.ok(tagService.list(CurrentUser.id()));
    }

    @PostMapping
    public ResponseEntity<TagResponse> create(@jakarta.validation.Valid @RequestBody TagCreateRequest request) {
        User userRef = userRepository.findById(CurrentUser.id())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TagResponse response = tagService.create(CurrentUser.id(), userRef, request.getName(), request.getColor());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tagService.delete(CurrentUser.id(), id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class TagCreateRequest {
        @NotBlank
        private String name;
        private String color;
    }
}
