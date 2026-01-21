-- Add auto_categ column to settings table
alter table settings 
add column if not exists auto_categ boolean default true;
