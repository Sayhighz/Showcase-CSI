// src/docs/swagger/paths/admin/auth.js

export default {
    '/admin/auth/login': {
      post: {
        tags: ['Admin Auth'],
        summary: 'Admin login',
        description: 'Authenticate admin credentials and return a JWT token',
        operationId: 'adminLogin',
        security: [
          {
            apiKey: []
          }
        ],
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
            description: 'Admin login successful',
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
    '/admin/auth/me': {
      get: {
        tags: ['Admin Auth'],
        summary: 'Get current admin',
        description: 'Get the profile information of the currently authenticated admin',
        operationId: 'getCurrentAdmin',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: 'Admin information retrieved successfully',
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
                      example: 'Admin info retrieved successfully'
                    },
                    data: {
                      $ref: '#/components/schemas/User'
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
    '/admin/auth/verify-token': {
      get: {
        tags: ['Admin Auth'],
        summary: 'Verify admin JWT token',
        description: 'Verify the validity of an admin JWT token',
        operationId: 'verifyAdminToken',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: 'Admin token is valid',
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
                      example: 'Admin token is valid'
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
          403: {
            $ref: '#/components/responses/Forbidden'
          },
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/admin/auth/logout': {
      post: {
        tags: ['Admin Auth'],
        summary: 'Admin logout',
        description: 'Logout the current admin',
        operationId: 'adminLogout',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: 'Admin logout successful',
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
                      example: 'Admin logout successful'
                    },
                    data: {
                      type: 'null'
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
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/admin/auth/change-password': {
      post: {
        tags: ['Admin Auth'],
        summary: 'Change admin password',
        description: 'Change the password of the currently authenticated admin',
        operationId: 'changeAdminPassword',
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
            description: 'Admin password changed successfully',
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
                      example: 'Admin password changed successfully'
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
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/admin/auth/forgot-password': {
      post: {
        tags: ['Admin Auth'],
        summary: 'Forgot admin password',
        description: 'Request a password reset link for admin',
        operationId: 'forgotAdminPassword',
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
                      example: 'If your email is registered as an admin, you will receive password reset instructions.'
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
    '/admin/auth/reset-password': {
      post: {
        tags: ['Admin Auth'],
        summary: 'Reset admin password',
        description: 'Reset admin password using reset token',
        operationId: 'resetAdminPassword',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'newPassword'],
                properties: {
                  token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                  },
                  newPassword: {
                    type: 'string',
                    format: 'password',
                    example: 'NewPassword456!'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Admin password reset successful',
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
                      example: 'Admin password has been reset successfully'
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
          403: {
            $ref: '#/components/responses/Forbidden'
          },
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    }
  };