# Quick Start Guide

Get started with the Claude Code CRUD Generator Plugin in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- A database schema file (SQL, Prisma, or Mongoose)

## Installation

```bash
npm install -g @claude-code/crud-generator
```

## Step 1: Prepare Your Schema

Create a schema file (e.g., `schema.sql`):

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Step 2: Generate CRUD

### For Express.js (TypeScript/JavaScript)

```bash
crud-generator generate \
  --schema ./schema.sql \
  --framework express \
  --language typescript \
  --output ./my-api
```

**Result:**
```
my-api/
├── models/
│   ├── User.js
│   └── Post.js
├── controllers/
│   ├── UserController.js
│   └── PostController.js
├── routes/
│   ├── userRoutes.js
│   └── postRoutes.js
├── services/
│   ├── UserService.js
│   └── PostService.js
└── index.js
```

### For FastAPI (Python)

```bash
crud-generator generate \
  --schema ./schema.sql \
  --framework fastapi \
  --language python \
  --output ./fastapi-app
```

**Result:**
```
fastapi-app/
├── models/
│   ├── user.py
│   └── post.py
├── schemas/
│   ├── user.py
│   └── post.py
├── routers/
│   ├── user.py
│   └── post.py
├── crud/
│   ├── user.py
│   └── post.py
├── main.py
├── database.py
└── requirements.txt
```

### For Django (Python)

```bash
crud-generator generate \
  --schema ./schema.sql \
  --framework django \
  --output ./django-app
```

### For Spring Boot (Java)

```bash
crud-generator generate \
  --schema ./schema.sql \
  --framework spring-boot \
  --output ./spring-app
```

## Step 3: Install Dependencies & Run

### Express.js

```bash
cd my-api
npm install express mongoose
node index.js
```

API available at `http://localhost:3000`

### FastAPI

```bash
cd fastapi-app
pip install -r requirements.txt
uvicorn main:app --reload
```

API available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Django

```bash
cd django-app
pip install -r requirements.txt
# Add apps to INSTALLED_APPS in settings.py
python manage.py migrate
python manage.py runserver
```

API available at `http://localhost:8000`

### Spring Boot

```bash
cd spring-app
mvn clean install
mvn spring-boot:run
```

API available at `http://localhost:8080`

## Step 4: Test Your API

All generated APIs follow REST conventions:

```bash
# Get all users
curl http://localhost:3000/users

# Get user by ID
curl http://localhost:3000/users/1

# Create user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Update user
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe"}'

# Delete user
curl -X DELETE http://localhost:3000/users/1
```

## Parse Schema Before Generating

Preview your schema structure:

```bash
crud-generator parse --schema ./schema.sql
```

Output:
```
Schema: SQL Schema

════════════════════════════════════════════════════════════════════════════════

📋 Table: users
────────────────────────────────────────────────────────────────────────────────
Field Name               Type                   Constraints
────────────────────────────────────────────────────────────────────────────────
id                       INT                    PK, AUTO_INCREMENT
name                     VARCHAR(255)           NOT NULL
email                    VARCHAR(255)           UNIQUE, NOT NULL
created_at               TIMESTAMP
```

## Interactive Mode

Not sure about the options? Use interactive mode:

```bash
crud-generator generate
```

You'll be prompted for:
- Schema file path
- Framework choice
- Language preference
- Output directory

## Common Use Cases

### Blog API

```bash
crud-generator generate \
  --schema blog-schema.sql \
  --framework express \
  --output ./blog-api
```

### E-commerce API

```bash
crud-generator generate \
  --schema ecommerce.prisma \
  --framework fastapi \
  --output ./shop-api
```

### Internal Dashboard

```bash
crud-generator generate \
  --schema dashboard-schema.sql \
  --framework django \
  --output ./dashboard
```

## Next Steps

1. **Customize Models**: Edit generated models to add validations
2. **Add Authentication**: Integrate JWT or OAuth
3. **Add Tests**: Write unit and integration tests
4. **Add Documentation**: Use Swagger/OpenAPI
5. **Deploy**: Deploy to your hosting platform

## Tips

- **Version Control**: Add generated code to git
- **Database Setup**: Configure database connection strings
- **Environment Variables**: Use `.env` files for configuration
- **Validation**: Add additional validation as needed
- **Error Handling**: Customize error responses

## Troubleshooting

### Port Already in Use

Change the port in the generated files:
- Express: `app.listen(3001)`
- FastAPI: `uvicorn main:app --port 8001`
- Django: `python manage.py runserver 8001`
- Spring Boot: `server.port=8081` in `application.properties`

### Database Connection Failed

Update database URL:
- Express: `MONGODB_URI` in `.env`
- FastAPI: `DATABASE_URL` in `database.py`
- Django: `DATABASES` in `settings.py`
- Spring Boot: `spring.datasource.*` in `application.properties`

## Need Help?

- Check the [full documentation](README.md)
- View [examples](examples/)
- Report issues on [GitHub](https://github.com/claude-code/crud-generator/issues)

Happy coding! 🚀
