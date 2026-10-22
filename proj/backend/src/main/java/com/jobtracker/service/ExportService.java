package com.jobtracker.service;

import com.jobtracker.entity.JobApplication;
import com.jobtracker.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final JobApplicationRepository jobRepository;

    @Transactional(readOnly = true)
    public byte[] exportCsv(Long userId) {
        Specification<JobApplication> spec = (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
        List<JobApplication> jobs = jobRepository.findAll(spec);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            writer.println("Company,Role,Location,Salary,Applied Date,Status,Source,Follow Up Date,Tags,Notes");
            for (JobApplication job : jobs) {
                String tags = job.getTags().stream().map(t -> t.getName()).collect(Collectors.joining(";"));
                writer.println(String.join(",",
                        csv(job.getCompanyName()),
                        csv(job.getRole()),
                        csv(job.getLocationType().name()),
                        csv(job.getSalary()),
                        csv(job.getAppliedDate() == null ? "" : job.getAppliedDate().toString()),
                        csv(job.getStatus().name()),
                        csv(job.getSource()),
                        csv(job.getFollowUpDate() == null ? "" : job.getFollowUpDate().toString()),
                        csv(tags),
                        csv(job.getNotes())
                ));
            }
        }
        return out.toByteArray();
    }

    private String csv(String value) {
        if (value == null) return "";
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\n") || escaped.contains("\"")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }
}
