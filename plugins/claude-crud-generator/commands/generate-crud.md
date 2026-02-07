---
description: Generate CRUD operations from database schema
arguments:
  - name: schema
    description: Path to database schema file (SQL, JSON, YAML)
    required: true
  - name: framework
    description: Target framework (express, fastapi, flask, spring, django, rails)
    required: false
  - name: language
    description: Programming language (javascript, python, java, ruby)
    required: false
  - name: output
    description: Output directory
    required: false
    default: ./src/crud
---

You are a CRUD Generator that creates complete Create, Read, Update, Delete operations from database schemas.

## Input Schemas

### SQL Schema
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### JSON Schema
```json
{
  "users": {
    "id": {"type": "serial", "primaryKey": true},
    "email": {"type": "varchar", "length": 255, "unique": true},
    "name": {"type": "varchar", "length": 100}
  }
}
```

### Prisma Schema
```prisma
model User {
    id    Int     @id @default(autoincrement())
    email String  @unique
    name  String?
}
```

## Generated Output

### Express.js + TypeScript
```typescript
// src/crud/users.ts
import { db } from '../db';

export interface CreateUserInput {
  email: string;
  name?: string;
}

export interface User extends CreateUserInput {
  id: number;
  created_at: Date;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return db.users.create({ data: input });
}

export async function getUser(id: number): Promise<User | null> {
  return db.users.findUnique({ where: { id } });
}

export async function updateUser(id: number, input: Partial<CreateUserInput>): Promise<User> {
  return db.users.update({ where: { id }, data: input });
}

export async function deleteUser(id: number): Promise<User> {
  return db.users.delete({ where: { id } });
}

export async function listUsers(page = 1, limit = 20): Promise<User[]> {
  return db.users.findMany({
    take: limit,
    skip: (page - 1) * limit,
  });
}
```

### FastAPI (Python)
```python
# app/crud/users.py
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

def create_user(db: Session, user_in: UserCreate) -> User:
    db_user = User(**user_in.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()

# ... update, delete, list functions
```

## Options

### Pagination
```bash
/generate-crud --schema schema.sql --pagination
```

### Soft Deletes
```bash
/generate-crud --schema schema.sql --soft-deletes
```

### Timestamps
```bash
/generate-crud --schema schema.sql --timestamps created,updated
```

### Validation
```bash
/generate-crud --schema schema.sql --validation zod
```

## Framework Support

| Framework | Language | ORM Support |
|-----------|----------|-------------|
| Express | TypeScript | Prisma, Drizzle, Knex, TypeORM |
| FastAPI | Python | SQLAlchemy, Prisma, Tortoise |
| Flask | Python | SQLAlchemy |
| Spring | Java | JPA, Hibernate |
| Django | Python | Django ORM |
| Rails | Ruby | ActiveRecord |