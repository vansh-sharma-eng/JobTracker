package com.jobtracker.repository;

import com.jobtracker.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long>,
        JpaSpecificationExecutor<JobApplication> {

    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);

    List<JobApplication> findByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, JobApplication.JobStatus status);

    long countByUserId(Long userId);

    List<JobApplication> findByUserIdAndFollowUpDateLessThanEqualAndStatusNot(
            Long userId, LocalDate date, JobApplication.JobStatus excludedStatus);

    @Query("select j.status as status, count(j) as count from JobApplication j where j.user.id = :userId group by j.status")
    List<StatusCount> countGroupedByStatus(@Param("userId") Long userId);

    @Query("select function('date', j.createdAt) as day, count(j) as count from JobApplication j " +
           "where j.user.id = :userId and j.createdAt >= :since group by function('date', j.createdAt) order by day")
    List<DayCount> countGroupedByDaySince(@Param("userId") Long userId, @Param("since") java.time.LocalDateTime since);

    interface StatusCount {
        JobApplication.JobStatus getStatus();
        Long getCount();
    }

    interface DayCount {
        java.sql.Date getDay();
        Long getCount();
    }
}
