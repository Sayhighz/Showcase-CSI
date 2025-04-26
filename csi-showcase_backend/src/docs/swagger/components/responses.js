// src/docs/swagger/components/responses.js

export default {
    Unauthorized: {
      description: 'Authentication failed or token is missing/invalid',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error'
          },
          example: {
            success: false,
            statusCode: 401,
            message: 'Access denied. No token provided.'
          }
        }
      }
    },
    Forbidden: {
      description: 'Authenticated but not authorized to access the resource',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error'
          },
          example: {
            success: false,
            statusCode: 403,
            message: 'Access denied. Insufficient privileges.'
          }
        }
      }
    },
    NotFound: {
      description: 'Resource not found',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error'
          },
          example: {
            success: false,
            statusCode: 404,
            message: 'Resource not found'
          }
        }
      }
    },
    ValidationError: {
      description: 'Validation failed',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ValidationError'
          },
          example: {
            success: false,
            statusCode: 400,
            message: 'Validation error',
            errors: {
              username: 'Username is required',
              email: 'Invalid email format'
            }
          }
        }
      }
    },
    BadRequest: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error'
          },
          example: {
            success: false,
            statusCode: 400,
            message: 'Bad request'
          }
        }
      }
    },
    ServerError: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error'
          },
          example: {
            success: false,
            statusCode: 500,
            message: 'Internal server error'
          }
        }
      }
    },
    Success: {
      description: 'Operation successful',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/SuccessResponse'
          },
          example: {
            success: true,
            statusCode: 200,
            message: 'Operation successful',
            data: {}
          }
        }
      }
    },
    Created: {
      description: 'Resource created successfully',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/SuccessResponse'
          },
          example: {
            success: true,
            statusCode: 201,
            message: 'Resource created successfully',
            data: {
              id: 1
            }
          }
        }
      }
    },
    NoContent: {
      description: 'Operation successful, no content returned'
    }
  };