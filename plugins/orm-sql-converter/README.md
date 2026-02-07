# ORM-SQL Converter Plugin

A powerful Claude Code plugin for converting between ORM queries and raw SQL across multiple programming languages, frameworks, and database systems.

## Features

### Supported ORM Frameworks

**Python**
- SQLAlchemy
- Django ORM
- SQLModel
- Peewee

**JavaScript/TypeScript**
- TypeORM
- Sequelize
- Prisma
- Objection.js

**.NET**
- Entity Framework (EF6 & EF Core)
- Dapper
- NHibernate

**Java**
- Hibernate
- JPA implementations
- MyBatis

**Other Languages**
- Ruby (ActiveRecord)
- PHP (Eloquent, Doctrine)
- Go (GORM, sqlx)

### Supported Databases

- PostgreSQL
- MySQL/MariaDB
- SQLite
- SQL Server
- Oracle
- MongoDB (for ODM conversions)

## Installation

### From a marketplace (if published)
```bash
claude plugin install orm-sql-converter
```

### From local source
```bash
claude plugin install ./orm-sql-converter
```

## Usage

### Commands

#### Convert ORM to SQL
```
/orm-to-sql <orm-framework>

Example:
/orm-to-sql sqlalchemy

session.query(User).filter(User.age > 18).order_by(User.name).all()
```

#### Convert SQL to ORM
```
/sql-to-orm <orm-framework> <database-backend>

Example:
/sql-to-orm django postgresql

SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
GROUP BY u.name
HAVING COUNT(o.id) > 5;
```

#### Explain Query Behavior
```
/explain-query <query-type>

Example:
/explain-query sqlalchemy

session.query(User).join(Order).filter(User.active == True).all()
```

### Agent

The plugin includes a specialized ORM-SQL Specialist agent that can be invoked for:
- Complex query conversions between frameworks
- Performance analysis and optimization
- N+1 query problem detection
- Schema generation and migration
- Best practices recommendations

### Skills

The ORM Converter skill is automatically invoked when you ask about:
- Converting ORM queries to SQL
- Converting SQL to ORM queries
- Query optimization
- Debugging ORM performance issues
- Understanding how ORM queries translate to SQL

## Examples

### SQLAlchemy to PostgreSQL

**Input:**
```python
session.query(User.name, func.count(Order.id))\
    .join(Order, User.id == Order.user_id)\
    .filter(User.active == True)\
    .group_by(User.name)\
    .having(func.count(Order.id) > 5)\
    .all()
```

**Output:**
```sql
SELECT users.name, COUNT(orders.id) as order_count
FROM users
INNER JOIN orders ON users.id = orders.user_id
WHERE users.active = TRUE
GROUP BY users.name
HAVING COUNT(orders.id) > 5;
```

### Django ORM to MySQL

**Input:**
```python
Product.objects.filter(
    category__slug='electronics',
    price__gt=100
).annotate(
    review_count=Count('reviews')
).order_by('-review_count')[:10]
```

**Output:**
```sql
SELECT products.*,
       (SELECT COUNT(*) FROM reviews WHERE reviews.product_id = products.id) as review_count
FROM products
INNER JOIN categories ON products.category_id = categories.id
WHERE categories.slug = 'electronics'
  AND products.price > 100
ORDER BY review_count DESC
LIMIT 10;
```

### SQL to Entity Framework Core

**Input (PostgreSQL):**
```sql
WITH ranked_products AS (
    SELECT
        p.*,
        ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) as rn
    FROM products p
    WHERE p.stock > 0
)
SELECT * FROM ranked_products
WHERE rn <= 10;
```

**Output:**
```csharp
var rankedProducts = await context.Products
    .Where(p => p.Stock > 0)
    .OrderByDescending(p => p.Price)
    .ToListAsync(); // Note: EF Core 8.0+ has better WindowFunction support

// Alternative using FromSqlRaw for older versions:
var rankedProducts = await context.Products
    .FromSqlRaw("""
        WITH ranked_products AS (
            SELECT
                p.*,
                ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) as rn
            FROM products p
            WHERE p.stock > 0
        )
        SELECT * FROM ranked_products
        WHERE rn <= 10
    """)
    .ToListAsync();
```

## Advanced Features

### N+1 Query Detection

The plugin can identify potential N+1 query problems:

**Django:**
```python
# Bad - causes N+1 queries
books = Book.objects.filter(published_year=2024)
for book in books:
    print(book.author.name)  # Separate query for each book

# Good - uses eager loading
books = Book.objects.filter(published_year=2024).select_related('author')
for book in books:
    print(book.author.name)  # No additional queries
```

### Window Functions

Support for ROW_NUMBER, RANK, DENSE_RANK, LAG/LEAD, etc.

### Common Table Expressions (CTEs)

Convert CTEs between frameworks, even those with limited native support.

### Index Recommendations

Get suggestions for optimal index placement based on your queries.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Configuration

No configuration required. The plugin uses sensible defaults for all conversions.

### Optional Environment Variables

- `ORM_SQL_DEFAULT_DATABASE` - Default database backend (default: `postgresql`)
- `ORM_SQL_TIMEOUT` - Query timeout in milliseconds (default: `30000`)

### Supported Database Backends

| Database | Syntax Used |
|----------|-------------|
| PostgreSQL | Standard SQL with `LIMIT`/`OFFSET` |
| MySQL | `LIMIT` for pagination |
| SQLite | Standard SQL |
| SQL Server | `TOP` clause, `OFFSET FETCH` |
| Oracle | `ROWNUM`, `OFFSET FETCH` |

## Security

- Input is validated before processing
- No sensitive data is logged or stored
- Query parsing happens locally within the plugin
- No external API calls are made

## License

MIT License - see LICENSE file for details.

## Credits

Created with Claude Code Plugin System
