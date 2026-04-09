# Supabase Migrations

This directory contains SQL migration files for the database schema.

## Migration Files

Migrations are applied in alphabetical order by filename. The naming convention is:
- `YYYYMMDDHHMMSS_description.sql`

Example: `20260224000000_create_profiles.sql`

## Running Migrations

### Local Development
```bash
# Start Supabase locally
npx supabase start

# Reset database and apply all migrations
npx supabase db reset

# Apply new migrations
npx supabase db push
```

### Production
```bash
# Link to production project
npx supabase link --project-ref your-project-ref

# Push migrations to production
npx supabase db push
```

## Creating New Migrations

### Using diff
```bash
# Make changes to your schema in supabase/schemas/
# Then generate a migration
npx supabase db diff -f migration_name
```

### Manual creation
```bash
# Create a new migration file
npx supabase migration new migration_name
```

## Best Practices

1. Always test migrations locally before applying to production
2. Use transactions when appropriate
3. Include rollback SQL in comments for complex migrations
4. Document breaking changes
5. Never modify existing migration files after they've been applied
