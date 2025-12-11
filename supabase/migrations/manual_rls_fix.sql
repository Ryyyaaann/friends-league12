-- Allow organizer to update competition
create policy "Organizer can update competition"
on competitions
for update
using (auth.uid() = organizer_id);

-- Allow organizer to delete competition
create policy "Organizer can delete competition"
on competitions
for delete
using (auth.uid() = organizer_id);
