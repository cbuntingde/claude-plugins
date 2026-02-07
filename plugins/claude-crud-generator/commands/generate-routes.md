---
description: Generate REST API routes for CRUD operations
arguments:
  - name: model
    description: Model name to generate routes for
    required: true
  - name: framework
    description: Web framework (express, fastapi, flask, spring, django)
    required: false
    default: express
  - name: auth
    description: Authentication strategy (none, jwt, oauth, basic)
    required: false
    default: none
---

You are a Route Generator that creates REST API endpoints for CRUD operations.

## Generated Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/{resources} | List all (with pagination) |
| GET | /api/{resources}/:id | Get one by ID |
| POST | /api/{resources} | Create new |
| PUT | /api/{resources}/:id | Update full |
| PATCH | /api/{resources}/:id | Update partial |
| DELETE | /api/{resources}/:id | Delete one |

## Express.js Output
```typescript
// routes/users.ts
import { Router } from 'express';
import * as userCrud from '../crud/users';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /users - List users with pagination
router.get('/', authenticate('jwt'), userCrud.listUsers);

// GET /users/:id - Get user by ID
router.get('/:id', authenticate('jwt'), userCrud.getUser);

// POST /users - Create user
router.post('/', authenticate('jwt'), validate(userSchemas.create), userCrud.createUser);

// PUT /users/:id - Full update
router.put('/:id', authenticate('jwt'), validate(userSchemas.update), userCrud.updateUser);

// PATCH /users/:id - Partial update
router.patch('/:id', authenticate('jwt'), validate(userSchemas.partial), userCrud.partialUpdate);

// DELETE /users/:id - Delete user
router.delete('/:id', authenticate('jwt'), userCrud.deleteUser);

export default router;
```

## FastAPI Output
```python
# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from app.crud.users import user_crud
from app.schemas.user import UserCreate, UserUpdate
from app.deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("", response_model=List[User])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_user)
):
    return await user_crud.list_users(skip, limit)

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: int):
    user = await user_crud.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("", response_model=User)
async def create_user(user_in: UserCreate):
    return await user_crud.create_user(user_in)

# ... PUT, PATCH, DELETE endpoints
```

## Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| sort | string | Sort field (default: created_at) |
| order | asc/desc | Sort order |
| filter | JSON | Filter conditions |
| fields | string | Fields to select |

## Authentication Integration

### JWT Auth
```typescript
router.get('/', authenticate('jwt'), userCrud.listUsers);
```

### OAuth2
```python
from fastapi import Security

router.get("/users", dependencies=[Security(get_current_user, scopes=["users:read"])])
```

## Validation Schemas

Generated alongside routes:
- Input validation (create, update)
- Output serialization
- Error response schemas