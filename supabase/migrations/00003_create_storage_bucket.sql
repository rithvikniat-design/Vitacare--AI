-- Create a new storage bucket called 'medical_files'
insert into storage.buckets (id, name, public)
values ('medical_files', 'medical_files', false);

-- Set up RLS policies for the bucket
-- Allow users to upload files
create policy "Users can upload their own files"
  on storage.objects for insert
  with check (
    bucket_id = 'medical_files' and auth.uid() = owner
  );

-- Allow users to view their own files
create policy "Users can view their own files"
  on storage.objects for select
  using (
    bucket_id = 'medical_files' and auth.uid() = owner
  );

-- Allow users to update their own files
create policy "Users can update their own files"
  on storage.objects for update
  using (
    bucket_id = 'medical_files' and auth.uid() = owner
  );

-- Allow users to delete their own files
create policy "Users can delete their own files"
  on storage.objects for delete
  using (
    bucket_id = 'medical_files' and auth.uid() = owner
  );
