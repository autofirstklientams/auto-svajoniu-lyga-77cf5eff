-- Make invoices bucket private to protect sensitive financial data
UPDATE storage.buckets SET public = false WHERE id = 'invoices';