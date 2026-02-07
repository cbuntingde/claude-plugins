# Changelog

All notable changes to the SQL Query Optimizer Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-17

### Added
- Initial release of SQL Query Optimizer plugin
- `/optimize-sql` command for query optimization
- `/analyze-query` command for deep performance analysis
- `/explain-plan` command for execution plan analysis
- `/suggest-indexes` command for index recommendations
- `/refactor-query` command for query refactoring
- SQL Optimization Expert agent for complex query analysis
- Query Optimization Detector skill for real-time feedback
- Automatic hooks for SQL file analysis
- Support for PostgreSQL, MySQL, SQLite, SQL Server, and Oracle
- Configuration system with `.claude/settings.json`
- Schema context support for better analysis
- Multiple output formats (text, markdown, JSON, HTML)
- CI/CD integration examples
- Comprehensive documentation

### Features
- Query structure optimization (subqueries to JOINs, CTEs)
- Index recommendation (composite, partial, expression indexes)
- Anti-pattern detection (N+1, SELECT *, functions on indexed columns)
- Execution plan analysis and comparison
- Query refactoring with multiple style guides
- Write performance impact analysis
- Index size estimation
- Batch query optimization
- Interactive refactoring mode
- Dry-run mode for safe testing
- Database-specific optimization patterns

## [Unreleased]

### Planned
- Visual query plan representation
- Query history and regression detection
- Machine learning for cost estimation
- Additional database support (Cassandra, MongoDB)
- Performance trend analysis
- Automatic migration generation
- Query template library
