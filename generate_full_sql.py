import os

migration_dir = "frontend/supabase/migrations"
mig1 = "20260511191706_a7c08a45-e28f-4134-8035-1ffc3d28c003.sql"
mig2 = "20260511191743_06a852f2-3029-42c6-b85f-4112bd8faf23.sql"
seed_file = "seed_organizers_final.sql"

output_file = "init_database_complete.sql"

with open(output_file, "w", encoding="utf-8") as out:
    out.write("-- 1. Schema Migration (Tables, Roles, Profiles, Events)\n")
    with open(os.path.join(migration_dir, mig1), "r", encoding="utf-8") as f:
        out.write(f.read())
        
    out.write("\n\n-- 2. Security Migration\n")
    with open(os.path.join(migration_dir, mig2), "r", encoding="utf-8") as f:
        out.write(f.read())
        
    out.write("\n\n-- 3. Data Seeding & Permission Fixes\n")
    with open(seed_file, "r", encoding="utf-8") as f:
        out.write(f.read())
        
print("Successfully created init_database_complete.sql")
