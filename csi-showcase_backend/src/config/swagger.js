// src/config/swagger.js
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

/**
 * Create Swagger spec dynamically from environment and base prefix
 * @param {string} basePrefix
 * @returns {object} swagger spec
 */
const createSwaggerSpec = (basePrefix = '') => {
  const port = process.env.PORT || 4000;
  const host = process.env.SWAGGER_HOST || 'http://localhost';
  const explicitUrl = process.env.SWAGGER_SERVER_URL;

  const servers = [];
  if (explicitUrl) {
    servers.push({
      url: explicitUrl,
      description: 'Configured server',
    });
  } else {
    servers.push({
      url: `${host}:${port}${basePrefix}`,
      description: 'Local server',
    });
  }

  const swaggerDef = {
    openapi: '3.0.0',
    info: {
      title: 'CSI Showcase API Documentation',
      version: '1.0.0',
      description: 'API documentation for CSI Showcase project.',
    },
    servers,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  };

  const options = {
    swaggerDefinition: swaggerDef,
    apis: [
      './src/routes/admin/**/*.js',
      './src/routes/user/**/*.js',
      './src/routes/common/**/*.js',
    ],
  };

  return swaggerJSDoc(options);
};

/**
 * Configure Swagger middleware for Express app
 * @param {import('express').Application} app - Express application
 * @param {string} basePrefix - Base API prefix (e.g. /csie/backend2)
 */
const setupSwagger = (app, basePrefix = '') => {
  const swaggerSpec = createSwaggerSpec(basePrefix);
  const docsPath = `${basePrefix}/api-docs`;

  const swaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CSI Showcase API Documentation',
  };

  app.use(docsPath, swaggerUi.serve);
  app.get(docsPath, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  app.get(`${docsPath}.json`, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Swagger API documentation available at ${docsPath}`);
};

module.exports = { setupSwagger };