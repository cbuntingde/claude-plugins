---
description: Explain ORM or SQL query behavior and performance
---

# /explain-query

Analyze and explain the behavior, execution plan, and performance characteristics of ORM or SQL queries.

**Usage:**
```
/explain-query <query-type>
```

Query types: `sql`, `sqlalchemy`, `django`, `entity-framework`, `typeorm`, `sequelize`, `prisma`, `hibernate`

**Examples:**

```sql
-- SQL example
/explain-query sql

EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id)
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.name
HAVING COUNT(o.id) > 5;
```

```python
# SQLAlchemy example
/explain-query sqlalchemy

session.query(User, func.count(Order.id))\
    .outerjoin(Order)\
    .filter(User.created_at > datetime(2024, 1, 1))\
    .group_by(User)\
    .having(func.count(Order.id) > 5)\
    .all()
```

The command will:
1. Parse the query structure
2. Explain the execution logic step-by-step
3. Identify potential performance bottlenecks
4. Suggest indexes for optimization
5. Compare equivalent queries if applicable
6. Provide database-specific considerations
