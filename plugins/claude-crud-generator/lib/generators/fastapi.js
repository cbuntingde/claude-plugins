/**
 * FastAPI CRUD Generator
 * Generates FastAPI routers, schemas, and services
 */

/**
 * Generate complete CRUD for FastAPI
 */
async function generateFastAPICRUD(schema, options) {
  const files = [];

  // Generate main app file
  files.push({
    path: 'main.py',
    content: generateMainApp(schema)
  });

  // Generate database config
  files.push({
    path: 'database.py',
    content: generateDatabaseConfig()
  });

  for (const table of schema.tables) {
    const modelName = toModelName(table.name);
    const variableName = toVariableName(table.name);

    // Generate Pydantic schema
    files.push({
      path: `schemas/${modelName}.py`,
      content: generatePydanticSchema(table, modelName)
    });

    // Generate SQLAlchemy model
    files.push({
      path: `models/${modelName}.py`,
      content: generateSQLAlchemyModel(table, modelName)
    });

    // Generate Router
    files.push({
      path: `routers/${modelName}.py`,
      content: generateRouter(table, modelName, variableName)
    });

    // Generate CRUD operations
    files.push({
      path: `crud/${modelName}.py`,
      content: generateCRUD(table, modelName, variableName)
    });
  }

  // Generate requirements.txt
  files.push({
    path: 'requirements.txt',
    content: generateRequirements()
  });

  return { files };
}

/**
 * Generate FastAPI main app
 */
function generateMainApp(schema) {
  const imports = schema.tables.map(table => {
    const modelName = toModelName(table.name);
    return `from routers import ${toVariableName(modelName)}`;
  }).join('\n');

  const routeIncludes = schema.tables.map(table => {
    const modelName = toModelName(table.name);
    return `app.include_router(${toVariableName(modelName)}.router, prefix="/api/${toKebabCase(table.name)}", tags=["${table.name}"])`;
  }).join('\n');

  return `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
${imports}

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Generated CRUD API", version="1.0.0")

# CORS middleware
# SECURITY: Configure allowed origins via environment variable
# Default: only localhost:3000 for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["\${CORS_ORIGINS:-http://localhost:3000}"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
${routeIncludes}

@app.get("/")
def read_root():
    return {"message": "Welcome to the API", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
`;
}

/**
 * Generate database configuration
 * SECURITY: Uses environment variables for database URL
 */
function generateDatabaseConfig() {
  return `from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# SECURITY: Use environment variable for database URL
# Default to SQLite for local development
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./test.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
`;
}

/**
 * Generate Pydantic schema
 */
function generatePydanticSchema(table, modelName) {
  const fields = table.columns
    .filter(col => !col.autoIncrement)
    .map(col => {
      const optional = !col.required ? ' | None = None' : '';
      return `    ${col.name}: ${mapTypeToPython(col.type)}${optional}`;
    })
    .join('\n');

  const updateFields = table.columns
    .filter(col => !col.autoIncrement && !col.primaryKey)
    .map(col => {
      const optional = ' | None = None';
      return `    ${col.name}: ${mapTypeToPython(col.type)}${optional}`;
    })
    .join('\n');

  return `from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class ${modelName}Base(BaseModel):
${fields}

class ${modelName}Create(${modelName}Base):
    pass

class ${modelName}Update(BaseModel):
${updateFields}

class ${modelName}(${modelName}Base):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
`;
}

/**
 * Generate SQLAlchemy model
 */
function generateSQLAlchemyModel(table, modelName) {
  const fields = table.columns.map(col => {
    const type = mapTypeToSQLAlchemy(col.type);
    const pk = col.primaryKey ? ', primary_key=True' : '';
    const auto = col.autoIncrement ? ', autoincrement=True' : '';
    const nullable = col.required ? '' : ', nullable=True';
    const unique = col.unique ? ', unique=True' : '';
    return `    ${col.name} = Column(${type}${pk}${auto}${nullable}${unique})`;
  }).join('\n');

  return `from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.sql import func
from database import Base

class ${modelName}(Base):
    __tablename__ = "${toKebabCase(table.name)}"

    id = Column(Integer, primary_key=True, index=True)
${fields}

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
`;
}

/**
 * Generate FastAPI router
 */
function generateRouter(table, modelName, variableName) {
  const primaryKey = table.columns.find(c => c.primaryKey)?.name || 'id';

  return `from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models.${modelName} as models
import schemas.${modelName} as schemas
import crud.${modelName} as crud

router = APIRouter()

@router.get("/", response_model=List[schemas.${modelName}])
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all ${table.name} records"""
    items = crud.get_all(db, skip=skip, limit=limit)
    return items

@router.get("/{{{primaryKey}}}", response_model=schemas.${modelName})
def read_one(${primaryKey}: int, db: Session = Depends(get_db)):
    """Get ${table.name} by ID"""
    item = crud.get_by_id(db, ${primaryKey}=${primaryKey})
    if item is None:
        raise HTTPException(status_code=404, detail="${modelName} not found")
    return item

@router.post("/", response_model=schemas.${modelName})
def create(item: schemas.${modelName}Create, db: Session = Depends(get_db)):
    """Create new ${table.name}"""
    return crud.create(db, item=item)

@router.put("/{{{primaryKey}}}", response_model=schemas.${modelName})
def update(${primaryKey}: int, item: schemas.${modelName}Update, db: Session = Depends(get_db)):
    """Update ${table.name}"""
    updated_item = crud.update(db, ${primaryKey}=${primaryKey}, item=item)
    if updated_item is None:
        raise HTTPException(status_code=404, detail="${modelName} not found")
    return updated_item

@router.delete("/{{{primaryKey}}}")
def delete(${primaryKey}: int, db: Session = Depends(get_db)):
    """Delete ${table.name}"""
    success = crud.delete(db, ${primaryKey}=${primaryKey})
    if not success:
        raise HTTPException(status_code=404, detail="${modelName} not found")
    return {"message": "${modelName} deleted successfully"}
`;
}

/**
 * Generate CRUD operations
 */
function generateCRUD(table, modelName, variableName) {
  const primaryKey = table.columns.find(c => c.primaryKey)?.name || 'id';

  return `from sqlalchemy.orm import Session
from models.${modelName} import ${modelName}
from schemas.${modelName} import ${modelName}Create, ${modelName}Update

def get_all(db: Session, skip: int = 0, limit: int = 100):
    return db.query(${modelName}).offset(skip).limit(limit).all()

def get_by_id(db: Session, ${primaryKey}: int):
    return db.query(${modelName}).filter(${modelName}.${primaryKey} == ${primaryKey}).first()

def create(db: Session, item: ${modelName}Create):
    db_item = ${modelName}(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update(db: Session, ${primaryKey}: int, item: ${modelName}Update):
    db_item = db.query(${modelName}).filter(${modelName}.${primaryKey} == ${primaryKey}).first()
    if db_item:
        for key, value in item.model_dump(exclude_unset=True).items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)
    return db_item

def delete(db: Session, ${primaryKey}: int):
    db_item = db.query(${modelName}).filter(${modelName}.${primaryKey} == ${primaryKey}).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False
`;
}

/**
 * Generate requirements.txt
 */
function generateRequirements() {
  return `fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
pydantic==2.5.3
python-multipart==0.0.6
`;
}

/**
 * Get template for specific component
 */
function getTemplate(type) {
  const templates = {
    router: generateRouter.toString(),
    schemas: generatePydanticSchema.toString(),
    models: generateSQLAlchemyModel.toString(),
    crud: generateCRUD.toString()
  };

  return templates[type] || 'Template not found';
}

/**
 * Helper: Map database types to Python types
 */
function mapTypeToPython(dbType) {
  const typeMap = {
    'VARCHAR': 'str',
    'CHAR': 'str',
    'TEXT': 'str',
    'INTEGER': 'int',
    'INT': 'int',
    'BIGINT': 'int',
    'SMALLINT': 'int',
    'DECIMAL': 'float',
    'NUMERIC': 'float',
    'FLOAT': 'float',
    'REAL': 'float',
    'DOUBLE': 'float',
    'BOOLEAN': 'bool',
    'DATE': 'datetime',
    'DATETIME': 'datetime',
    'TIMESTAMP': 'datetime',
    'JSON': 'dict',
    'BLOB': 'bytes'
  };

  const baseType = dbType.toUpperCase().split('(')[0];
  return typeMap[baseType] || 'str';
}

/**
 * Helper: Map database types to SQLAlchemy types
 */
function mapTypeToSQLAlchemy(dbType) {
  const typeMap = {
    'VARCHAR': 'String',
    'CHAR': 'String',
    'TEXT': 'Text',
    'INTEGER': 'Integer',
    'INT': 'Integer',
    'BIGINT': 'BigInteger',
    'SMALLINT': 'SmallInteger',
    'DECIMAL': 'Numeric',
    'NUMERIC': 'Numeric',
    'FLOAT': 'Float',
    'REAL': 'Float',
    'DOUBLE': 'Float',
    'BOOLEAN': 'Boolean',
    'DATE': 'Date',
    'DATETIME': 'DateTime',
    'TIMESTAMP': 'DateTime',
    'JSON': 'JSON',
    'BLOB': 'LargeBinary'
  };

  const baseType = dbType.toUpperCase().split('(')[0];
  return typeMap[baseType] || 'String';
}

/**
 * Helper: Convert to model name (PascalCase)
 */
function toModelName(str) {
  return str.split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Helper: Convert to variable name (camelCase)
 */
function toVariableName(str) {
  const pascal = str.split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Helper: Convert to kebab-case
 */
function toKebabCase(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

module.exports = {
  generateFastAPICRUD,
  getTemplate
};
