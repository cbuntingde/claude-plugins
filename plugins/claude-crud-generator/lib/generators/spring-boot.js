/**
 * Spring Boot CRUD Generator
 * Generates Spring Boot entities, repositories, services, and controllers
 */

/**
 * Generate complete CRUD for Spring Boot
 */
async function generateSpringBootCRUD(schema, options) {
  const files = [];

  const packagePath = 'com/example/crud';

  // Generate pom.xml
  files.push({
    path: 'pom.xml',
    content: generatePomXml()
  });

  // Generate application.properties
  files.push({
    path: 'src/main/resources/application.properties',
    content: generateApplicationProperties()
  });

  for (const table of schema.tables) {
    const modelName = toModelName(table.name);
    const variableName = toVariableName(table.name);

    // Generate Entity
    files.push({
      path: `src/main/java/${packagePath.replace(/\//g, '.')}/entity/${modelName}.java`,
      content: generateEntity(table, modelName, packagePath)
    });

    // Generate Repository
    files.push({
      path: `src/main/java/${packagePath.replace(/\//g, '.')}/repository/${modelName}Repository.java`,
      content: generateRepository(table, modelName, packagePath)
    });

    // Generate Service
    files.push({
      path: `src/main/java/${packagePath.replace(/\//g, '.')}/service/${modelName}Service.java`,
      content: generateServiceInterface(table, modelName, packagePath)
    });

    files.push({
      path: `src/main/java/${packagePath.replace(/\//g, '.')}/service/impl/${modelName}ServiceImpl.java`,
      content: generateServiceImpl(table, modelName, variableName, packagePath)
    });

    // Generate Controller
    files.push({
      path: `src/main/java/${packagePath.replace(/\//g, '.')}/controller/${modelName}Controller.java`,
      content: generateController(table, modelName, variableName, packagePath)
    });

    // Generate DTO
    files.push({
      path: `src/main/java/${packagePath.replace(/\//g, '.')}/dto/${modelName}DTO.java`,
      content: generateDTO(table, modelName, packagePath)
    });
  }

  // Generate main application class
  files.push({
    path: `src/main/java/${packagePath.replace(/\//g, '.')}/CrudApplication.java`,
    content: generateMainApplication(packagePath)
  });

  return { files };
}

/**
 * Generate Spring Boot Entity
 */
function generateEntity(table, modelName, packagePath) {
  const imports = new Set();
  const fields = table.columns
    .filter(col => !col.autoIncrement)
    .map(col => {
      const type = mapTypeToJava(col.type, imports);
      const annotations = getFieldAnnotations(col);
      return annotations.join('\n    ') + `\n    private ${type} ${toCamelCase(col.name)};`;
    })
    .join('\n\n    ');

  return `package ${packagePath.replace(/\//g, '.')}.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
${Array.from(imports).map(i => `import ${i};`).join('\n')}

@Entity
@Table(name = "${toSnakeCase(table.name)}")
public class ${modelName} {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

${fields}

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public ${modelName}() {}

    public ${modelName}(Long id) {
        this.id = id;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

${table.columns.filter(col => !col.autoIncrement).map(col => {
    const type = mapTypeToJava(col.type, new Set());
    const camelName = toCamelCase(col.name);
    return `    public ${type} get${toPascalCase(col.name)}() { return ${camelName}; }
    public void set${toPascalCase(col.name)}(${type} ${camelName}) { this.${camelName} = ${camelName}; }`;
}).join('\n\n')}

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
`;
}

/**
 * Generate Spring Data Repository
 */
function generateRepository(table, modelName, packagePath) {
  return `package ${packagePath.replace(/\//g, '.')}.repository;

import ${packagePath.replace(/\//g, '.')}.entity.${modelName};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ${modelName}Repository extends JpaRepository<${modelName}, Long> {

    Optional<${modelName}> findById(Long id);
}
`;
}

/**
 * Generate Service interface
 */
function generateServiceInterface(table, modelName, packagePath) {
  return `package ${packagePath.replace(/\//g, '.')}.service;

import ${packagePath.replace(/\//g, '.')}.dto.${modelName}DTO;
import ${packagePath.replace(/\//g, '.')}.entity.${modelName};
import java.util.List;

public interface ${modelName}Service {

    List<${modelName}DTO> findAll();
    ${modelName}DTO findById(Long id);
    ${modelName}DTO create(${modelName}DTO dto);
    ${modelName}DTO update(Long id, ${modelName}DTO dto);
    void delete(Long id);
}
`;
}

/**
 * Generate Service implementation
 */
function generateServiceImpl(table, modelName, variableName, packagePath) {
  return `package ${packagePath.replace(/\//g, '.')}.service.impl;

import ${packagePath.replace(/\//g, '.')}.dto.${modelName}DTO;
import ${packagePath.replace(/\//g, '.')}.entity.${modelName};
import ${packagePath.replace(/\//g, '.')}.repository.${modelName}Repository;
import ${packagePath.replace(/\//g, '.')}.service.${modelName}Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ${modelName}ServiceImpl implements ${modelName}Service {

    @Autowired
    private ${modelName}Repository ${variableName}Repository;

    @Override
    public List<${modelName}DTO> findAll() {
        return ${variableName}Repository.findAll().stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ${modelName}DTO findById(Long id) {
        ${modelName} entity = ${variableName}Repository.findById(id)
                .orElseThrow(() -> new RuntimeException("${modelName} not found with id: " + id));
        return entityToDTO(entity);
    }

    @Override
    public ${modelName}DTO create(${modelName}DTO dto) {
        ${modelName} entity = dtoToEntity(dto);
        ${modelName} saved = ${variableName}Repository.save(entity);
        return entityToDTO(saved);
    }

    @Override
    public ${modelName}DTO update(Long id, ${modelName}DTO dto) {
        ${modelName} entity = ${variableName}Repository.findById(id)
                .orElseThrow(() -> new RuntimeException("${modelName} not found with id: " + id));

        // Update fields
${table.columns.filter(col => !col.primaryKey && !col.autoIncrement).map(col => {
    return `        entity.set${toPascalCase(col.name)}(dto.get${toPascalCase(col.name)}());`;
}).join('\n')}

        ${modelName} updated = ${variableName}Repository.save(entity);
        return entityToDTO(updated);
    }

    @Override
    public void delete(Long id) {
        ${modelName} entity = ${variableName}Repository.findById(id)
                .orElseThrow(() -> new RuntimeException("${modelName} not found with id: " + id));
        ${variableName}Repository.delete(entity);
    }

    private ${modelName}DTO entityToDTO(${modelName} entity) {
        ${modelName}DTO dto = new ${modelName}DTO();
        dto.setId(entity.getId());
${table.columns.filter(col => !col.autoIncrement).map(col => {
    return `        dto.set${toPascalCase(col.name)}(entity.get${toPascalCase(col.name)}());`;
}).join('\n')}
        return dto;
    }

    private ${modelName} dtoToEntity(${modelName}DTO dto) {
        ${modelName} entity = new ${modelName}();
${table.columns.filter(col => !col.primaryKey && !col.autoIncrement).map(col => {
    return `        entity.set${toPascalCase(col.name)}(dto.get${toPascalCase(col.name)}());`;
}).join('\n')}
        return entity;
    }
}
`;
}

/**
 * Generate Spring MVC Controller
 */
function generateController(table, modelName, variableName, packagePath) {
  const path = toKebabCase(table.name);

  return `package ${packagePath.replace(/\//g, '.')}.controller;

import ${packagePath.replace(/\//g, '.')}.dto.${modelName}DTO;
import ${packagePath.replace(/\//g, '.')}.service.${modelName}Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/${path}")
public class ${modelName}Controller {

    @Autowired
    private ${modelName}Service ${variableName}Service;

    @GetMapping
    public ResponseEntity<List<${modelName}DTO>> getAll() {
        List<${modelName}DTO> items = ${variableName}Service.findAll();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<${modelName}DTO> getById(@PathVariable Long id) {
        ${modelName}DTO item = ${variableName}Service.findById(id);
        return ResponseEntity.ok(item);
    }

    @PostMapping
    public ResponseEntity<${modelName}DTO> create(@RequestBody ${modelName}DTO dto) {
        ${modelName}DTO created = ${variableName}Service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<${modelName}DTO> update(@PathVariable Long id, @RequestBody ${modelName}DTO dto) {
        ${modelName}DTO updated = ${variableName}Service.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ${variableName}Service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
`;
}

/**
 * Generate DTO
 */
function generateDTO(table, modelName, packagePath) {
  const imports = new Set();
  const fields = table.columns
    .filter(col => !col.autoIncrement)
    .map(col => {
      const type = mapTypeToJava(col.type, imports);
      return `    private ${type} ${toCamelCase(col.name)};`;
    })
    .join('\n');

  return `package ${packagePath.replace(/\//g, '.')}.dto;

${Array.from(imports).map(i => `import ${i};`).join('\n')}

public class ${modelName}DTO {

${fields}

    // Getters and Setters
${table.columns.filter(col => !col.autoIncrement).map(col => {
    const type = mapTypeToJava(col.type, new Set());
    const camelName = toCamelCase(col.name);
    return `    public ${type} get${toPascalCase(col.name)}() { return ${camelName}; }
    public void set${toPascalCase(col.name)}(${type} ${camelName}) { this.${camelName} = ${camelName}; }`;
}).join('\n\n')}
}
`;
}

/**
 * Generate pom.xml
 */
function generatePomXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>crud</artifactId>
    <version>1.0.0</version>
    <name>crud-generator</name>
    <description>Generated CRUD API</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`;
}

/**
 * Generate application.properties
 * SECURITY: Uses environment variables for all sensitive configuration
 */
function generateApplicationProperties() {
  return `# Server Configuration
server.port=\${SERVER_PORT:-8080}

# Database Configuration
# SECURITY: Use environment variables for all sensitive values
spring.datasource.url=\${DB_URL:-jdbc:mysql://localhost:3306/mydb}
spring.datasource.username=\${DB_USERNAME:-}
spring.datasource.password=\${DB_PASSWORD:-}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# CORS Configuration
# SECURITY: Restrict to specific origins in production
spring.web.cors.allowed-origins=\${CORS_ALLOWED_ORIGINS:-http://localhost:3000}
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true

# Logging
logging.level.org.springframework.web=INFO
logging.level.com.example.crud=DEBUG
`;
}

/**
 * Generate main application class
 */
function generateMainApplication(packagePath) {
  return `package ${packagePath.replace(/\//g, '.')};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CrudApplication {

    public static void main(String[] args) {
        SpringApplication.run(CrudApplication.class, args);
    }
}
`;
}

/**
 * Get template for specific component
 */
function getTemplate(type) {
  const templates = {
    entity: generateEntity.toString(),
    repository: generateRepository.toString(),
    service: generateServiceImpl.toString(),
    controller: generateController.toString(),
    dto: generateDTO.toString()
  };

  return templates[type] || 'Template not found';
}

/**
 * Helper: Map database types to Java types
 */
function mapTypeToJava(dbType, imports) {
  const typeMap = {
    'VARCHAR': 'String',
    'CHAR': 'String',
    'TEXT': 'String',
    'INTEGER': 'Integer',
    'INT': 'Integer',
    'BIGINT': 'Long',
    'SMALLINT': 'Short',
    'DECIMAL': 'java.math.BigDecimal',
    'NUMERIC': 'java.math.BigDecimal',
    'FLOAT': 'Float',
    'REAL': 'Float',
    'DOUBLE': 'Double',
    'BOOLEAN': 'Boolean',
    'DATE': 'java.time.LocalDate',
    'DATETIME': 'java.time.LocalDateTime',
    'TIMESTAMP': 'java.time.LocalDateTime',
    'JSON': 'String',
    'BLOB': 'byte[]'
  };

  const baseType = dbType.toUpperCase().split('(')[0];
  const javaType = typeMap[baseType] || 'String';

  if (javaType.includes('.')) {
    imports.add(javaType);
  }

  return javaType.split('.').pop();
}

/**
 * Helper: Get field annotations
 */
function getFieldAnnotations(col) {
  const annotations = [];

  if (col.name.includes('email')) {
    annotations.push('@Column(nullable = false, unique = true)');
  } else if (col.unique) {
    annotations.push('@Column(unique = true)');
  } else if (col.required) {
    annotations.push('@Column(nullable = false)');
  } else {
    annotations.push('@Column');
  }

  return annotations;
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
  return toCamelCase(toModelName(str));
}

/**
 * Helper: Convert to camelCase
 */
function toCamelCase(str) {
  const pascal = str.split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Helper: Convert to PascalCase
 */
function toPascalCase(str) {
  return str.split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Helper: Convert to kebab-case
 */
function toKebabCase(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

/**
 * Helper: Convert to snake_case
 */
function toSnakeCase(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

module.exports = {
  generateSpringBootCRUD,
  getTemplate
};
