-- ============================================================================
-- MAVI CORE: AI-POWERED DIGITAL WORK INSTRUCTION (DIGITAL WI) SCHEMA
-- ============================================================================
-- Supports complete lifecycle: Draft -> Pending Approval -> Approved -> Published -> Superseded
-- Includes Step Checkpoints (Checklist, Numeric min/max, OK/NG, Barcode),
-- Station QR Deployments, and Operator Execution Records (Audit Traceability).
-- ============================================================================

-- 1. Master Work Instructions
CREATE TABLE IF NOT EXISTS public.work_instructions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_number VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    part_number VARCHAR(100),
    part_name VARCHAR(255),
    process_name VARCHAR(150),
    department VARCHAR(100) DEFAULT 'Assembly',
    current_revision VARCHAR(20) DEFAULT 'Rev A',
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Pending Approval, Approved, Published, Superseded, Obsolete
    description TEXT,
    source_pdf_name VARCHAR(255),
    source_pdf_url TEXT,
    created_by VARCHAR(100) DEFAULT 'Engineer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Work Instruction Revisions (Immutable once Approved/Published)
CREATE TABLE IF NOT EXISTS public.work_instruction_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wi_id UUID REFERENCES public.work_instructions(id) ON DELETE CASCADE,
    revision VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Pending Approval, Approved, Published, Superseded, Obsolete
    change_summary TEXT,
    author VARCHAR(100),
    approver VARCHAR(100),
    approval_date TIMESTAMPTZ,
    published_date TIMESTAMPTZ,
    effective_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(wi_id, revision)
);

-- 3. Steps per Revision
CREATE TABLE IF NOT EXISTS public.work_instruction_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wi_id UUID REFERENCES public.work_instructions(id) ON DELETE CASCADE,
    revision_id UUID REFERENCES public.work_instruction_revisions(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    instruction TEXT NOT NULL,
    source_pages JSONB DEFAULT '[]'::jsonb, -- e.g. [1, 2]
    images JSONB DEFAULT '[]'::jsonb, -- Image URLs or base64 previews
    tools JSONB DEFAULT '[]'::jsonb, -- e.g. ["Torque Wrench 25Nm", "Caliper"]
    materials JSONB DEFAULT '[]'::jsonb, -- e.g. ["O-Ring Seal NBR-70", "M8 Bolt"]
    safety_warnings JSONB DEFAULT '[]'::jsonb, -- e.g. ["Wear Safety Glasses", "High Pressure Danger"]
    checkpoints JSONB DEFAULT '[]'::jsonb, -- e.g. [{id, type, label, required, min, max, unit}]
    cycle_time_target_sec INT DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Station Deployments & QR Code Mapping
CREATE TABLE IF NOT EXISTS public.work_instruction_station_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wi_id UUID REFERENCES public.work_instructions(id) ON DELETE CASCADE,
    station_id VARCHAR(100) NOT NULL,
    station_name VARCHAR(150),
    line_name VARCHAR(150),
    process_code VARCHAR(100),
    active_revision VARCHAR(20) NOT NULL,
    access_token VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    deployed_by VARCHAR(100),
    deployed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Approval Sign-off Logs
CREATE TABLE IF NOT EXISTS public.work_instruction_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wi_id UUID REFERENCES public.work_instructions(id) ON DELETE CASCADE,
    revision VARCHAR(20) NOT NULL,
    approver_name VARCHAR(100) NOT NULL,
    approver_role VARCHAR(100) DEFAULT 'Quality Manager',
    action VARCHAR(50) NOT NULL, -- Approved, Rejected, Revision Requested
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Operator Executions (Shop Floor Production Records)
CREATE TABLE IF NOT EXISTS public.work_instruction_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wi_id UUID REFERENCES public.work_instructions(id) ON DELETE SET NULL,
    revision VARCHAR(20) NOT NULL,
    station_id VARCHAR(100),
    work_order_id VARCHAR(100),
    serial_number VARCHAR(100),
    part_number VARCHAR(100),
    operator_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Completed', -- In Progress, Completed, Aborted, Defect Found
    start_time TIMESTAMPTZ NOT NULL,
    completion_time TIMESTAMPTZ,
    duration_seconds INT DEFAULT 0,
    overall_quality VARCHAR(20) DEFAULT 'PASS', -- PASS, FAIL, REWORK
    step_results JSONB DEFAULT '[]'::jsonb, -- Complete array of recorded inputs, measurements, OK/NG
    defect_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Audit Trail Logs (ISO 9001 / IATF 16949 Compliance)
CREATE TABLE IF NOT EXISTS public.work_instruction_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wi_id UUID REFERENCES public.work_instructions(id) ON DELETE CASCADE,
    doc_number VARCHAR(100),
    action VARCHAR(100) NOT NULL, -- CREATED, EDITED, SUBMITTED_FOR_APPROVAL, APPROVED, PUBLISHED, SUPERSEDED, EXECUTED
    user_name VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_wi_doc_number ON public.work_instructions(doc_number);
CREATE INDEX IF NOT EXISTS idx_wi_status ON public.work_instructions(status);
CREATE INDEX IF NOT EXISTS idx_wi_part_number ON public.work_instructions(part_number);
CREATE INDEX IF NOT EXISTS idx_wi_steps_wi_id ON public.work_instruction_steps(wi_id);
CREATE INDEX IF NOT EXISTS idx_wi_executions_wi_id ON public.work_instruction_executions(wi_id);
CREATE INDEX IF NOT EXISTS idx_wi_executions_station ON public.work_instruction_executions(station_id);
CREATE INDEX IF NOT EXISTS idx_wi_station_map ON public.work_instruction_station_assignments(station_id, active_revision);
