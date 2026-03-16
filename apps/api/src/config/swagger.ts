import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow API',
      version: '1.0.0',
      description: `
## TaskFlow - Modern Task Management API

API REST para gerenciamento de tarefas inspirada no Todoist.

### Funcionalidades
- Autenticação JWT
- CRUD de Tarefas
- Projetos e Etiquetas
- Filtros e Busca
- Agendamento de tarefas

### Autenticação
Use o header \`Authorization: Bearer {token}\` para endpoints protegidos.
      `,
      contact: {
        name: 'TaskFlow Team',
        email: 'api@taskflow.app',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.taskflow.app',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check and system status endpoints',
      },
      {
        name: 'Auth',
        description: 'Authentication and user management',
      },
      {
        name: 'Tasks',
        description: 'Task management operations',
      },
      {
        name: 'Projects',
        description: 'Project management operations',
      },
      {
        name: 'Labels',
        description: 'Label management operations',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Dados inválidos' },
                details: {
                  type: 'object',
                  additionalProperties: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'cuid', example: 'clx1234567890' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            avatarUrl: { type: 'string', nullable: true, example: 'https://...' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'cuid' },
            title: { type: 'string', example: 'Revisar relatório' },
            description: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['pending', 'completed'] },
            priority: { type: 'string', enum: ['P1', 'P2', 'P3', 'P4'] },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            dueTime: { type: 'string', example: '14:00', nullable: true },
            order: { type: 'integer' },
            projectId: { type: 'string' },
            project: { $ref: '#/components/schemas/Project' },
            labels: {
              type: 'array',
              items: { $ref: '#/components/schemas/Label' },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        CreateTask: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 500 },
            description: { type: 'string', maxLength: 5000 },
            priority: { type: 'string', enum: ['P1', 'P2', 'P3', 'P4'], default: 'P4' },
            dueDate: { type: 'string', format: 'date', example: '2024-12-31' },
            dueTime: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$', example: '14:00' },
            projectId: { type: 'string', format: 'uuid' },
            labelIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
          },
        },
        UpdateTask: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 500 },
            description: { type: 'string', maxLength: 5000 },
            status: { type: 'string', enum: ['pending', 'completed'] },
            priority: { type: 'string', enum: ['P1', 'P2', 'P3', 'P4'] },
            dueDate: { type: 'string', format: 'date' },
            dueTime: { type: 'string' },
            projectId: { type: 'string' },
            labelIds: { type: 'array', items: { type: 'string' } },
            order: { type: 'integer' },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Trabalho' },
            color: { type: 'string', example: '#4A90A4' },
            isInbox: { type: 'boolean' },
            order: { type: 'integer' },
            taskCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateProject: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$', default: '#808080' },
          },
        },
        Label: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'urgente' },
            color: { type: 'string', example: '#FF6B6B' },
            taskCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateLabel: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 50 },
            color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$', default: '#808080' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                accessToken: { type: 'string' },
                expiresAt: { type: 'integer', example: 1735689600000 },
              },
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'unhealthy'] },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number' },
            version: { type: 'string' },
            environment: { type: 'string' },
            checks: {
              type: 'object',
              properties: {
                database: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    latency: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Token inválido ou expirado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Token não fornecido' },
              },
            },
          },
        },
        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        ValidationError: {
          description: 'Erro de validação',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
