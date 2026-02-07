---
description: Convert ORM query to raw SQL
---

# /orm-to-sql

Convert ORM queries from various frameworks to raw SQL.

**Usage:**
```
/orm-to-sql <orm-framework>
```

Provide the ORM query code and specify the framework. Supported frameworks:
- `sqlalchemy` - Python SQLAlchemy
- `django` - Django ORM
- `entity-framework` - .NET Entity Framework
- `typeorm` - TypeScript/JavaScript TypeORM
- `sequelize` - JavaScript/TypeScript Sequelize
- `prisma` - Prisma ORM
- `hibernate` - Java Hibernate/JPA

**Examples:**

```python
# SQLAlchemy example
/orm-to-sql sqlalchemy

session.query(User).filter(User.age > 18).order_by(User.name).all()
```

```csharp
// Entity Framework example
/orm-to-sql entity-framework

var users = context.Users
    .Where(u => u.Age > 18)
    .OrderBy(u => u.Name)
    .ToList();
```

The command will:
1. Parse the ORM query structure
2. Generate equivalent raw SQL
3. Support multiple database backends (PostgreSQL, MySQL, SQLite, SQL Server)
4. Explain the generated SQL
5. Provide optimization tips if applicable
