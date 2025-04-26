// src/docs/swagger/index.js
import swaggerJSDoc from 'swagger-jsdoc';


// Import schema definitions
import * as userSchema from './schemas/user.schema.js';
import * as projectSchema from './schemas/project.schema.js';
import * as commonSchema from './schemas/common.schema.js';

// Import API path definitions
// Admin paths
import adminAuthPaths from './paths/admin/auth.js';
import adminUsersPaths from './paths/admin/users.js';
import adminProjectsPaths from './paths/admin/projects.js';
import adminStatisticsPaths from './paths/admin/statistics.js';
import adminLogsPaths from './paths/admin/logs.js';

// User paths
import userAuthPaths from './paths/user/auth.js';
import userProfilePaths from './paths/user/users.js';
import userProjectsPaths from './paths/user/projects.js';
import searchPaths from './paths/user/search.js';

// Common paths
import uploadPaths from './paths/common/upload.js';

// Import components
import parameters from './components/parameters.js';
import responses from './components/responses.js';
import securitySchemes from './components/securitySchemes.js';

// Define Swagger options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CSI Showcase API',
      description: 'API documentation for CSI Showcase platform',
      contact: {
        name: 'CSI Developer Team',
        email: 'admin@csi-showcase.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: '/api',
        description: 'Development server'
      }
    ],
    tags: [
      // User API tags
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Projects', description: 'Project management' },
      { name: 'Search', description: 'Search functionality' },
      { name: 'Upload', description: 'File upload functionality' },
      
      // Admin API tags
      { name: 'Admin Auth', description: 'Admin authentication' },
      { name: 'Admin Users', description: 'User management for admins' },
      { name: 'Admin Projects', description: 'Project management for admins' },
      { name: 'Admin Statistics', description: 'Statistics and dashboard data' },
      { name: 'Admin Logs', description: 'Access to system logs' }
    ],
    components: {
      schemas: {
        // User related schemas
        User: userSchema.User,
        UserLogin: userSchema.UserLogin,
        UserRegister: userSchema.UserRegister,
        UserProfile: userSchema.UserProfile,
        
        // Project related schemas
        Project: projectSchema.Project,
        ProjectCreate: projectSchema.ProjectCreate,
        ProjectUpdate: projectSchema.ProjectUpdate,
        ProjectResponse: projectSchema.ProjectResponse,
        
        // Common schemas
        Error: commonSchema.Error,
        SuccessResponse: commonSchema.SuccessResponse,
        ValidationError: commonSchema.ValidationError,
        Pagination: commonSchema.Pagination,
        
        // Add all other schemas here
      },
      parameters,
      responses,
      securitySchemes
    },
    paths: {
      // Combine all path objects
      ...adminAuthPaths,
      ...adminUsersPaths,
      ...adminProjectsPaths,
      ...adminStatisticsPaths,
      ...adminLogsPaths,
      
      ...userAuthPaths,
      ...userProfilePaths,
      ...userProjectsPaths,
      ...searchPaths,
      
      ...uploadPaths
    }
  },
  apis: [
    // You can also include paths to your route files here if you're using JSDoc annotations
    './src/routes/**/*.js'
  ]
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;