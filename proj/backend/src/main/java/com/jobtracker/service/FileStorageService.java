package com.jobtracker.service;

import com.jobtracker.exception.FileStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.uploads.dir}")
    private String uploadDir;

    private Path root;

    @PostConstruct
    public void init() {
        root = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new FileStorageException("Could not create upload directory", e);
        }
    }

    /**
     * Stores the file under a per-job subfolder and returns the relative path
     * (relative to the uploads root) to persist in the database.
     */
    public String store(Long jobId, MultipartFile file) {
        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());

        if (originalName.contains("..")) {
            throw new FileStorageException("Filename contains invalid path sequence: " + originalName);
        }

        String extension = "";
        int dot = originalName.lastIndexOf('.');
        if (dot >= 0) {
            extension = originalName.substring(dot);
        }
        String storedName = UUID.randomUUID() + extension;
        String relativePath = jobId + "/" + storedName;

        try {
            Path targetDir = root.resolve(String.valueOf(jobId));
            Files.createDirectories(targetDir);
            Path target = targetDir.resolve(storedName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new FileStorageException("Failed to store file " + originalName, e);
        }

        return relativePath;
    }

    public void delete(String relativePath) {
        try {
            Path target = root.resolve(relativePath).normalize();
            if (!target.startsWith(root)) {
                throw new FileStorageException("Invalid file path");
            }
            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new FileStorageException("Failed to delete file " + relativePath, e);
        }
    }

    public org.springframework.core.io.Resource loadAsResource(String relativePath) {
        try {
            Path target = root.resolve(relativePath).normalize();
            if (!target.startsWith(root)) {
                throw new FileStorageException("Invalid file path");
            }
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(target.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new FileStorageException("File not found: " + relativePath);
            }
            return resource;
        } catch (java.net.MalformedURLException e) {
            throw new FileStorageException("Invalid file path: " + relativePath, e);
        }
    }
}
