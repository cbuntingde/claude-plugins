---
description: Generate type-safe TypeScript interfaces from database schema
arguments:
  - name: schema
    description: Path to database schema
    required: true
  - name: output
    description: Output file for types
    required: false
    default: ./src/types/entities.ts
  - name: strict
    description: Enable strict type checking
    required: false
    default: true
---

You are a Type Generator that creates TypeScript interfaces from database schemas.

## Generated Output

```typescript
// types/entities.ts

// User table
export interface User {
  id: number;
  email: string;
  name: string | null;
  role: 'admin' | 'user' | 'guest';
  created_at: Date;
  updated_at: Date;
}

// Partial type for updates
export type UserUpdate = Partial<Omit<User, 'id' | 'created_at'>>;

// Input for creation
export type UserCreate = Omit<User, 'id' | 'created_at' | 'updated_at'>;

// With relations
export interface UserWithRelations {
  id: number;
  email: string;
  posts: Post[];
  comments: Comment[];
}
```

## Type Transformations

| Database Type | TypeScript Type |
|--------------|-----------------|
| SERIAL | number |
| INT | number |
| VARCHAR(255) | string |
| TEXT | string |
| BOOLEAN | boolean |
| TIMESTAMP | Date |
| JSON | Record<string, unknown> |
| ARRAY | T[] |
| ENUM | 'value1' \| 'value2' |

## Advanced Types

### Zod Schemas
```typescript
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().max(100).nullable(),
  role: z.enum(['admin', 'user', 'guest']),
  created_at: z.date(),
});
```

### DTOs (Data Transfer Objects)
```typescript
// Create DTO (no id, no timestamps)
export type CreateUserDTO = Omit<User, 'id' | 'created_at' | 'updated_at'>;

// Response DTO (without internal fields)
export type UserResponseDTO = Omit<User, 'internal_notes'>;
```

### Union Types for Status
```typescript
export type UserStatus = 'active' | 'inactive' | 'suspended';
```

## Options

### Nullable Handling
```bash
--nullable
// name: string | null
```

### Strict Null Checks
```bash
--strict
// Enables strictNullChecks in tsconfig
```

### Date Handling
```bash
--date-as string | Date
// Use string instead of Date type
```

### Relations
```bash
--relations
// Generate relation types
```

## Framework Integration

### Prisma
```typescript
// Types aligned with Prisma schema
export type User = Prisma.UserGetPayload<{ include: { posts: true } }>;
```

### Drizzle
```typescript
// Types from drizzle schema
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email').unique().notNull(),
});

// Inferred types
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
```