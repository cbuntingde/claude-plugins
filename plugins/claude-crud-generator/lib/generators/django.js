/**
 * Django CRUD Generator
 * Generates Django models, views, serializers, and URLs
 */

/**
 * Generate complete CRUD for Django
 */
async function generateDjangoCRUD(schema, options) {
  const files = [];

  // Generate settings modifications
  files.push({
    path: 'settings_snippet.txt',
    content: generateDjangoSettings(schema)
  });

  for (const table of schema.tables) {
    const modelName = toModelName(table.name);
    const appName = toKebabCase(table.name);

    // Generate Django model
    files.push({
      path: `${appName}/models.py`,
      content: generateDjangoModel(table, modelName)
    });

    // Generate serializer
    files.push({
      path: `${appName}/serializers.py`,
      content: generateDjangoSerializer(table, modelName)
    });

    // Generate views
    files.push({
      path: `${appName}/views.py`,
      content: generateDjangoViews(table, modelName)
    });

    // Generate URLs
    files.push({
      path: `${appName}/urls.py`,
      content: generateDjangoUrls(table, modelName)
    });

    // Generate admin
    files.push({
      path: `${appName}/admin.py`,
      content: generateDjangoAdmin(table, modelName)
    });
  }

  // Generate requirements.txt
  files.push({
    path: 'requirements.txt',
    content: `Django>=5.0.0
djangorestframework>=3.14.0
django-cors-headers>=4.3.1
`
  });

  return { files };
}

/**
 * Generate Django model
 */
function generateDjangoModel(table, modelName) {
  const fields = table.columns
    .filter(col => !col.autoIncrement)
    .map(col => {
      return `    ${col.name} = models.${mapToDjangoField(col)}${col.required ? '' : ', blank=True, null=True'}${col.unique ? ', unique=True' : ''}`;
    })
    .join('\n');

  return `from django.db import models

class ${modelName}(models.Model):
${fields}

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = '${toKebabCase(table.name)}'
        verbose_name = '${table.name}'
        verbose_name_plural = '${table.name}'

    def __str__(self):
        return f"${modelName}({{self.id}}"
`;
}

/**
 * Generate Django serializer
 */
function generateDjangoSerializer(table, modelName) {
  const fields = table.columns.map(col => col.name).join("', '");

  return `from rest_framework import serializers
from .models import ${modelName}

class ${modelName}Serializer(serializers.ModelSerializer):
    class Meta:
        model = ${modelName}
        fields = ('id', '${fields}', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
`;
}

/**
 * Generate Django views (ViewSet)
 */
function generateDjangoViews(table, modelName) {
  return `from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import ${modelName}
from .serializers import ${modelName}Serializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000

class ${modelName}ViewSet(viewsets.ModelViewSet):
    queryset = ${modelName}.objects.all().order_by('-id')
    serializer_class = ${modelName}Serializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ${JSON.stringify(table.columns.filter(c => !c.autoIncrement).map(c => c.name))}
    search_fields = ${JSON.stringify(table.columns.filter(c => c.type.includes('CHAR') || c.type.includes('TEXT')).map(c => c.name))}
`;
}

/**
 * Generate Django URLs
 */
function generateDjangoUrls(table, modelName) {
  const appName = toKebabCase(table.name);

  return `from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ${modelName}ViewSet

router = DefaultRouter()
router.register(r'${toKebabCase(table.name)}', ${modelName}ViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
`;
}

/**
 * Generate Django admin configuration
 */
function generateDjangoAdmin(table, modelName) {
  const listDisplay = ['id', ...table.columns.filter(c => !c.autoIncrement).slice(0, 3).map(c => c.name), 'created_at'];
  const listFilter = table.columns.filter(c => c.type.includes('BOOLEAN') || c.type.includes('DATE') || c.foreignKey).map(c => c.name);
  const searchFields = table.columns.filter(c => c.type.includes('CHAR') || c.type.includes('TEXT')).map(c => c.name);

  return `from django.contrib import admin
from .models import ${modelName}

@admin.register(${modelName})
class ${modelName}Admin(admin.ModelAdmin):
    list_display = ${JSON.stringify(listDisplay)}
    list_filter = ${JSON.stringify(listFilter)}
    search_fields = ${JSON.stringify(searchFields)}
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-id',)
`;
}

/**
 * Generate Django settings snippet
 */
function generateDjangoSettings(schema) {
  const apps = schema.tables.map(table => `    '${toKebabCase(table.name)}',`).join('\n');

  return `# Add these apps to INSTALLED_APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
${apps}
]

# Add middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]

# CORS settings
# SECURITY: Configure allowed origins via environment variable
# Default: only localhost:3000 for development
CORS_ALLOWED_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}
`;
}

/**
 * Get template for specific component
 */
function getTemplate(type) {
  const templates = {
    model: generateDjangoModel.toString(),
    serializer: generateDjangoSerializer.toString(),
    views: generateDjangoViews.toString(),
    urls: generateDjangoUrls.toString()
  };

  return templates[type] || 'Template not found';
}

/**
 * Helper: Map database type to Django field
 */
function mapToDjangoField(col) {
  const typeMap = {
    'VARCHAR': `CharField(max_length=${extractSize(col.type, 255)})`,
    'CHAR': `CharField(max_length=${extractSize(col.type, 1)})`,
    'TEXT': 'TextField()',
    'INTEGER': 'IntegerField()',
    'INT': 'IntegerField()',
    'BIGINT': 'BigIntegerField()',
    'SMALLINT': 'SmallIntegerField()',
    'DECIMAL': `DecimalField(max_digits=${extractSize(col.type, 10)}, decimal_places=${extractScale(col.type, 2)})`,
    'NUMERIC': `DecimalField(max_digits=${extractSize(col.type, 10)}, decimal_places=${extractScale(col.type, 2)})`,
    'FLOAT': 'FloatField()',
    'REAL': 'FloatField()',
    'DOUBLE': 'FloatField()',
    'BOOLEAN': 'BooleanField()',
    'DATE': 'DateField()',
    'DATETIME': 'DateTimeField()',
    'TIMESTAMP': 'DateTimeField()',
    'JSON': 'JSONField()',
    'BLOB': 'BinaryField()'
  };

  const baseType = col.type.toUpperCase().split('(')[0];
  const field = typeMap[baseType] || 'CharField(max_length=255)';

  // Add auto_now for created_at/updated_at
  if (col.name === 'created_at' || col.name === 'updated_at') {
    return 'DateTimeField(auto_now_add=True)';
  }

  return field;
}

/**
 * Helper: Extract size from type (e.g., VARCHAR(255) -> 255)
 */
function extractSize(type, defaultSize) {
  const match = type.match(/\((\d+)\)/);
  return match ? parseInt(match[1]) : defaultSize;
}

/**
 * Helper: Extract scale from decimal type
 */
function extractScale(type, defaultScale) {
  const match = type.match(/\(\d+,\s*(\d+)\)/);
  return match ? parseInt(match[1]) : defaultScale;
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
 * Helper: Convert to kebab-case
 */
function toKebabCase(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

module.exports = {
  generateDjangoCRUD,
  getTemplate
};
