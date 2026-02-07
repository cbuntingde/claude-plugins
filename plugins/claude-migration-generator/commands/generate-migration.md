---
description: Generate database migrations from schema descriptions
arguments:
  - name: framework
    description: The ORM/framework to generate migrations for (django, rails, prisma, sqlalchemy, typeorm, knex, ef-core)
    required: true
  - name: description
    description: Schema description or changes to migrate
    required: true
  - name: output
    description: Output directory for migration files (default: framework-specific location)
    required: false
---

# generate-migration

Generate database migration files from natural language schema descriptions. Supports multiple ORMs and frameworks.

## Usage

```
/generate-migration <framework> "<description>" [--output <directory>]
```

## Examples

### Django
```
/generate-migration django "Add a User model with email, username (unique), and created_at timestamp"
```

### Rails
```
/generate-migration rails "Create posts table with title, content (text), author_id foreign key, and published boolean"
```

### Prisma
```
/generate-migration prisma "Add Profile model with one-to-one relationship to User, including bio and avatarUrl"
```

### SQLAlchemy
```
/generate-migration sqlalchemy "Create products table with name, price (decimal), category, and inventory_count"
```

## Supported Frameworks

- **django** - Django ORM migrations
- **rails** - Ruby on Rails Active Record migrations
- **prisma** - Prisma ORM migrations
- **sqlalchemy** - Flask SQLAlchemy/FastAPI migrations
- **typeorm** - TypeORM migrations (TypeScript/Node.js)
- **knex** - Knex.js query builder migrations
- **ef-core** - Entity Framework Core (C#/.NET)

## Features

- Automatic column type inference
- Relationship detection (one-to-one, one-to-many, many-to-many)
- Index generation for common patterns
- Timestamp and UUID field handling
- Foreign key constraint creation
- Rollback migration generation

## Advanced Usage

### Multiple tables
```
/generate-migration rails "Create users table and posts table with user_id foreign key"
```

### Specific column types
```
/generate-migration django "Add Product model with price as DecimalField(max_digits=10, decimal_places=2)"
```

### Indexes and constraints
```
/generate-migration prisma "Add unique index on email field in User model"
```

## Output

Generates migration files in the appropriate format for the specified framework, including:
- Up/forward migration
- Down/rollback migration (when applicable)
- Proper file naming with timestamp
- Framework-specific conventions and best practices
