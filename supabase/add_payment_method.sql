-- Add payment_method column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash';

-- Add comment for documentation
COMMENT ON COLUMN transactions.payment_method IS 'Method of payment: cash, card, gpay, phonepe, paytm, other';
