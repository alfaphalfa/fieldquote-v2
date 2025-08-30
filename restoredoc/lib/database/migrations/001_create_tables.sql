-- Create contractors table
CREATE TABLE IF NOT EXISTS contractors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  license_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'PA',
  zip TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  damage_type TEXT NOT NULL CHECK (damage_type IN ('water', 'fire', 'mold')),
  property_address TEXT NOT NULL,
  property_city TEXT NOT NULL,
  property_state TEXT DEFAULT 'PA',
  property_zip TEXT,
  insurance_company TEXT,
  claim_number TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create estimates table
CREATE TABLE IF NOT EXISTS estimates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  
  -- AI Analysis Data
  ai_analysis JSONB,
  photos JSONB, -- Array of photo URLs
  
  -- Estimate Details
  line_items JSONB NOT NULL, -- Array of line items
  subtotal DECIMAL(10, 2) NOT NULL,
  markup_percent DECIMAL(5, 2) DEFAULT 0,
  markup_amount DECIMAL(10, 2) DEFAULT 0,
  tax_percent DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Adjustments Applied
  adjustments JSONB, -- Track what was changed from AI analysis
  labor_rate DECIMAL(6, 2) DEFAULT 95.00,
  equipment_days INTEGER DEFAULT 3,
  
  -- Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected')),
  sent_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT,
  pdf_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  
  -- Ensure only one current version per job
  UNIQUE(job_id, is_current) WHERE is_current = true
);

-- Create estimate_templates table for saving common line items
CREATE TABLE IF NOT EXISTS estimate_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  damage_type TEXT CHECK (damage_type IN ('water', 'fire', 'mold')),
  line_items JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_jobs_contractor_id ON jobs(contractor_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_damage_type ON jobs(damage_type);
CREATE INDEX idx_estimates_job_id ON estimates(job_id);
CREATE INDEX idx_estimates_status ON estimates(status);
CREATE INDEX idx_estimates_is_current ON estimates(is_current);
CREATE INDEX idx_estimate_templates_contractor_id ON estimate_templates(contractor_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON contractors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimates_updated_at BEFORE UPDATE ON estimates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimate_templates_updated_at BEFORE UPDATE ON estimate_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (assuming auth.uid() represents contractor_id)
-- Contractors can only see their own data
CREATE POLICY "Contractors can view own profile" ON contractors
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Contractors can update own profile" ON contractors
  FOR UPDATE USING (id = auth.uid());

-- Jobs policies
CREATE POLICY "Contractors can view own jobs" ON jobs
  FOR SELECT USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can create own jobs" ON jobs
  FOR INSERT WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Contractors can update own jobs" ON jobs
  FOR UPDATE USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can delete own jobs" ON jobs
  FOR DELETE USING (contractor_id = auth.uid());

-- Estimates policies (through jobs relationship)
CREATE POLICY "Contractors can view own estimates" ON estimates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = estimates.job_id 
      AND jobs.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can create estimates for own jobs" ON estimates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = estimates.job_id 
      AND jobs.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can update own estimates" ON estimates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = estimates.job_id 
      AND jobs.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can delete own estimates" ON estimates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = estimates.job_id 
      AND jobs.contractor_id = auth.uid()
    )
  );

-- Template policies
CREATE POLICY "Contractors can view own templates" ON estimate_templates
  FOR SELECT USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can create own templates" ON estimate_templates
  FOR INSERT WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Contractors can update own templates" ON estimate_templates
  FOR UPDATE USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can delete own templates" ON estimate_templates
  FOR DELETE USING (contractor_id = auth.uid());