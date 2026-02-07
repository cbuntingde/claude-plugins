---
description: Generate database migrations from schema descriptions
capabilities:
  - Generate ORM-specific migration files
  - Infer database schema from natural language
  - Create relationships and constraints
  - Support multiple database frameworks
---

# Migration Generator Skill

Autonomously generate database migration files when users describe schema changes, table structures, or database modifications.

## When to Use

Invoke this skill when:
- User describes creating or modifying database tables/models
- User asks to add fields, columns, or relationships
- User mentions schema changes or database updates
- User needs to sync database with application models
- User requests migration for Django, Rails, Prisma, SQLAlchemy, TypeORM, Knex, or EF Core

## Framework Detection

Detect the framework from context:
- **Django**: `models.py`, `INSTALLED_APPS`, Django project structure
- **Rails**: `db/migrate`, ActiveRecord, Ruby files
- **Prisma**: `schema.prisma`, `@prisma/client`
- **SQLAlchemy**: SQLAlchemy imports, Flask/FastAPI context
- **TypeORM**: TypeORM imports, TypeScript/Node.js context
- **Knex**: `knexfile`, migration directory structure
- **EF Core**: `.cs` files, `DbContext`, Entity Framework

## Capabilities

### Schema Inference
Parse natural language descriptions into:
- Table names and models
- Column names and types
- Primary keys (auto-detected or explicit)
- Foreign keys and relationships
- Indexes and unique constraints
- Default values and nullable fields

### Relationship Types
- **One-to-one**: `has one`, `belongs to` (single references)
- **One-to-many**: `has many`, `belongs to` (foreign keys)
- **Many-to-many**: `has and belongs to many`, join tables

### Field Type Mapping

**Common patterns:**
- `email` → string/varchar with validation
- `password` → string/hash, nullable: false
- `timestamp`, `created_at`, `updated_at` → datetime
- `price`, `amount` → decimal/money type
- `is_*`, `has_*` → boolean
- `count`, `quantity` → integer
- `description`, `content` → text
- `url`, `path` → string/varchar

## Migration Generation Process

1. **Analyze context**: Determine framework from project structure
2. **Parse description**: Extract tables, columns, types, relationships
3. **Generate migration**: Create framework-specific migration file
4. **Include rollback**: Add down/rollback migration when supported
5. **Apply conventions**: Use framework naming and structure patterns

## Framework-Specific Output

### Django
- Python files in app's `migrations/` directory
- `Migration` class with `operations` list
- CreateModel or AddField operations
- Dependencies on previous migrations

### Rails
- Ruby files in `db/migrate/` with timestamp prefix
- `change` method (or `up`/`down`)
- `create_table`, `add_column`, `add_reference`
- `t.timestamps`, `t.references` for relationships

### Prisma
- Update `schema.prisma` with new models
- Generate migration with `npx prisma migrate dev`
- Include `@@id`, `@@index`, `@@relation` attributes

### SQLAlchemy (Alembic)
- Python files in `alembic/versions/`
- `upgrade()` and `downgrade()` functions
- `op.create_table()`, `op.add_column()`
- `sa.ForeignKeyConstraint()` for relationships

### TypeORM
- TypeScript files in `migrations/` with timestamp
- `QueryRunner` in `up()` and `down()`
- `createTable()`, `addColumn()`
- Foreign key creation with references

### Knex
- JavaScript files in `migrations/` with timestamp
- `up` and `down` functions
- `knex.schema.createTable()`, `table.*()`
- `foreign()`, `references()`, `inTable()`

### EF Core
- C# files in `Migrations/` directory
- `Up()` and `Down()` methods in `Migration` class
- `migrationBuilder.CreateTable()`, `AddColumn()`
- ForeignKey configuration in `OnDelete` behavior

## Examples

### User requests:
```
"I need to add a comments table with content, created_at, and a foreign key to posts"
```

### Framework: Rails detected

**Generate:** `db/migrate/20250117123456_add_comments.rb`
```ruby
class AddComments < ActiveRecord::Migration[7.1]
  def change
    create_table :comments do |t|
      t.text :content, null: false
      t.references :post, null: false, foreign_key: true
      t.timestamps
    end

    add_index :comments, :post_id
  end
end
```

### User requests:
```
"Add User model to Django with username (unique), email, and password hash"
```

### Framework: Django detected

**Generate:** `accounts/migrations/0001_initial.py`
```python
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True)),
                ('username', models.CharField(max_length=150, unique=True)),
                ('email', models.EmailField(max_length=254)),
                ('password', models.CharField(max_length=255)),
            ],
        ),
    ]
```

## Best Practices

- Always include timestamps (`created_at`, `updated_at`) when appropriate
- Add indexes on foreign keys and frequently queried fields
- Use appropriate column types (not just string/varchar everywhere)
- Include constraints (not null, unique) when specified or implied
- Generate proper rollback migrations
- Follow framework conventions for naming and structure
- Use transactions where supported for atomic migrations

## Constraints

- Only generate migrations for supported frameworks
- Require explicit framework specification when unclear from context
- Ask for clarification on ambiguous field types
- Don't assume complex business logic - stick to schema
- Include appropriate data types based on usage patterns
