// src/config/swagger.js
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

// Swagger Base Definition
const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'CSI Showcase API Documentation',
    version: '1.0.0',
    description: 'API documentation for CSI Showcase project.',
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

// Swagger JSDoc Options
const options = {
  swaggerDefinition: swaggerDef,
  apis: [
    './src/routes/admin/**/*.js',
    './src/routes/user/**/*.js',
    './src/routes/common/**/*.js'
  ],
};

// Generate Swagger Spec
const swaggerSpec = swaggerJSDoc(options);

/**
 * Configure Swagger middleware for Express app
 * @param {Express.Application} app - Express application
 */
const setupSwagger = (app) => {
  const swaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "CSI Showcase API Documentation"
  };

  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('Swagger API documentation available at /api-docs');
};

module.exports = { setupSwagger };