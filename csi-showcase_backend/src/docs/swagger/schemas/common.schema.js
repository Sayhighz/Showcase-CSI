// src/docs/swagger/schemas/common.schema.js

export const Error = {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      statusCode: {
        type: 'integer',
        example: 400
      },
      message: {
        type: 'string',
        example: 'Error message'
      },
      stack: {
        type: 'string',
        description: 'Error stack trace (development only)'
      }
    }
  };
  
  export const ValidationError = {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      statusCode: {
        type: 'integer',
        example: 400
      },
      message: {
        type: 'string',
        example: 'Validation error'
      },
      errors: {
        type: 'object',
        example: {
          field1: 'Error message for field1',
          field2: 'Error message for field2'
        }
      }
    }
  };
  
  export const SuccessResponse = {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      statusCode: {
        type: 'integer',
        example: 200
      },
      message: {
        type: 'string',
        example: 'Operation successful'
      },
      data: {
        type: 'object',
        description: 'Response data'
      }
    }
  };
  
  export const Pagination = {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        example: 1
      },
      limit: {
        type: 'integer',
        example: 10
      },
      totalItems: {
        type: 'integer',
        example: 100
      },
      totalPages: {
        type: 'integer',
        example: 10
      },
      hasNext: {
        type: 'boolean',
        example: true
      },
      hasPrev: {
        type: 'boolean',
        example: false
      }
    }
  };
  
  export const PaginatedResponse = {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      statusCode: {
        type: 'integer',
        example: 200
      },
      message: {
        type: 'string', 
        example: 'Operation successful'
      },
      data: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object'
            }
          },
          pagination: {
            $ref: '#/components/schemas/Pagination'
          }
        }
      }
    }
  };
  
  export const FileResponse = {
    type: 'object',
    properties: {
      filename: {
        type: 'string',
        example: 'f8d7eg45-profile.jpg'
      },
      originalname: {
        type: 'string',
        example: 'profile.jpg'
      },
      path: {
        type: 'string',
        example: 'uploads/profiles/f8d7eg45-profile.jpg'
      },
      url: {
        type: 'string',
        example: 'http://localhost:5000/uploads/profiles/f8d7eg45-profile.jpg'
      },
      size: {
        type: 'integer',
        example: 154200
      },
      formattedSize: {
        type: 'string',
        example: '150.6 KB'
      },
      mimetype: {
        type: 'string',
        example: 'image/jpeg'
      },
      fileType: {
        type: 'string',
        example: 'image'
      }
    }
  };