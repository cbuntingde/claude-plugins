# Claude Migration Generator Plugin

Generate database migrations from natural language schema descriptions across multiple ORMs and frameworks.

## Features

- 🎯 **Natural Language Input**: Describe what you want, get instant migrations
- 🔧 **Multi-Framework Support**: Django, Rails, Prisma, SQLAlchemy, TypeORM, Knex, EF Core
- 🔗 **Automatic Relationships**: Detects and creates foreign keys and associations
- 📊 **Smart Type Inference**: Maps common patterns to appropriate database types
- 🔄 **Rollback Support**: Generates down/rollback migrations
- 🚀 **Production Ready**: Follows framework conventions and best practices

## Installation

### From Marketplace
```bash
claude plugin install migration-generator
```

### Local Development
```bash
# Clone to your project
cp -r claude-migration-generator ~/.claude/plugins/migration-generator

# Or add to project-specific plugins
cp -r claude-migration-generator ./.claude/plugins/migration-generator
```

## Usage

### Slash Command

```bash
/generate-migration <framework> "<description>"
```

### Examples

**Django - Create User Model**
```bash
/generate-migration django "Add User model with email, username (unique), and created_at timestamp"
```

**Rails - Posts with Relationships**
```bash
/generate-migration rails "Create posts table with title, content (text), author_id foreign key, and published boolean"
```

**Prisma - One-to-One Relationship**
```bash
/generate-migration prisma "Add Profile model with one-to-one relationship to User, including bio and avatarUrl"
```

**SQLAlchemy - E-commerce**
```bash
/generate-migration sqlalchemy "Create products table with name, price (decimal), category, and inventory_count"
```

**TypeORM - Many-to-Many**
```bash
/generate-migration typeorm "Add many-to-many relationship between students and courses with enrollment_date"
```

**Knex - Multiple Tables**
```bash
/generate-migration knex "Create users and orders tables with proper foreign key relationships"
```

**EF Core - Complex Schema**
```bash
/generate-migration ef-core "Add BlogPost model with tags many-to-many, comments one-to-many, and metadata JSON field"
```

## Autonomous Invocation

The plugin's skill automatically activates when Claude detects you're describing database changes:

```
User: "I need to add a comments system to the blog

Claude: [Automatically invokes Migration Generator skill]
I'll generate a migration for adding comments with a foreign key to posts...
```

## Supported Frameworks

| Framework | Language | Migrations System |
|-----------|----------|-------------------|
| Django | Python | Django Migrations |
| Rails | Ruby | Active Record Migrations |
| Prisma | TypeScript/Node | Prisma Migrate |
| SQLAlchemy | Python | Alembic |
| TypeORM | TypeScript | TypeORM Migrations |
| Knex | JavaScript | Knex Migrations |
| EF Core | C# | EF Core Migrations |

## Schema Description Patterns

### Basic Fields
- `email` → validated string/email type
- `password` → hash string, not null
- `is_active` → boolean
- `created_at` / `updated_at` → timestamps
- `price` / `amount` → decimal/money
- `count` / `quantity` → integer
- `description` / `content` → text

### Relationships
- `has many` / `belongs to` → one-to-many
- `has one` → one-to-one
- `many to many` / `join table` → many-to-many
- `foreign key` / `references` → foreign key constraint

### Constraints
- `unique` / `distinct` → unique constraint/index
- `not null` / `required` → nullable: false
- `default` / `initial` → default value

### Indexes
- `index on [field]` → add index
- `unique index on [field]` → unique index
- `composite index on [fields]` → multi-column index

## Generated Output Examples

### Django Migration
```python
# accounts/migrations/0001_initial.py
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
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
```

### Rails Migration
```ruby
# db/migrate/20250117123456_create_posts.rb
class CreatePosts < ActiveRecord::Migration[7.1]
  def change
    create_table :posts do |t|
      t.string :title, null: false
      t.text :content
      t.references :author, null: false, foreign_key: { to_table: :users }
      t.boolean :published, default: false
      t.timestamps
    end

    add_index :posts, :author_id
    add_index :posts, :published
  end
end
```

### Prisma Schema
```prisma
// schema.prisma
model Profile {
  id        Int     @id @default(autoincrement())
  bio       String?
  avatarUrl String?
  userId    Int     @unique
  user      User    @relation(fields: [userId], references: [id])
}
```

### SQLAlchemy (Alembic)
```python
# alembic/versions/001_create_products.py
from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table(
        'products',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('inventory_count', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_products_name'), 'products', ['name'])


def downgrade():
    op.drop_index(op.f('ix_products_name'), table_name='products')
    op.drop_table('products')
```

## Advanced Agent

For complex migrations, schema refactoring, or data migrations, invoke the **Migration Expert Agent**:

```
/agents migration-expert
```

The agent handles:
- Multi-table schema changes
- Data transformations during migrations
- Performance optimization
- Schema refactoring and normalization
- Zero-downtime strategies
- Cross-framework migrations

## Plugin Structure

```
claude-migration-generator/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── commands/
│   └── generate-migration.md    # Slash command
├── skills/
│   └── migration-generator/
│       └── SKILL.md             # Autonomous skill
├── agents/
│   └── migration-expert.md      # Specialized agent
└── README.md
```

## Configuration

### Framework Detection

The plugin automatically detects the target framework from your description:
- Mention Django, Python → Django migrations
- Mention Rails, Ruby → Rails migrations
- Mention Prisma, Node, TypeScript → Prisma migrations
- Mention SQLAlchemy, Flask, FastAPI, Python → SQLAlchemy migrations
- Mention TypeORM, Node, TypeScript → TypeORM migrations
- Mention Knex, JavaScript, Node.js → Knex migrations
- Mention EF Core, C#, .NET → Entity Framework Core migrations

### Output Directory

By default, migrations are generated in framework-specific locations:
- **Django**: `app/migrations/`
- **Rails**: `db/migrate/`
- **Prisma**: `prisma/migrations/`
- **SQLAlchemy**: `alembic/versions/`
- **TypeORM**: `src/migrations/`
- **Knex**: `migrations/`
- **EF Core**: `Data/Migrations/`

To specify a custom output directory, use the `--output` flag:
```bash
/generate-migration django "Create User model" --output custom/migrations/
```

### Naming Conventions

The plugin follows framework-specific naming conventions:
- Timestamps are prepended for frameworks that support them
- PascalCase class names for Django, Rails, C#
- snake_case filenames for Python, JavaScript

### Column Type Mappings

Common field descriptions are mapped to appropriate types:
| Description | Django | Rails | Prisma | TypeORM |
|------------|--------|-------|--------|---------|
| email | EmailField | string | String | @Column |
| password | CharField | string | String | @Column |
| is_active | BooleanField | boolean | Boolean | @Column |
| created_at | DateTimeField | datetime | DateTime | @CreateDateColumn |
| price | DecimalField | decimal | Decimal | @Column |
| content | TextField | text | String | @Column |

## Development

### Adding Framework Support

1. Add framework detection logic to `SKILL.md`
2. Add migration templates and examples
3. Update command documentation with framework-specific usage
4. Test with common schema patterns

### Testing

Test the plugin with various schema descriptions:
- Simple models with basic fields
- Relationships (one-to-one, one-to-many, many-to-many)
- Indexes and constraints
- Data type conversions
- Complex multi-table migrations

## Contributing

Contributions welcome! Areas for enhancement:
- Additional framework support (Sequelize, MikroORM, etc.)
- Data migration generation
- Migration diff generation
- Schema visualization
- Migration testing helpers

## License

MIT License - feel free to use and modify for your projects.

## Support

For issues or questions:
1. Check the plugin documentation
2. Review generated migration files
3. Consult your framework's migration documentation
4. Open an issue on GitHub

## Version History

- **1.0.0** - Initial release with support for Django, Rails, Prisma, SQLAlchemy, TypeORM, Knex, EF Core
