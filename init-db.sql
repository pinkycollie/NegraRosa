-- NegraRosa Database Initialization
-- MBTQ Ecosystem with DeafAUTH Support

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create additional tables for DeafAUTH and PinkSync

-- DeafAUTH accessibility preferences
CREATE TABLE IF NOT EXISTS accessibility_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    visual_alerts BOOLEAN DEFAULT TRUE,
    high_contrast BOOLEAN DEFAULT FALSE,
    large_text BOOLEAN DEFAULT FALSE,
    haptic_feedback BOOLEAN DEFAULT TRUE,
    sign_language_preference VARCHAR(10),
    reduced_motion BOOLEAN DEFAULT FALSE,
    captions_enabled BOOLEAN DEFAULT TRUE,
    flashing_disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- DeafAUTH sessions
CREATE TABLE IF NOT EXISTS deafauth_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(128) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    method VARCHAR(50) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

-- DeafAUTH visual patterns
CREATE TABLE IF NOT EXISTS visual_patterns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    grid_size INTEGER DEFAULT 3,
    min_nodes INTEGER DEFAULT 4,
    pattern_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PinkSync device registrations
CREATE TABLE IF NOT EXISTS sync_devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(64) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(20) NOT NULL,
    last_seen TIMESTAMP DEFAULT NOW(),
    sync_enabled BOOLEAN DEFAULT TRUE,
    accessibility_features TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- PinkSync operations
CREATE TABLE IF NOT EXISTS sync_operations (
    id SERIAL PRIMARY KEY,
    operation_id VARCHAR(64) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    data JSONB,
    timestamp TIMESTAMP DEFAULT NOW(),
    device_id VARCHAR(64) NOT NULL,
    user_id INTEGER NOT NULL,
    synced BOOLEAN DEFAULT FALSE,
    conflict_resolved BOOLEAN,
    checksum VARCHAR(32)
);

-- Attestations
CREATE TABLE IF NOT EXISTS attestations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    attestation_type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    signature TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accessibility_user_id ON accessibility_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_deafauth_sessions_user_id ON deafauth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_deafauth_sessions_expires ON deafauth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sync_devices_user_id ON sync_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_operations_device_id ON sync_operations(device_id);
CREATE INDEX IF NOT EXISTS idx_sync_operations_user_id ON sync_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_operations_synced ON sync_operations(synced);
CREATE INDEX IF NOT EXISTS idx_attestations_user_id ON attestations(user_id);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'NegraRosa database initialized with DeafAUTH and PinkSync support';
END $$;
