package com.jobtracker.util;

import com.jobtracker.entity.JobApplication;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class JobSpecifications {

    private JobSpecifications() {}

    public static Specification<JobApplication> forUser(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<JobApplication> withStatus(JobApplication.JobStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<JobApplication> withLocationType(JobApplication.LocationType locationType) {
        return (root, query, cb) -> locationType == null ? null : cb.equal(root.get("locationType"), locationType);
    }

    public static Specification<JobApplication> withSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String like = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("companyName")), like),
                    cb.like(cb.lower(root.get("role")), like)
            );
        };
    }

    public static Specification<JobApplication> appliedBetween(LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (from != null) predicates.add(cb.greaterThanOrEqualTo(root.get("appliedDate"), from));
            if (to != null) predicates.add(cb.lessThanOrEqualTo(root.get("appliedDate"), to));
            if (predicates.isEmpty()) return null;
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<JobApplication> withTag(String tagName) {
        return (root, query, cb) -> {
            if (tagName == null || tagName.isBlank()) return null;
            query.distinct(true);
            return cb.equal(cb.lower(root.join("tags").get("name")), tagName.toLowerCase());
        };
    }
}
