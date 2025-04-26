// src/config/swagger.js
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../docs/swagger/index.js';

/**
 * Configure Swagger middleware for Express app
 * @param {Express.Application} app - Express application
 */
export const setupSwagger = (app) => {
  // Swagger UI options
  const swaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "CSI Showcase API Documentation"
  };

  // Serve Swagger docs
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Serve Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Log that Swagger is available
  console.log('Swagger API documentation available at /api-docs');
};

export default setupSwagger;