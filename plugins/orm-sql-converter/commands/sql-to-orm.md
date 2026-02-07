---
description: Convert raw SQL to ORM query
---

# /sql-to-orm

Convert raw SQL queries to ORM-specific code.

**Usage:**
```
/sql-to-orm <orm-framework> <database-backend>
```

Provide the SQL query and specify the target ORM framework. Supported frameworks:
- `sqlalchemy` - Python SQLAlchemy
- `django` - Django ORM
- `entity-framework` - .NET Entity Framework/Core
- `typeorm` - TypeScript/JavaScript TypeORM
- `sequelize` - JavaScript/TypeScript Sequelize
- `prisma` - Prisma ORM
- `hibernate` - Java Hibernate/JPA

Database backends: `postgresql`, `mysql`, `sqlite`, `sqlserver`, `oracle`

**Examples:**

```sql
-- Example 1: Simple join
/sql-to-qlm sqlalchemy postgresql

SELECT u.name, o.order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
ORDER BY o.order_date DESC;
```

```sql
-- Example 2: Complex aggregation
/sql-to-orm django mysql

SELECT category, COUNT(*) as total,
       AVG(price) as avg_price
FROM products
WHERE stock > 0
GROUP BY category
HAVING AVG(price) > 100;
```

The command will:
1. Parse the SQL query structure
2. Generate equivalent ORM query code
3. Include necessary model definitions if provided
4. Handle JOINs, subqueries, aggregations, and window functions
5. Provide usage examples
