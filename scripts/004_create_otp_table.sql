-- OTP Codes Table for Email Authentication
-- This table stores one-time passwords sent to users for login

CREATE TABLE IF NOT EXISTS otp_codes (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);

-- Index for expiry cleanup
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);

-- Cleanup function to delete expired OTPs (optional, can be run as a cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;
