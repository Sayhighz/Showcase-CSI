// src/docs/swagger/components/securitySchemes.js

export default {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT Bearer token'
    },
    apiKey: {
      type: 'apiKey',
      in: 'header',
      name: 'secret_key',
      description: 'API Secret Key for general endpoints'
    },
    adminApiKey: {
      type: 'apiKey',
      in: 'header',
      name: 'admin_secret_key',
      description: 'Admin API Secret Key for admin-only endpoints'
    }
  };