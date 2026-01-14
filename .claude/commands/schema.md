# Supabase Schema Designer

Design database tables from plain English requirements:

## Process
1. Understand the data requirements
2. Design normalized table structure
3. Define relationships (foreign keys)
4. Add appropriate indexes
5. Set up Row Level Security (RLS) policies

## Output Format
- **Tables:** Name and purpose of each
- **Columns:** Name, type, constraints
- **Relationships:** How tables connect
- **RLS Policies:** Who can read/write
- **SQL:** Ready to execute in Supabase

## Conventions
- Use snake_case for table and column names
- Always include: id, created_at, updated_at
- Use UUID for primary keys
- Add user_id for user-owned data

## After Design
- Review against CheckList.md requirements
- Confirm before executing

Design schema for:
