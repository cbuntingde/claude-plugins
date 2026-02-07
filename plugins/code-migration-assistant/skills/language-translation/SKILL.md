---
name: language-translation
description: Expert skill for translating code between programming languages while preserving functionality
context: |
  Use this skill when the user asks to convert, translate, or migrate code from one programming language to another.

  Look for phrases like:
  - "convert [language] to [language]"
  - "translate this code to [language]"
  - "migrate from [language] to [language]"
  - "rewrite in [language]"
  - "[language] version of this code"

  Common translations:
  - JavaScript ↔ TypeScript
  - JavaScript → Python
  - Python → JavaScript
  - React Class Components → Functional Components
  - Options API → Composition API (Vue)
  - Java → Kotlin
  - Objective-C → Swift

  This skill should:
  1. Parse and understand the source code structure
  2. Identify language-specific patterns and idioms
  3. Translate to idiomatic target language code
  4. Preserve business logic and functionality
  5. Handle type systems appropriately
  6. Adapt standard library calls
  7. Provide validation and testing guidance
---

# Language Translation Skill

You are an expert in translating code between programming languages while preserving functionality, logic, and intent. You understand the idioms, patterns, and best practices of multiple languages.

## When to use this skill

Invoke this skill when translating:
- JavaScript ↔ TypeScript (adding/removing types)
- JavaScript → Python (or vice versa)
- React Class Components → Functional Components with Hooks
- Vue Options API → Composition API
- Java → Kotlin
- Objective-C → Swift
- Any other language pair

## Core principles

### 1. Preserve functionality
The translated code must do the same thing:
- Same inputs produce same outputs
- Same side effects
- Same error handling
- Same edge cases

### 2. Use idiomatic code
Don't just translate syntax - translate patterns:
- Use target language conventions
- Apply standard library idioms
- Follow style guides
- Leverage language features

### 3. Handle types appropriately
- When adding types: infer from usage, be precise but pragmatic
- When removing types: document type assumptions in comments
- Handle generics, unions, and optional types correctly

## Translation process

### Step 1: Analyze source code

```javascript
// Source: JavaScript
function calculateTotal(items, tax = 0.1) {
  if (!items || items.length === 0) {
    return 0;
  }

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  return subtotal * (1 + tax);
}
```

**Analysis:**
- Function with default parameter
- Array reduction
- Object property access
- Null/empty check
- Arithmetic operations

### Step 2: Design target structure

```python
# Target: Python
from typing import List, Optional

class Item:
    def __init__(self, price: float, quantity: int):
        self.price = price
        self.quantity = quantity

def calculate_total(items: Optional[List[Item]], tax: float = 0.1) -> float:
    # Implementation...
```

### Step 3: Translate patterns

```python
def calculate_total(items: Optional[List[Item]], tax: float = 0.1) -> float:
    if not items or len(items) == 0:
        return 0.0

    subtotal = sum(item.price * item.quantity for item in items)
    return subtotal * (1 + tax)
```

## Common language translations

### JavaScript → TypeScript

**Key changes:**
1. Add type annotations
2. Create interfaces for objects
3. Type function signatures
4. Handle `any` appropriately
5. Use generic types

**Example:**
```typescript
// JavaScript
function fetchData(url, callback) {
  fetch(url)
    .then(res => res.json())
    .then(data => callback(null, data))
    .catch(err => callback(err));
}

// TypeScript
interface FetchDataOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
}

type FetchCallback<T> = (error: Error | null, data: T | null) => void;

async function fetchData<T>(
  url: string,
  callback: FetchCallback<T>
): Promise<void> {
  try {
    const response = await fetch(url);
    const data: T = await response.json();
    callback(null, data);
  } catch (error) {
    callback(error as Error, null);
  }
}
```

### React Class → Functional Components

**Key changes:**
1. Convert state to `useState`
2. Convert lifecycle methods to `useEffect`
3. Convert class methods to functions
4. Remove `this`
5. Handle context with `useContext`

**Example:**
```javascript
// Class component
class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true,
      error: null
    };
  }

  componentDidMount() {
    this.fetchUser();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUser();
    }
  }

  async fetchUser() {
    try {
      this.setState({ loading: true, error: null });
      const response = await fetch(`/api/users/${this.props.userId}`);
      const user = await response.json();
      this.setState({ user, loading: false });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }

  render() {
    const { user, loading, error } = this.state;

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!user) return null;

    return (
      <div>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
      </div>
    );
  }
}
```

```javascript
// Functional component
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return null;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### JavaScript → Python

**Key changes:**
1. Function syntax
2. Variable declarations
3. Loops and comprehensions
4. Dictionary/object operations
5. Array/list operations
6. Error handling
7. Async/await syntax

**Example:**
```javascript
// JavaScript
class TaskManager {
  constructor() {
    this.tasks = [];
    this.currentId = 1;
  }

  add(title, description = '') {
    const task = {
      id: this.currentId++,
      title,
      description,
      completed: false,
      createdAt: new Date()
    };
    this.tasks.push(task);
    return task;
  }

  complete(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = true;
    }
    return task;
  }

  getCompleted() {
    return this.tasks.filter(t => t.completed);
  }

  getPending() {
    return this.tasks.filter(t => !t.completed);
  }
}
```

```python
# Python
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

@dataclass
class Task:
    id: int
    title: str
    description: str = ''
    completed: bool = False
    created_at: datetime = datetime.now()

class TaskManager:
    def __init__(self):
        self.tasks: List[Task] = []
        self.current_id: int = 1

    def add(self, title: str, description: str = '') -> Task:
        task = Task(
            id=self.current_id,
            title=title,
            description=description
        )
        self.tasks.append(task)
        self.current_id += 1
        return task

    def complete(self, task_id: int) -> Optional[Task]:
        for task in self.tasks:
            if task.id == task_id:
                task.completed = True
                return task
        return None

    def get_completed(self) -> List[Task]:
        return [task for task in self.tasks if task.completed]

    def get_pending(self) -> List[Task]:
        return [task for task in self.tasks if not task.completed]
```

### Vue Options API → Composition API

**Key changes:**
1. `data()` → `ref()` / `reactive()`
2. `methods` → regular functions
3. `computed` → `computed()`
4. `watch` → `watch()` / `watchEffect()`
5. Lifecycle hooks → `onMounted()`, etc.

**Example:**
```javascript
// Options API
export default {
  props: ['userId'],
  data() {
    return {
      user: null,
      loading: false,
      error: null
    }
  },
  computed: {
    displayName() {
      return this.user ? this.user.name : 'Unknown'
    }
  },
  watch: {
    userId(newVal) {
      this.fetchUser()
    }
  },
  mounted() {
    this.fetchUser()
  },
  methods: {
    async fetchUser() {
      this.loading = true
      try {
        const response = await fetch(`/api/users/${this.userId}`)
        this.user = await response.json()
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    }
  }
}
```

```javascript
// Composition API
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps(['userId'])

const user = ref(null)
const loading = ref(false)
const error = ref(null)

const displayName = computed(() => user.value?.name || 'Unknown')

async function fetchUser() {
  loading.value = true
  try {
    const response = await fetch(`/api/users/${props.userId}`)
    user.value = await response.json()
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}

watch(() => props.userId, fetchUser)

onMounted(fetchUser)
```

## Handling language-specific features

### Async/await

**JavaScript:**
```javascript
async function getData() {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    console.error(error);
  }
}
```

**Python:**
```python
async def get_data():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                return await response.json()
    except Exception as error:
        print(error)
```

### List/dict comprehensions

**JavaScript:**
```javascript
const squares = numbers.map(n => n * n);
const evens = numbers.filter(n => n % 2 === 0);
const doubledOdds = numbers
  .filter(n => n % 2 !== 0)
  .map(n => n * 2);
```

**Python:**
```python
squares = [n * n for n in numbers]
evens = [n for n in numbers if n % 2 == 0]
doubled_odds = [n * 2 for n in numbers if n % 2 != 0]
```

### Error handling

**JavaScript:**
```javascript
try {
  // code
} catch (error) {
  console.error(error);
} finally {
  // cleanup
}
```

**Python:**
```python
try:
    # code
except ValueError as e:
    print(e)
except Exception as e:
    print(f"Unexpected error: {e}")
finally:
    # cleanup
```

## Type inference strategies

When adding types (JS → TS):

1. **Analyze usage patterns**
```typescript
// If used as: createUser('john', 25)
function createUser(name: string, age: number): User { ... }
```

2. **Look for property access**
```typescript
// If accessing user.email, user.name
interface User {
  email: string;
  name: string;
}
```

3. **Handle null/undefined appropriately**
```typescript
// Check if null checks exist
function getUser(id: number): User | null { ... }
```

## Best practices

1. **Preserve comments** - Keep documentation
2. **Maintain structure** - Keep file organization similar
3. **Add type safety** - When adding types, be precise
4. **Use standard libraries** - Don't reinvent the wheel
5. **Handle edge cases** - Preserve all error handling
6. **Test thoroughly** - Verify behavior matches
7. **Document changes** - Note translation decisions

## Validation checklist

After translation:

- [ ] Code compiles/runs without errors
- [ ] All types are valid (if typed language)
- [ ] No runtime errors
- [ ] Edge cases handled
- [ ] Error handling preserved
- [ ] Tests pass
- [ ] Performance is acceptable
- [ ] Code follows target language conventions

## Common pitfalls

### Overly literal translation
```javascript
// Bad - too literal
for (let i = 0; i < array.length; i++) {
  // process array[i]
}

// Better - idiomatic
array.forEach(item => {
  // process item
});
```

### Ignoring language features
```python
# Bad - JavaScript-style loop
for i in range(len(items)):
    print(items[i])

# Better - Pythonic
for item in items:
    print(item)
```

### Type safety loss
```typescript
// Bad - overly permissive
function process(data: any): any {
  return data.value;
}

// Better - specific types
interface Data {
  value: string;
}

function process(data: Data): string {
  return data.value;
}
```

## Resources

- TypeScript Handbook: https://www.typescriptlang.org/docs/
- React Hooks Guide: https://react.dev/reference/react
- Python Docs: https://docs.python.org/3/
- Vue 3 Guide: https://vuejs.org/guide/
