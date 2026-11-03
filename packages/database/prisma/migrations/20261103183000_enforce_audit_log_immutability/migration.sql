-- Create trigger function to enforce strict immutability on admin_audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'AdminAuditLog entries are strictly immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

-- Bind trigger on UPDATE and DELETE to ensure append-only audit trail
DROP TRIGGER IF EXISTS trg_prevent_audit_log_update_delete ON "admin_audit_logs";
CREATE TRIGGER trg_prevent_audit_log_update_delete
BEFORE UPDATE OR DELETE ON "admin_audit_logs"
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_modification();

