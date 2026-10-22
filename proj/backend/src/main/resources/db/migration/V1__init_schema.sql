-- Users
CREATE TABLE users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,
    user_role       VARCHAR(20)   NOT NULL DEFAULT 'USER',
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Job applications
CREATE TABLE job_applications (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT        NOT NULL,
    company_name    VARCHAR(150)  NOT NULL,
    job_role        VARCHAR(150)  NOT NULL,
    location_type   VARCHAR(20)   NOT NULL DEFAULT 'REMOTE',
    salary          VARCHAR(50),
    applied_date    DATE,
    status          VARCHAR(20)   NOT NULL DEFAULT 'APPLIED',
    source          VARCHAR(100),
    job_url         VARCHAR(500),
    notes           TEXT,
    follow_up_date  DATE,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_job_user_id ON job_applications(user_id);
CREATE INDEX idx_job_status ON job_applications(status);
CREATE INDEX idx_job_applied_date ON job_applications(applied_date);
CREATE INDEX idx_job_follow_up_date ON job_applications(follow_up_date);
CREATE INDEX idx_job_company_role ON job_applications(company_name, job_role);

-- Status change history (for timeline / audit)
CREATE TABLE status_history (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id          BIGINT        NOT NULL,
    old_status      VARCHAR(20),
    new_status      VARCHAR(20)   NOT NULL,
    changed_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_job FOREIGN KEY (job_id) REFERENCES job_applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_history_job_id ON status_history(job_id);

-- Attachments (resume, cover letter, etc.)
CREATE TABLE attachments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id          BIGINT        NOT NULL,
    file_name       VARCHAR(255)  NOT NULL,
    file_type       VARCHAR(30)   NOT NULL DEFAULT 'OTHER',
    file_path       VARCHAR(500)  NOT NULL,
    file_size_bytes BIGINT,
    uploaded_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attachment_job FOREIGN KEY (job_id) REFERENCES job_applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_attachment_job_id ON attachments(job_id);

-- Tags (per-user, reusable)
CREATE TABLE tags (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT        NOT NULL,
    name            VARCHAR(50)   NOT NULL,
    color           VARCHAR(20)   NOT NULL DEFAULT '#8763ff',
    CONSTRAINT fk_tag_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_tag_user_name UNIQUE (user_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Job <-> Tag join table
CREATE TABLE job_tags (
    job_id          BIGINT NOT NULL,
    tag_id          BIGINT NOT NULL,
    PRIMARY KEY (job_id, tag_id),
    CONSTRAINT fk_jobtag_job FOREIGN KEY (job_id) REFERENCES job_applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_jobtag_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Refresh tokens (for JWT refresh flow, allows revocation/logout)
CREATE TABLE refresh_tokens (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT        NOT NULL,
    token_hash      VARCHAR(255)  NOT NULL,
    expires_at      TIMESTAMP     NOT NULL,
    revoked         BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_refresh_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_token_hash ON refresh_tokens(token_hash);
