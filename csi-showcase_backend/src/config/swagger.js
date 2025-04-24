// src/config/swagger.js
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'CSI Showcase API',
    version: '1.0.0',
    description: 'API documentation for CSI Showcase Project',
    contact: {
      name: 'CSI Admin Team',
      email: 'admin@csi-showcase.example.com'
    }
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:5000',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};

// Options for swagger
const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: [
    path.resolve(__dirname, '../docs/swagger/*.yaml'),
    path.resolve(__dirname, '../routes/*.js'),
    path.resolve(__dirname, '../routes/*/*.js')
  ]
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app) => {
  // Swagger page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Swagger docs available at /api-docs`);
};

export default swaggerDocs;