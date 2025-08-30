-- FieldQuote V2 Database Schema
-- For use with Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contractors table (businesses using the app)
CREATE TABLE contractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    logo_url TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    license_number TEXT,
    insurance_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Jobs/Projects table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    zip TEXT,
    damage_type TEXT CHECK (damage_type IN ('water', 'fire', 'mold')) NOT NULL,
    status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Estimates table
CREATE TABLE estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    ai_analysis JSONB, -- Stores the AI analysis results
    line_items JSONB NOT NULL, -- Array of line items with quantities, prices, etc.
    original_total DECIMAL(10,2) NOT NULL,
    adjusted_total DECIMAL(10,2),
    photos_urls TEXT[], -- Array of photo URLs
    labor_rate DECIMAL(10,2) DEFAULT 85.00,
    equipment_days INTEGER DEFAULT 3,
    markup_percent DECIMAL(5,2) DEFAULT 0,
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX idx_contractors_email ON contractors(email);
CREATE INDEX idx_jobs_contractor_id ON jobs(contractor_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_estimates_job_id ON estimates(job_id);
CREATE INDEX idx_estimates_is_current ON estimates(is_current);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON contractors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimates_updated_at BEFORE UPDATE ON estimates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (adjust based on your auth setup)
-- Allow contractors to see only their own data
CREATE POLICY "Contractors can view own data" ON contractors
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Contractors can update own data" ON contractors
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Jobs belong to contractor" ON jobs
    FOR ALL USING (contractor_id::text = auth.uid()::text);

CREATE POLICY "Estimates belong to contractor via job" ON estimates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE jobs.id = estimates.job_id 
            AND jobs.contractor_id::text = auth.uid()::text
        )
    );

-- Sample data insertion (for testing)
-- INSERT INTO contractors (business_name, email, phone) 
-- VALUES ('Major Restoration Services', 'info@majorrestoration.com', '717-555-0100');