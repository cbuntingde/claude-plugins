---
description: Generate unit and integration tests for CRUD operations
arguments:
  - name: model
    description: Model name to generate tests for
    required: true
  - name: framework
    description: Test framework (jest, vitest, pytest, pytest-asyncio)
    required: false
    default: jest
  - name: coverage
    description: Generate coverage reports
    required: false
    default: true
---

You are a CRUD Test Generator that creates comprehensive tests for CRUD operations.

## Generated Tests

### Jest/TypeScript
```typescript
// __tests__/users.test.ts
import { userCrud } from '../src/crud/users';
import { db } from '../src/db';

describe('User CRUD Operations', () => {
  beforeEach(async () => {
    await db.users.deleteMany();
  });

  describe('createUser', () => {
    it('should create a user with valid input', async () => {
      const input = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const user = await userCrud.createUser(input);

      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.id).toBeDefined();
    });

    it('should throw on duplicate email', async () => {
      await userCrud.createUser({ email: 'test@example.com' });

      await expect(
        userCrud.createUser({ email: 'test@example.com' })
      ).rejects.toThrow();
    });

    it('should require email', async () => {
      await expect(
        userCrud.createUser({ name: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('getUser', () => {
    it('should return user by id', async () => {
      const created = await userCrud.createUser({
        email: 'test@example.com',
      });

      const user = await userCrud.getUser(created.id);

      expect(user).not.toBeNull();
      expect(user!.email).toBe('test@example.com');
    });

    it('should return null for non-existent id', async () => {
      const user = await userCrud.getUser(99999);
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user fields', async () => {
      const created = await userCrud.createUser({
        email: 'test@example.com',
      });

      const updated = await userCrud.updateUser(created.id, {
        name: 'Updated Name',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.email).toBe('test@example.com');
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const created = await userCrud.createUser({
        email: 'test@example.com',
      });

      const deleted = await userCrud.deleteUser(created.id);
      expect(deleted.id).toBe(created.id);

      const found = await userCrud.getUser(created.id);
      expect(found).toBeNull();
    });
  });

  describe('listUsers', () => {
    it('should paginate results', async () => {
      // Create 25 users
      for (let i = 0; i < 25; i++) {
        await userCrud.createUser({ email: `user${i}@example.com` });
      }

      const page1 = await userCrud.listUsers(1, 10);
      const page2 = await userCrud.listUsers(2, 10);

      expect(page1.length).toBe(10);
      expect(page2.length).toBe(10);
    });
  });
});
```

## Test Coverage

| Category | Coverage |
|----------|----------|
| Success cases | All CRUD operations |
| Error cases | Invalid input, not found |
| Edge cases | Empty results, boundary values |
| Edge cases | Duplicate keys, null values |

## Test Frameworks

### Jest
- Unit tests
- Mock database
- Snapshot testing

### pytest (Python)
```python
@pytest.mark.asyncio
async def test_create_user():
    user = await user_crud.create_user(...)
    assert user.email == "test@example.com"
```

## Fixtures and Mocks

### Database Mock
```typescript
// Mock Prisma client
const mockPrisma = {
  users: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};
```

### Test Fixtures
```typescript
const testUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
};
```