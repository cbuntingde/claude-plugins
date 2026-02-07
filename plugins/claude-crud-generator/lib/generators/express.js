/**
 * Express.js CRUD Generator
 * Generates Express.js controllers, routes, and services
 */

/**
 * Generate complete CRUD for Express.js
 */
async function generateExpressCRUD(schema, options) {
  const files = [];

  for (const table of schema.tables) {
    const modelName = toModelName(table.name);
    const variableName = toVariableName(table.name);

    // Generate Model
    files.push({
      path: `models/${modelName}.js`,
      content: generateModel(table, modelName)
    });

    // Generate Controller
    files.push({
      path: `controllers/${modelName}Controller.js`,
      content: generateController(table, modelName, variableName)
    });

    // Generate Routes
    files.push({
      path: `routes/${modelName}Routes.js`,
      content: generateRoutes(table, modelName, variableName)
    });

    // Generate Service
    files.push({
      path: `services/${modelName}Service.js`,
      content: generateService(table, modelName, variableName)
    });
  }

  // Generate index file
  files.push({
    path: 'index.js',
    content: generateIndexFile(schema)
  });

  return { files };
}

/**
 * Generate Mongoose/Sequelize model
 */
function generateModel(table, modelName) {
  const fields = table.columns
    .filter(col => col.name !== 'id' && !col.autoIncrement)
    .map(col => {
      const required = col.required ? ', required: true' : '';
      const unique = col.unique ? ', unique: true' : '';
      return `  ${col.name}: { type: ${mapTypeToJS(col.type)}${required}${unique} }`;
    })
    .join(',\n');

  return `const mongoose = require('mongoose');

const ${modelName}Schema = new mongoose.Schema({
${fields}
}, {
  timestamps: true
});

module.exports = mongoose.model('${modelName}', ${modelName}Schema);
`;
}

/**
 * Generate Express controller
 */
function generateController(table, modelName, variableName) {
  const primaryKey = table.columns.find(c => c.primaryKey)?.name || 'id';

  return `const ${modelName}Service = require('../services/${modelName}Service');

const ${variableName}Service = new ${modelName}Service();

class ${modelName}Controller {
  // Get all records
  async getAll(req, res) {
    try {
      const data = await ${variableName}Service.findAll(req.query);
      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get by ID
  async getById(req, res) {
    try {
      const data = await ${variableName}Service.findById(req.params.${primaryKey});
      if (!data) {
        return res.status(404).json({
          success: false,
          message: '${modelName} not found'
        });
      }
      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create
  async create(req, res) {
    try {
      const data = await ${variableName}Service.create(req.body);
      res.status(201).json({
        success: true,
        data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update
  async update(req, res) {
    try {
      const data = await ${variableName}Service.update(req.params.${primaryKey}, req.body);
      if (!data) {
        return res.status(404).json({
          success: false,
          message: '${modelName} not found'
        });
      }
      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete
  async delete(req, res) {
    try {
      const data = await ${variableName}Service.delete(req.params.${primaryKey});
      if (!data) {
        return res.status(404).json({
          success: false,
          message: '${modelName} not found'
        });
      }
      res.json({
        success: true,
        message: '${modelName} deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ${modelName}Controller();
`;
}

/**
 * Generate Express routes
 */
function generateRoutes(table, modelName, variableName) {
  const primaryKey = table.columns.find(c => c.primaryKey)?.name || 'id';
  const routeName = toKebabCase(table.name);

  return `const express = require('express');
const router = express.Router();
const ${modelName}Controller = require('../controllers/${modelName}Controller');

router.get('/${routeName}', ${modelName}Controller.getAll);
router.get('/${routeName}/:${primaryKey}', ${modelName}Controller.getById);
router.post('/${routeName}', ${modelName}Controller.create);
router.put('/${routeName}/:${primaryKey}', ${modelName}Controller.update);
router.delete('/${routeName}/:${primaryKey}', ${modelName}Controller.delete);

module.exports = router;
`;
}

/**
 * Generate service layer
 */
function generateService(table, modelName, variableName) {
  const primaryKey = table.columns.find(c => c.primaryKey)?.name || 'id';

  return `const ${modelName} = require('../models/${modelName}');

class ${modelName}Service {
  async findAll(filters = {}) {
    return await ${modelName}.find(filters);
  }

  async findById(id) {
    return await ${modelName}.findById(id);
  }

  async create(data) {
    return await ${modelName}.create(data);
  }

  async update(id, data) {
    return await ${modelName}..findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await ${modelName}.findByIdAndDelete(id);
  }
}

module.exports = ${modelName}Service;
`;
}

/**
 * Generate main index file
 */
function generateIndexFile(schema) {
  const imports = schema.tables.map(table => {
    const modelName = toModelName(table.name);
    return `const ${toVariableName(table.name)}Routes = require('./routes/${modelName}Routes');`;
  }).join('\n');

  const routeUsage = schema.tables.map(table => {
    const routeName = toKebabCase(table.name);
    return `app.use('/', ${toVariableName(table.name)}Routes);`;
  }).join('\n');

  return `const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mydb')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
${imports}

${routeUsage}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

module.exports = app;
`;
}

/**
 * Get template for specific component
 */
function getTemplate(type) {
  const templates = {
    controller: generateController.toString(),
    service: generateService.toString(),
    model: generateModel.toString(),
    routes: generateRoutes.toString()
  };

  return templates[type] || 'Template not found';
}

/**
 * Helper: Map database types to JavaScript types
 */
function mapTypeToJS(dbType) {
  const typeMap = {
    'VARCHAR': 'String',
    'CHAR': 'String',
    'TEXT': 'String',
    'INTEGER': 'Number',
    'INT': 'Number',
    'BIGINT': 'Number',
    'SMALLINT': 'Number',
    'DECIMAL': 'Number',
    'NUMERIC': 'Number',
    'FLOAT': 'Number',
    'REAL': 'Number',
    'DOUBLE': 'Number',
    'BOOLEAN': 'Boolean',
    'DATE': 'Date',
    'DATETIME': 'Date',
    'TIMESTAMP': 'Date',
    'BLOB': 'Buffer',
    'JSON': 'Object'
  };

  // Extract base type if there are parentheses (e.g., VARCHAR(255))
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
  generateExpressCRUD,
  getTemplate
};
