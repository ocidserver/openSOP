-- Add new UserRole enum values
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPERVISOR';

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PIMPINAN_TINGGI_UTAMA';

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PIMPINAN_TINGGI_MADYA';

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PIMPINAN_TINGGI_PRATAMA';

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'STAFF';

-- Update existing records with old values to new values
UPDATE users SET role = 'SUPERVISOR' WHERE role = 'MANAGER';

UPDATE users SET role = 'STAFF' WHERE role = 'REVIEWER';

-- Note: We cannot remove enum values directly in PostgreSQL
-- They will remain in the enum type but won't be used