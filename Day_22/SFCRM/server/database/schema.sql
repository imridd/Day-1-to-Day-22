
-- =====================================================
-- CLOUDBRIDGE CRM
-- FULLY RELATIONAL MYSQL DATABASE
-- =====================================================

CREATE DATABASE IF NOT EXISTS cloudbridge_crm_relational
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE cloudbridge_crm_relational;

-- =====================================================
-- 1. USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    initials VARCHAR(10),
    color VARCHAR(20)
);

-- =====================================================
-- 2. ACCOUNTS
-- =====================================================

CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(18) PRIMARY KEY,
    owner_id VARCHAR(10) NOT NULL,

    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255),
    phone VARCHAR(30),
    annual_revenue DECIMAL(15,2),
    billing_city VARCHAR(100),

    created_date DATETIME(3) NOT NULL,
    last_modified_date DATETIME(3) NOT NULL,

    CONSTRAINT fk_accounts_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id),

    INDEX idx_accounts_name (name),
    INDEX idx_accounts_owner (owner_id),
    INDEX idx_accounts_industry (industry)
);

-- =====================================================
-- 3. LEADS
-- =====================================================

CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(18) PRIMARY KEY,
    owner_id VARCHAR(10) NOT NULL,

    first_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    status VARCHAR(50),
    lead_source VARCHAR(50),
    rating VARCHAR(30),
    industry VARCHAR(100),

    created_date DATETIME(3) NOT NULL,
    last_modified_date DATETIME(3) NOT NULL,

    CONSTRAINT fk_leads_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id),

    INDEX idx_leads_name (last_name, first_name),
    INDEX idx_leads_company (company),
    INDEX idx_leads_status (status),
    INDEX idx_leads_owner (owner_id)
);

-- =====================================================
-- 4. CONTACTS
-- =====================================================

CREATE TABLE IF NOT EXISTS contacts (
    id VARCHAR(18) PRIMARY KEY,
    owner_id VARCHAR(10) NOT NULL,
    account_id VARCHAR(18),

    first_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    title VARCHAR(150),

    created_date DATETIME(3) NOT NULL,
    last_modified_date DATETIME(3) NOT NULL,

    CONSTRAINT fk_contacts_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id),

    CONSTRAINT fk_contacts_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON DELETE SET NULL,

    INDEX idx_contacts_name (last_name, first_name),
    INDEX idx_contacts_email (email),
    INDEX idx_contacts_account (account_id),
    INDEX idx_contacts_owner (owner_id)
);

-- =====================================================
-- 5. OPPORTUNITIES
-- =====================================================

CREATE TABLE IF NOT EXISTS opportunities (
    id VARCHAR(18) PRIMARY KEY,
    owner_id VARCHAR(10) NOT NULL,
    account_id VARCHAR(18) NOT NULL,

    name VARCHAR(255) NOT NULL,
    stage_name VARCHAR(50),
    amount DECIMAL(15,2),
    close_date DATE NOT NULL,
    probability INT,

    created_date DATETIME(3) NOT NULL,
    last_modified_date DATETIME(3) NOT NULL,

    CONSTRAINT fk_opportunities_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id),

    CONSTRAINT fk_opportunities_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id),

    CONSTRAINT chk_opportunity_probability
        CHECK (probability IS NULL OR probability BETWEEN 0 AND 100),

    INDEX idx_opportunities_name (name),
    INDEX idx_opportunities_stage (stage_name),
    INDEX idx_opportunities_account (account_id),
    INDEX idx_opportunities_owner (owner_id),
    INDEX idx_opportunities_close_date (close_date)
);

-- =====================================================
-- 6. CASES
-- =====================================================

CREATE TABLE IF NOT EXISTS cases (
    id VARCHAR(18) PRIMARY KEY,
    owner_id VARCHAR(10) NOT NULL,
    account_id VARCHAR(18),
    contact_id VARCHAR(18),

    case_number VARCHAR(30) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50),
    priority VARCHAR(30),
    origin VARCHAR(30),

    created_date DATETIME(3) NOT NULL,
    last_modified_date DATETIME(3) NOT NULL,

    CONSTRAINT fk_cases_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id),

    CONSTRAINT fk_cases_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_cases_contact
        FOREIGN KEY (contact_id)
        REFERENCES contacts(id)
        ON DELETE SET NULL,

    INDEX idx_cases_subject (subject),
    INDEX idx_cases_status (status),
    INDEX idx_cases_priority (priority),
    INDEX idx_cases_account (account_id),
    INDEX idx_cases_contact (contact_id),
    INDEX idx_cases_owner (owner_id)
);

-- =====================================================
-- 7. TASKS
-- =====================================================

CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(18) PRIMARY KEY,
    owner_id VARCHAR(10) NOT NULL,

    subject VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    priority VARCHAR(30),
    activity_date DATE,

    related_account_id VARCHAR(18),
    related_contact_id VARCHAR(18),
    related_lead_id VARCHAR(18),
    related_opportunity_id VARCHAR(18),
    related_case_id VARCHAR(18),

    created_date DATETIME(3) NOT NULL,
    last_modified_date DATETIME(3) NOT NULL,

    CONSTRAINT fk_tasks_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id),

    CONSTRAINT fk_tasks_account
        FOREIGN KEY (related_account_id)
        REFERENCES accounts(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_tasks_contact
        FOREIGN KEY (related_contact_id)
        REFERENCES contacts(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_tasks_lead
        FOREIGN KEY (related_lead_id)
        REFERENCES leads(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_tasks_opportunity
        FOREIGN KEY (related_opportunity_id)
        REFERENCES opportunities(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_tasks_case
        FOREIGN KEY (related_case_id)
        REFERENCES cases(id)
        ON DELETE SET NULL,

    INDEX idx_tasks_subject (subject),
    INDEX idx_tasks_status (status),
    INDEX idx_tasks_activity_date (activity_date),
    INDEX idx_tasks_owner (owner_id)
);
-- =====================================================
-- 8. AUDIT LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(32) PRIMARY KEY,
    at DATETIME(3) NOT NULL,

    actor_id VARCHAR(10) NOT NULL,
    actor_name VARCHAR(100),

    object_name VARCHAR(50) NOT NULL,
    operation VARCHAR(30) NOT NULL,
    record_id VARCHAR(18),

    label VARCHAR(255),
    details TEXT,

    CONSTRAINT fk_audit_actor
        FOREIGN KEY (actor_id)
        REFERENCES users(id),

    INDEX idx_audit_at (at),
    INDEX idx_audit_actor (actor_id),
    INDEX idx_audit_object (object_name),
    INDEX idx_audit_record (record_id)
);

-- =====================================================
-- 9. WORKFLOW RUNS
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_runs (
    id VARCHAR(64) PRIMARY KEY,

    name VARCHAR(150) NOT NULL,
    trigger_id VARCHAR(18),
    action_description VARCHAR(500),
    at DATETIME(3) NOT NULL,

    INDEX idx_workflow_trigger (trigger_id),
    INDEX idx_workflow_at (at)
);

-- =====================================================
-- END OF SCHEMA
-- =====================================================
