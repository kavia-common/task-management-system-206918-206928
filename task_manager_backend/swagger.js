const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: 'Express API for managing tasks (SQLite-backed).',
    },
    tags: [
      { name: 'Health', description: 'Service health and uptime' },
      { name: 'Tasks', description: 'Task CRUD operations' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;

