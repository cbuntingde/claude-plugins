# Detection Patterns Reference

Complete reference of all memory leak patterns detected by this plugin.

## JavaScript Patterns

### 1. Event Listener Not Removed
**Severity:** High
**Pattern:** `addEventListener(`

**Description:**
Event listeners that are added but never removed can cause memory leaks, especially in single-page applications where components are frequently mounted and unmounted.

**Detection Code:**
```javascript
// ❌ Detected as potential leak
element.addEventListener('click', handler);
```

**Fix:**
```javascript
// ✅ Correct implementation
element.addEventListener('click', handler);
// Later, when done:
element.removeEventListener('click', handler);
```

**React Example:**
```javascript
useEffect(() => {
  const handler = () => console.log('clicked');
  element.addEventListener('click', handler);

  // Cleanup function
  return () => {
    element.removeEventListener('click', handler);
  };
}, []);
```

---

### 2. Closure Retaining Large Objects
**Severity:** Medium
**Pattern:** `function() {` (with context analysis)

**Description:**
Closures that capture references to large objects prevent those objects from being garbage collected even after they're no longer needed.

**Detection Code:**
```javascript
// ❌ Closure retains entire largeData array
function createHandler() {
  const largeData = new Array(1000000).fill('data');
  return function() {
    console.log(largeData.length);
  };
}
```

**Fix:**
```javascript
// ✅ Only capture what's needed
function createHandler() {
  const largeData = new Array(1000000).fill('data');
  const length = largeData.length; // Extract needed value
  largeData = null; // Clear reference
  return function() {
    console.log(length);
  };
}
```

---

### 3. Uncleared Intervals/Timeouts
**Severity:** High
**Pattern:** `setInterval` or `setTimeout`

**Description:**
Timers that are not cleared continue to execute and retain references to their callbacks, preventing garbage collection.

**Detection Code:**
```javascript
// ❌ Timer never cleared
setInterval(() => {
  updateData();
}, 1000);
```

**Fix:**
```javascript
// ✅ Store and clear timer
const timerId = setInterval(() => {
  updateData();
}, 1000);

// Later:
clearInterval(timerId);
```

**Component Cleanup Example:**
```javascript
useEffect(() => {
  const timerId = setInterval(() => updateData(), 1000);
  return () => clearInterval(timerId);
}, []);
```

---

### 4. Global Variable Accumulation
**Severity:** Medium
**Pattern:** `window.` or `global.`

**Description:**
Global variables that accumulate data never get garbage collected because they're always reachable from the global scope.

**Detection Code:**
```javascript
// ❌ Global cache grows forever
window.cache = {};
window.cache[key] = largeData;
```

**Fix:**
```javascript
// ✅ Use module-scoped or instance-scoped variables
const cache = new Map();

function setCache(key, value) {
  cache.set(key, value);
}

function clearCache() {
  cache.clear();
}
```

---

### 5. DOM References in Detached Elements
**Severity:** Medium
**Pattern:** `document.createElement` or `document.getElementById`

**Description:**
DOM elements created but not attached to the document still occupy memory if references are retained.

**Detection Code:**
```javascript
// ❌ Array retains references to detached elements
const elements = [];
for (let i = 0; i < 1000; i++) {
  elements.push(document.createElement('div'));
}
```

**Fix:**
```javascript
// ✅ Clear references when done
let element = document.createElement('div');
// Use the element
document.body.appendChild(element);
// Later:
document.body.removeChild(element);
element = null; // Clear reference
```

---

## TypeScript Patterns

### 6. Subscription Not Unsubscribed
**Severity:** High
**Pattern:** `.subscribe(`

**Description:**
RxJS subscriptions that are not unsubscribed continue to receive and process values, retaining memory.

**Detection Code:**
```typescript
// ❌ Subscription never unsubscribed
observable.subscribe(data => {
  console.log(data);
});
```

**Fix:**
```typescript
// ✅ Store and unsubscribe
const subscription = observable.subscribe(data => {
  console.log(data);
});

// Later:
subscription.unsubscribe();
```

**Angular Component Example:**
```typescript
private subscriptions: Subscription[] = [];

ngOnInit() {
  this.subscriptions.push(
    this.dataService.getData().subscribe(data => {
      this.processData(data);
    })
  );
}

ngOnDestroy() {
  this.subscriptions.forEach(sub => sub.unsubscribe());
}
```

**Using takeUntil:**
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.dataService.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.processData(data);
    });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

### 7. Memory Retention in Subjects
**Severity:** Medium
**Pattern:** `new BehaviorSubject` or `new ReplaySubject`

**Description:**
BehaviorSubject and ReplaySubject retain historical values in memory, which can accumulate over time.

**Detection Code:**
```typescript
// ❌ Retains 1000 values in memory
const subject$ = new ReplaySubject(1000);
```

**Fix:**
```typescript
// ✅ Use regular Subject when history isn't needed
const subject$ = new Subject();
```

---

## Python Patterns

### 8. Circular References
**Severity:** Medium
**Pattern:** `self.` assigned to `self`

**Description:**
Objects with circular references (A references B, B references A) prevent garbage collection unless explicitly broken.

**Detection Code:**
```python
# ❌ Circular reference
class Node:
    def __init__(self):
        self.parent = None
        self.children = []

node = Node()
node.parent = node  # Circular reference
```

**Fix:**
```python
# ✅ Use weak references
import weakref

class Node:
    def __init__(self):
        self.parent = None
        self.children = []

    def set_parent(self, parent):
        # Use weakref to avoid cycle
        self.parent = weakref.ref(parent)
```

---

### 9. Unclosed File Handles
**Severity:** High
**Pattern:** `open(`

**Description:**
File handles that are not explicitly closed consume system resources and can lead to file descriptor leaks.

**Detection Code:**
```python
# ❌ File never closed
f = open('file.txt', 'r')
data = f.read()
# File remains open
```

**Fix:**
```python
# ✅ Use context manager
with open('file.txt', 'r') as f:
    data = f.read()
# File automatically closed
```

---

### 10. Unclosed Database Connections
**Severity:** High
**Pattern:** `connect(` or `.cursor(`

**Description:**
Database connections and cursors that aren't closed can exhaust connection pools.

**Detection Code:**
```python
# ❌ Connection never closed
conn = db.connect()
cursor = conn.cursor()
cursor.execute('SELECT * FROM table')
# Connection remains open
```

**Fix:**
```python
# ✅ Use context managers
with db.connect() as conn:
    with conn.cursor() as cursor:
        cursor.execute('SELECT * FROM table')
# Automatically closed
```

---

### 11. Global Caches Without Limits
**Severity:** Medium
**Pattern:** Global dictionary assignments

**Description:**
Unbounded global caches can grow indefinitely, consuming memory.

**Detection Code:**
```python
# ❌ Unbounded cache
CACHE = {}

def memoize(key, value):
    CACHE[key] = value  # Grows forever
```

**Fix:**
```python
# ✅ Use LRU cache with size limit
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_function(arg):
    # Automatically limited to 128 entries
    return complex_calculation(arg)
```

---

### 12. Thread Not Joined
**Severity:** Medium
**Pattern:** `Thread(` or `.start()`

**Description:**
Threads that aren't joined continue to exist and retain references.

**Detection Code:**
```python
# ❌ Thread never joined
thread = Thread(target=worker)
thread.start()
# Thread continues running
```

**Fix:**
```python
# ✅ Join the thread
thread = Thread(target=worker)
thread.start()
# Later:
thread.join()

# Or use daemon for background tasks:
thread = Thread(target=worker, daemon=True)
thread.start()
```

---

## Summary by Severity

### High Severity (Fix Immediately)
- Event Listener Not Removed
- Uncleared Intervals/Timeouts
- Subscription Not Unsubscribed
- Unclosed File Handles
- Unclosed Database Connections

### Medium Severity (Review and Fix)
- Closure Retaining Large Objects
- Global Variable Accumulation
- DOM References in Detached Elements
- Memory Retention in Subjects
- Circular References
- Global Caches Without Limits
- Thread Not Joined

## Best Practices

1. **Use Cleanup Patterns**: Implement cleanup functions, useEffect returns, destructor methods
2. **Context Managers**: Prefer `with` statements in Python
3. **Weak References**: Use weakref for breaking cycles
4. **Limits**: Set size limits on caches and buffers
5. **Profiling**: Regularly profile memory usage in development
6. **Testing**: Add memory leak tests to your test suite

## Additional Resources

- [Chrome DevTools Memory Profiling](https://developer.chrome.com/docs/devtools/memory-problems/)
- [Node.js Memory Leaks Detection](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Python tracemalloc](https://docs.python.org/3/library/tracemalloc.html)
- [RxJS Memory Management](https://rxjs.dev/deprecations/api/6)
