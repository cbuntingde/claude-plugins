---
description: Validate architecture pattern compliance
---

# /check-patterns

Validate compliance with specified architecture patterns.

## Usage

```
/check-patterns [directory] [pattern]
```

## Arguments

- **directory** (optional) - Root directory to analyze (default: current directory)
- **pattern** (optional) - Architecture pattern to validate:
  - `layered` - Layered/N-tier architecture (default)
  - `hexagonal` - Ports and adapters architecture
  - `clean` - Clean/onion architecture
  - `microservices` - Microservices architecture

## Supported Patterns

### Layered Architecture
Validates that layers don't skip levels:
- Presentation → Application → Domain → Infrastructure
- No Presentation → Infrastructure imports
- No Domain → Application imports

### Hexagonal Architecture
Validates ports and adapters separation:
- Domain must not import from adapters or infrastructure
- Ports should only define interfaces
- Adapters depend on ports, not vice versa

### Clean Architecture
Validates onion architecture layers:
- Entities must not import from outer layers
- Use cases must not import from frameworks/web
- Dependency rule: dependencies point inward

### Microservices
Validates service boundaries:
- Services must not directly import from other services
- Shared code should be in dedicated modules
- Clear separation between services

## Examples

```bash
# Validate layered architecture (default)
/check-patterns

# Validate hexagonal architecture
/check-patterns ./src hexagonal

# Validate clean architecture
/check-patterns . clean
```

## Output

```
╔════════════════════════════════════════════════════════════════╗
║           ARCHITECTURE PATTERN VALIDATION RESULTS              ║
╠════════════════════════════════════════════════════════════════╣
║  Pattern: layered                                              ║
║  Status: FAIL                                                  ║
║  Violations: 2                                                 ║
╠════════════════════════════════════════════════════════════════╣
║  [1] Presentation layer imports from Persistence layer         ║
║  [2] Domain imports from outer layers                          ║
╚════════════════════════════════════════════════════════════════╝
```

## Configuration

Set the default pattern in `.claude/architecture.json`:

```json
{
  "pattern_violations": {
    "enabled": true,
    "pattern": "layered",
    "severity": "error"
  }
}
```

## Exit Codes

- `0` - Pattern validation passed
- `1` - Pattern violations detected
