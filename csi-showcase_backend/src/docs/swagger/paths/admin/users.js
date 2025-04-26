// src/docs/swagger/paths/admin/users.js

export default {
    '/admin/users': {
      get: {
        tags: ['Admin Users'],
        summary: 'Get all users',
        description: 'Get a list of all users with pagination and filter options',
        operationId: 'getAllUsers',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            $ref: '#/components/parameters/page'
          },
          {
            $ref: '#/components/parameters/limit'
          },
          {
            $ref: '#/components/parameters/role'
          },
          {
            $ref: '#/components/parameters/search'
          }
        ],
        responses: {
          200: {
            description: 'Users retrieved successfully',
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
                      example: 'Users retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        users: {
                          type: 'array',
                          items: {
                            allOf: [
                              {
                                $ref: '#/components/schemas/User'
                              },
                              {
                                type: 'object',
                                properties: {
                                  project_count: {
                                    type: 'integer',
                                    example: 5
                                  }
                                }
                              }
                            ]
                          }
                        },
                        pagination: {
                          $ref: '#/components/schemas/Pagination'
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
      },
      post: {
        tags: ['Admin Users'],
        summary: 'Create new user',
        description: 'Create a new user account (admin only)',
        operationId: 'createUser',
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
                required: ['username', 'password', 'full_name', 'email'],
                properties: {
                  username: {
                    type: 'string',
                    example: 'johndoe'
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    example: 'Password123!'
                  },
                  full_name: {
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
                    enum: ['student', 'admin'],
                    example: 'student'
                  },
                  profileImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'Optional profile image file'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User created successfully',
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
                      example: 'User created successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
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
          400: {
            $ref: '#/components/responses/ValidationError'
          },
          401: {
            $ref: '#/components/responses/Unauthorized'
          },
          403: {
            $ref: '#/components/responses/Forbidden'
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
    '/admin/users/{userId}': {
      get: {
        tags: ['Admin Users'],
        summary: 'Get user by ID',
        description: 'Get detailed information about a specific user (admin only)',
        operationId: 'getUserById',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            $ref: '#/components/parameters/userId'
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
                      allOf: [
                        {
                          $ref: '#/components/schemas/UserProfile'
                        },
                        {
                          type: 'object',
                          properties: {
                            loginHistory: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  log_id: {
                                    type: 'integer',
                                    example: 1
                                  },
                                  login_time: {
                                    type: 'string',
                                    format: 'date-time',
                                    example: '2023-03-15T10:30:00Z'
                                  },
                                  ip_address: {
                                    type: 'string',
                                    example: '192.168.1.1'
                                  }
                                }
                              }
                            }
                          }
                        }
                      ]
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
        tags: ['Admin Users'],
        summary: 'Update user',
        description: 'Update user information (admin only)',
        operationId: 'updateUser',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            $ref: '#/components/parameters/userId'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: {
                    type: 'string',
                    example: 'johndoe'
                  },
                  full_name: {
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
                    enum: ['student', 'admin'],
                    example: 'student'
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
            description: 'Username or email already exists',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      },
      delete: {
        tags: ['Admin Users'],
        summary: 'Delete user',
        description: 'Delete a user account (admin only)',
        operationId: 'deleteUser',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            $ref: '#/components/parameters/userId'
          }
        ],
        responses: {
          200: {
            description: 'User deleted successfully',
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
                      example: 'User deleted successfully'
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
            description: 'Cannot delete self',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  success: false,
                  statusCode: 403,
                  message: 'You cannot delete your own account'
                }
              }
            }
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
    '/admin/users/{userId}/password': {
      post: {
        tags: ['Admin Users'],
        summary: 'Change user password',
        description: 'Change a user\'s password (admin only)',
        operationId: 'changeUserPassword',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            $ref: '#/components/parameters/userId'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['new_password'],
                properties: {
                  new_password: {
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
    '/admin/users/{userId}/login-history': {
      get: {
        tags: ['Admin Users'],
        summary: 'Get user login history',
        description: 'Get a user\'s login history (admin only)',
        operationId: 'getUserLoginHistory',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            $ref: '#/components/parameters/userId'
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              default: 50
            },
            description: 'Number of records to return'
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
                      type: 'object',
                      properties: {
                        userId: {
                          type: 'integer',
                          example: 1
                        },
                        username: {
                          type: 'string',
                          example: 'johndoe'
                        },
                        logs: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              log_id: {
                                type: 'integer',
                                example: 1
                              },
                              login_time: {
                                type: 'string',
                                format: 'date-time',
                                example: '2023-03-15T10:30:00Z'
                              },
                              ip_address: {
                                type: 'string',
                                example: '192.168.1.1'
                              }
                            }
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
    '/admin/users/stats': {
      get: {
        tags: ['Admin Users'],
        summary: 'Get user statistics',
        description: 'Get statistics about users for the admin dashboard',
        operationId: 'getUserStats',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: 'User statistics retrieved successfully',
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
                      example: 'User statistics retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        totalUsers: {
                          type: 'integer',
                          example: 150
                        },
                        usersByRole: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              role: {
                                type: 'string',
                                example: 'student'
                              },
                              count: {
                                type: 'integer',
                                example: 140
                              }
                            }
                          }
                        },
                        usersByMonth: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              month: {
                                type: 'string',
                                example: '2023-05'
                              },
                              count: {
                                type: 'integer',
                                example: 15
                              }
                            }
                          }
                        },
                        recentLogins: {
                          type: 'array',
                          items: {
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
                              role: {
                                type: 'string',
                                example: 'student'
                              },
                              loginTime: {
                                type: 'string',
                                format: 'date-time',
                                example: '2023-03-15T10:30:00Z'
                              },
                              ipAddress: {
                                type: 'string',
                                example: '192.168.1.1'
                              }
                            }
                          }
                        },
                        topContributors: {
                          type: 'array',
                          items: {
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
                              projectCount: {
                                type: 'integer',
                                example: 10
                              }
                            }
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
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    }
  };