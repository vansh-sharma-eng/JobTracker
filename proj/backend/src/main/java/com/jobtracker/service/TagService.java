package com.jobtracker.service;

import com.jobtracker.dto.response.TagResponse;
import com.jobtracker.entity.Tag;
import com.jobtracker.entity.User;
import com.jobtracker.exception.DuplicateResourceException;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    @Transactional(readOnly = true)
    public List<TagResponse> list(Long userId) {
        return tagRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TagResponse create(Long userId, User userRef, String name, String color) {
        tagRepository.findByUserIdAndNameIgnoreCase(userId, name).ifPresent(t -> {
            throw new DuplicateResourceException("Tag already exists: " + name);
        });
        Tag tag = Tag.builder()
                .user(userRef)
                .name(name.trim())
                .color(color == null || color.isBlank() ? "#8763ff" : color)
                .build();
        return toResponse(tagRepository.save(tag));
    }

    @Transactional
    public void delete(Long userId, Long tagId) {
        Tag tag = tagRepository.findByIdAndUserId(tagId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));
        tagRepository.delete(tag);
    }

    private TagResponse toResponse(Tag tag) {
        return TagResponse.builder().id(tag.getId()).name(tag.getName()).color(tag.getColor()).build();
    }
}
