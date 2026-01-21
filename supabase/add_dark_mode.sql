ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS dark_mode boolean DEFAULT false;
