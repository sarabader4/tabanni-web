-- Performance indexes for common query patterns
-- Composite index for the main pets listing query (approved=true, status filter, sorted by created_at)
CREATE INDEX IF NOT EXISTS "pets_listing_idx" ON "pets" ("approved", "status", "created_at" DESC);

-- Individual indexes for filtering by purpose and type
CREATE INDEX IF NOT EXISTS "pets_purpose_idx" ON "pets" ("purpose");
CREATE INDEX IF NOT EXISTS "pets_type_idx" ON "pets" ("type");

-- Indexes for lost_found_reports filtering by report_type and status
CREATE INDEX IF NOT EXISTS "lost_found_report_type_idx" ON "lost_found_reports" ("report_type");
CREATE INDEX IF NOT EXISTS "lost_found_status_idx" ON "lost_found_reports" ("status");
-- Composite index for the common query pattern: filter by report_type AND status together
CREATE INDEX IF NOT EXISTS "lost_found_type_status_idx" ON "lost_found_reports" ("report_type", "status");
