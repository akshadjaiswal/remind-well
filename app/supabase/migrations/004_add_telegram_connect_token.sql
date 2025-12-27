-- Add telegram_connect_token column to rw_users table
-- This enables secure, token-based user matching for Telegram connections

ALTER TABLE rw_users
ADD COLUMN IF NOT EXISTS telegram_connect_token TEXT UNIQUE;

-- Add index for fast token lookup during webhook processing
CREATE INDEX IF NOT EXISTS idx_telegram_connect_token
ON rw_users(telegram_connect_token)
WHERE telegram_connect_token IS NOT NULL;

-- Add expires_at for security (tokens expire after 24 hours)
ALTER TABLE rw_users
ADD COLUMN IF NOT EXISTS telegram_connect_token_expires_at TIMESTAMPTZ;

-- Add comment to document the purpose
COMMENT ON COLUMN rw_users.telegram_connect_token IS
'Unique token used to match Telegram /start commands to specific user accounts. Expires after 24 hours.';

COMMENT ON COLUMN rw_users.telegram_connect_token_expires_at IS
'Expiration timestamp for telegram_connect_token. Tokens are invalid after this time.';
