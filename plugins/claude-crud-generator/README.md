# Claude Code CRUD Generator Plugin

Generate complete CRUD operations from database schemas for multiple frameworks and languages.

## Features

- **Multiple Schema Formats**: SQL, Prisma, Mongoose, SQLAlchemy, TypeORM
- **Framework Support**: Express.js, FastAPI, Django, Spring Boot
- **Language Support**: TypeScript, Python, Java
- **Complete CRUD**: Models, Controllers, Services, Routes, DTOs, etc.
- **Production Ready**: Best practices, validation, error handling

## Installation

```bash
npm install -g @claude-code/crud-generator
```

## Usage

### Interactive Mode

```bash
crud-generator generate
```

You'll be prompted for:
- Schema file path
- Framework (Express, FastAPI, Django, Spring Boot)
- Programming language
- Output directory

### Command Line Options

```bash
crud-generator generate \
  --schema ./schema.sql \
  --framework express \
  --language typescript \
  --output ./output
```

### Parse Schema

View parsed schema information:

```bash
crud-generator parse --schema ./schema.sql
```

### Generate Templates

Generate individual component templates:

```bash
crud-generator template --type controller --framework express
```

## Supported Schemas

### SQL Schema

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Prisma Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
}
```

### Mongoose Schema

```javascript
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
});
```

## Generated Files

### Express.js
- `models/` - Mongoose/Sequelize models
- `controllers/` - Route controllers with full CRUD
- `services/` - Business logic layer
- `routes/` - Express route definitions
- `index.js` - Main application file

### FastAPI
- `models/` - SQLAlchemy models
- `schemas/` - Pydantic schemas
- `routers/` - FastAPI routers
- `crud/` - CRUD operations
- `main.py` - Application entry point
- `database.py` - Database configuration
- `requirements.txt` - Python dependencies

### Django
- `models.py` - Django models
- `serializers.py` - DRF serializers
- `views.py` - ViewSets
- `urls.py` - URL routing
- `admin.py` - Admin configuration

### Spring Boot
- `entity/` - JPA entities
- `repository/` - Spring Data repositories
- `service/` - Service interfaces and implementations
- `controller/` - REST controllers
- `dto/` - Data Transfer Objects
- `pom.xml` - Maven configuration

## Examples

### Example 1: Generate Express.js CRUD

```bash
crud-generator generate \
  --schema ./database-schema.sql \
  --framework express \
  --language typescript \
  --output ./express-api
```

Generated structure:
```
express-api/
├── models/
│   ├── User.js
│   └── Product.js
├── controllers/
│   ├── UserController.js
│   └── ProductController.js
├── routes/
│   ├── userRoutes.js
│   └── productRoutes.js
├── services/
│   ├── UserService.js
│   └── ProductService.js
└── index.js
```

### Example 2: Generate FastAPI CRUD

```bash
crud-generator generate \
  --schema ./schema.prisma \
  --framework fastapi \
  --language python \
  --output ./fastapi-app
```

### Example 3: Parse Schema First

```bash
# View schema structure
crud-generator parse --schema ./models.sql

# Then generate
crud-generator generate --schema ./models.sql --framework django
```

## API Endpoints Generated

For each table, the following REST endpoints are created:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/{resource}` | Get all records (with pagination) |
| GET    | `/{resource}/{id}` | Get single record by ID |
| POST   | `/{resource}` | Create new record |
| PUT    | `/{resource}/{id}` | Update existing record |
| DELETE | `/{resource}/{id}` | Delete record |

## Type Mapping

### SQL to TypeScript/JavaScript

| SQL Type | TypeScript Type |
|----------|----------------|
| VARCHAR, CHAR, TEXT | `string` |
| INTEGER, INT, BIGINT | `number` |
| DECIMAL, FLOAT, DOUBLE | `number` |
| BOOLEAN | `boolean` |
| DATE, DATETIME, TIMESTAMP | `Date` |
| BLOB | `Buffer` |

### SQL to Python

| SQL Type | Python Type |
|----------|-------------|
| VARCHAR, CHAR, TEXT | `str` |
| INTEGER, INT, BIGINT | `int` |
| DECIMAL, FLOAT, DOUBLE | `float` |
| BOOLEAN | `bool` |
| DATE, DATETIME | `datetime` |
| BLOB | `bytes` |

### SQL to Java

| SQL Type | Java Type |
|----------|-----------|
| VARCHAR, CHAR, TEXT | `String` |
| INTEGER, INT | `Integer` |
| BIGINT | `Long` |
| DECIMAL, NUMERIC | `BigDecimal` |
| FLOAT, REAL | `Float` |
| DOUBLE | `Double` |
| BOOLEAN | `Boolean` |
| DATE | `LocalDate` |
| DATETIME, TIMESTAMP | `LocalDateTime` |

## Configuration

### Environment Variables

For Express.js:
```env
MONGODB_URI=mongodb://localhost:27017/mydb
PORT=3000
```

For FastAPI:
```env
DATABASE_URL=postgresql://user:password@localhost/dbname
```

For Spring Boot:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
spring.datasource.password=password
```

## Running Generated Code

### Express.js
```bash
cd output
npm install express mongoose
npm start
```

### FastAPI
```bash
cd output
pip install -r requirements.txt
uvicorn main:app --reload
```

### Django
```bash
cd output
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Spring Boot
```bash
cd output
mvn spring-boot:run
```

## Features by Framework

### Express.js
- Mongoose ODM integration
- Service layer pattern
- Error handling middleware
- Express Router
- Timestamps support

### FastAPI
- SQLAlchemy ORM
- Pydantic validation
- Automatic API docs (Swagger)
- Dependency injection
- Pagination support

### Django
- Django REST Framework
- ViewSets and Routers
- Admin panel integration
- Search and filtering
- Pagination

### Spring Boot
- Spring Data JPA
- Service layer pattern
- DTO pattern
- CORS configuration
- Maven build

## Best Practices

The generated code follows these best practices:

- **Separation of Concerns**: Controllers, Services, Models separated
- **Error Handling**: Comprehensive error handling
- **Validation**: Input validation at multiple layers
- **REST Standards**: Proper HTTP methods and status codes
- **Security**: Basic security best practices
- **Documentation**: Self-documenting code structure

## Extending the Plugin

You can extend the plugin by adding new generators:

```javascript
// lib/generators/custom-framework.js
async function generateCustomFrameworkCRUD(schema, options) {
  // Your implementation
  return { files };
}

module.exports = { generateCustomFrameworkCRUD };
```

## Troubleshooting

### Schema Not Parsed
- Ensure your schema file has valid syntax
- Check that the file extension matches the format (.sql, .prisma, etc.)

### Missing Dependencies
- Run `npm install` for Node.js projects
- Run `pip install -r requirements.txt` for Python projects
- Run `mvn clean install` for Spring Boot projects

### Database Connection Issues
- Verify database is running
- Check connection string in configuration
- Ensure database credentials are correct

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [github.com/cbuntingde/claude-plugins-dev/issues](https://github.com/cbuntingde/claude-plugins-dev/issues)
- Documentation: [docs.claude.com/crud-generator](https://github.com/cbuntingde/claude-plugins-dev/tree/main/plugins/claude-crud-generator)

---

**Plugin Author**: cbuntingde
**Version**: 1.0.0
**Homepage**: https://github.com/cbuntingde/claude-plugins-dev/tree/main/plugins/claude-crud-generator

## Changelog
- Initial release
- Support for Express.js, FastAPI, Django, Spring Boot
- SQL, Prisma, Mongoose schema parsing
- Complete CRUD generation
