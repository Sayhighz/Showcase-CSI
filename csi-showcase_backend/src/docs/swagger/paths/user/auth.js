// src/docs/swagger/paths/user/auth.js

export default {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'User login',
        description: 'Authenticate user credentials and return a JWT token',
        operationId: 'userLogin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserLogin'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserLoginResponse'
                }
              }
            }
          },
          401: {
            $ref: '#/components/responses/Unauthorized'
          },
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'User registration',
        description: 'Register a new user account',
        operationId: 'userRegister',
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
            description: 'Registration successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserLoginResponse'
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
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        description: 'Get the profile information of the currently authenticated user',
        operationId: 'getCurrentUser',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: 'User information retrieved successfully',
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
                      example: 'User info retrieved successfully'
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
          404: {
            $ref: '#/components/responses/NotFound'
          },
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/auth/verify-token': {
      get: {
        tags: ['Auth'],
        summary: 'Verify JWT token',
        description: 'Verify the validity of a JWT token',
        operationId: 'verifyToken',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: 'Token is valid',
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
                      example: 'Token is valid'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        valid: {
                          type: 'boolean',
                          example: true
                        },
                        user: {
                          $ref: '#/components/schemas/User'
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
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'User logout',
        description: 'Logout the current user (client-side)',
        operationId: 'userLogout',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: 'Logout successful',
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
                      example: 'Logout successful'
                    },
                    data: {
                      type: 'null'
                    }
                  }
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
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Forgot password',
        description: 'Request a password reset link',
        operationId: 'forgotPassword',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ForgotPassword'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Password reset instructions sent',
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
                      example: 'If your email is registered, you will receive password reset instructions.'
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
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password',
        description: 'Reset password using reset token',
        operationId: 'resetPassword',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ResetPassword'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Password reset successful',
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
                      example: 'Password has been reset successfully'
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
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    }
  };