// src/docs/swagger/paths/user/users.js

export default {
    '/users/{userId}': {
      get: {
        tags: ['Users'],
        summary: 'Get user profile',
        description: 'Get detailed information about a user',
        operationId: 'getUserById',
        parameters: [
          {
            $ref: '#/components/parameters/userId'
          }
        ],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: 'User retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'User retrieved successfully'
                    },
                    data: {
                      $ref: '#/components/schemas/UserProfile'
                    }
                  }
                }
              }
            }
          },
          401: {
            $ref: '#/components/responses/Unauthorized'
          },
          403: {
            $ref: '#/components/responses/Forbidden'
          },
          404: {
            $ref: '#/components/responses/NotFound'
          },
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      },
      put: {
        tags: ['Users'],
        summary: 'Update user profile',
        description: 'Update user profile information',
        operationId: 'updateUser',
        parameters: [
          {
            $ref: '#/components/parameters/userId'
          }
        ],
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  full_name: {
                    type: 'string',
                    example: 'Updated Name'
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'updated.email@example.com'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'User updated successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                          example: 1
                        },
                        username: {
                          type: 'string',
                          example: 'johndoe'
                        },
                        fullName: {
                          type: 'string',
                          example: 'Updated Name'
                        },
                        email: {
                          type: 'string',
                          format: 'email',
                          example: 'updated.email@example.com'
                        },
                        role: {
                          type: 'string',
                          example: 'student'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            $ref: '#/components/responses/ValidationError'
          },
          401: {
            $ref: '#/components/responses/Unauthorized'
          },
          403: {
            $ref: '#/components/responses/Forbidden'
          },
          404: {
            $ref: '#/components/responses/NotFound'
          },
          409: {
            description: 'Email already in use',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  success: false,
                  statusCode: 409,
                  message: 'Email is already taken'
                }
              }
            }
          },
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/users/{userId}/password': {
      post: {
        tags: ['Users'],
        summary: 'Change password',
        description: 'Change user password',
        operationId: 'changePassword',
        parameters: [
          {
            $ref: '#/components/parameters/userId'
          }
        ],
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ChangePassword'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Password changed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'Password changed successfully'
                    },
                    data: {
                      type: 'null'
                    }
                  }
                }
              }
            }
          },
          400: {
            $ref: '#/components/responses/ValidationError'
          },
          401: {
            description: 'Current password is incorrect',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  success: false,
                  statusCode: 401,
                  message: 'Current password is incorrect'
                }
              }
            }
          },
          403: {
            $ref: '#/components/responses/Forbidden'
          },
          404: {
            $ref: '#/components/responses/NotFound'
          },
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/users/{userId}/profile-image': {
      post: {
        tags: ['Users'],
        summary: 'Upload profile image',
        description: 'Upload or update user profile image',
        operationId: 'uploadProfileImage',
        parameters: [
          {
            $ref: '#/components/parameters/userId'
          }
        ],
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  profileImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'Profile image file (JPG, PNG, or GIF)'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Profile image uploaded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'Profile image uploaded successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                          example: 1
                        },
                        image: {
                          type: 'string',
                          example: 'uploads/profiles/profile-1234.jpg'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Invalid file type or size',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  success: false,
                  statusCode: 400,
                  message: 'Only image files are allowed'
                }
              }
            }
          },
          401: {
            $ref: '#/components/responses/Unauthorized'
          },
          403: {
            $ref: '#/components/responses/Forbidden'
          },
          404: {
            $ref: '#/components/responses/NotFound'
          },
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/users/{userId}/login-history': {
      get: {
        tags: ['Users'],
        summary: 'Get login history',
        description: 'Get user\'s login history',
        operationId: 'getUserLoginHistory',
        parameters: [
          {
            $ref: '#/components/parameters/userId'
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              default: 10
            },
            description: 'Number of records to return'
          }
        ],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: 'Login history retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'Login history retrieved successfully'
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'integer',
                            example: 1
                          },
                          time: {
                            type: 'string',
                            format: 'date-time',
                            example: '2023-03-15T10:30:00Z'
                          },
                          ipAddress: {
                            type: 'string',
                            example: '192.168.1.1'
                          },
                          device: {
                            type: 'string',
                            example: 'Desktop'
                          },
                          os: {
                            type: 'string',
                            example: 'Windows 10'
                          },
                          browser: {
                            type: 'string',
                            example: 'Chrome 98.0.4758.102'
                          },
                          userAgent: {
                            type: 'string',
                            example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          401: {
            $ref: '#/components/responses/Unauthorized'
          },
          403: {
            $ref: '#/components/responses/Forbidden'
          },
          404: {
            $ref: '#/components/responses/NotFound'
          },
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/users/{userId}/projects': {
      get: {
        tags: ['Users'],
        summary: 'Get user projects',
        description: 'Get projects owned or contributed to by the user',
        operationId: 'getUserProjects',
        parameters: [
          {
            $ref: '#/components/parameters/userId'
          }
        ],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: 'User projects retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'User projects retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        ownedProjects: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/ProjectSimple'
                          }
                        },
                        contributedProjects: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/ProjectSimple'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          401: {
            $ref: '#/components/responses/Unauthorized'
          },
          403: {
            $ref: '#/components/responses/Forbidden'
          },
          404: {
            $ref: '#/components/responses/NotFound'
          },
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/users/register': {
      post: {
        tags: ['Users'],
        summary: 'Register new user',
        description: 'Create a new user account',
        operationId: 'register',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserRegister'
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'User registered successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                          example: 1
                        },
                        username: {
                          type: 'string',
                          example: 'johndoe'
                        },
                        fullName: {
                          type: 'string',
                          example: 'John Doe'
                        },
                        email: {
                          type: 'string',
                          format: 'email',
                          example: 'john.doe@example.com'
                        },
                        role: {
                          type: 'string',
                          example: 'student'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            $ref: '#/components/responses/ValidationError'
          },
          409: {
            description: 'Username or email already exists',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  success: false,
                  statusCode: 409,
                  message: 'Username is already taken'
                }
              }
            }
          },
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    }
  };