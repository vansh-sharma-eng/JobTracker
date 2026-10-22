package com.jobtracker.repository;

import com.jobtracker.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByJobApplicationId(Long jobId);
    Optional<Attachment> findByIdAndJobApplicationId(Long id, Long jobId);
}
