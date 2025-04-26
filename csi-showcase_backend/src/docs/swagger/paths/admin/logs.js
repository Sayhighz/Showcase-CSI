// src/docs/swagger/paths/admin/logs.js

export default {
    '/admin/logs/login': {
      get: {
        tags: ['Admin Logs'],
        summary: 'Get all login logs',
        description: 'Retrieve all user login logs with filtering and pagination options',
        operationId: 'getAllLoginLogs',
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
            name: 'userId',
            in: 'query',
            schema: {
              type: 'integer'
            },
            description: 'Filter by user ID'
          },
          {
            $ref: '#/components/parameters/startDate'
          },
          {
            $ref: '#/components/parameters/endDate'
          },
          {
            $ref: '#/components/parameters/search'
          }
        ],
        responses: {
          200: {
            description: 'Login logs retrieved successfully',
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
                      example: 'Login logs retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        logs: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'integer',
                                example: 1
                              },
                              userId: {
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
      }
    },
    '/admin/logs/company-views': {
      get: {
        tags: ['Admin Logs'],
        summary: 'Get all company views',
        description: 'Retrieve all company views on projects with filtering and pagination options',
        operationId: 'getCompanyViews',
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
            name: 'projectId',
            in: 'query',
            schema: {
              type: 'integer'
            },
            description: 'Filter by project ID'
          },
          {
            $ref: '#/components/parameters/search'
          }
        ],
        responses: {
          200: {
            description: 'Company views retrieved successfully',
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
                      example: 'Company views retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        views: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'integer',
                                example: 1
                              },
                              companyName: {
                                type: 'string',
                                example: 'Acme Inc.'
                              },
                              contactEmail: {
                                type: 'string',
                                format: 'email',
                                example: 'contact@acme.com'
                              },
                              projectId: {
                                type: 'integer',
                                example: 1
                              },
                              projectTitle: {
                                type: 'string',
                                example: 'Web Development Final Project'
                              },
                              viewedAt: {
                                type: 'string',
                                format: 'date-time',
                                example: '2023-03-15T10:30:00Z'
                              }
                            }
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
      }
    },
    '/admin/logs/visitor-views': {
      get: {
        tags: ['Admin Logs'],
        summary: 'Get all visitor views',
        description: 'Retrieve all visitor views on projects with filtering and pagination options',
        operationId: 'getVisitorViews',
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
            name: 'projectId',
            in: 'query',
            schema: {
              type: 'integer'
            },
            description: 'Filter by project ID'
          },
          {
            $ref: '#/components/parameters/search'
          }
        ],
        responses: {
          200: {
            description: 'Visitor views retrieved successfully',
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
                      example: 'Visitor views retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        views: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'integer',
                                example: 1
                              },
                              projectId: {
                                type: 'integer',
                                example: 1
                              },
                              projectTitle: {
                                type: 'string',
                                example: 'Web Development Final Project'
                              },
                              ipAddress: {
                                type: 'string',
                                example: '192.168.1.1'
                              },
                              userAgent: {
                                type: 'string',
                                example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
                              },
                              viewedAt: {
                                type: 'string',
                                format: 'date-time',
                                example: '2023-03-15T10:30:00Z'
                              }
                            }
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
      }
    },
    '/admin/logs/project-reviews': {
      get: {
        tags: ['Admin Logs'],
        summary: 'Get all project reviews',
        description: 'Retrieve all project review logs with filtering and pagination options',
        operationId: 'getProjectReviews',
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
            name: 'projectId',
            in: 'query',
            schema: {
              type: 'integer'
            },
            description: 'Filter by project ID'
          },
          {
            name: 'adminId',
            in: 'query',
            schema: {
              type: 'integer'
            },
            description: 'Filter by admin ID'
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['approved', 'rejected', 'updated']
            },
            description: 'Filter by review status'
          }
        ],
        responses: {
          200: {
            description: 'Project reviews retrieved successfully',
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
                      example: 'Project reviews retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        reviews: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'integer',
                                example: 1
                              },
                              projectId: {
                                type: 'integer',
                                example: 1
                              },
                              projectTitle: {
                                type: 'string',
                                example: 'Web Development Final Project'
                              },
                              projectType: {
                                type: 'string',
                                example: 'coursework'
                              },
                              admin: {
                                type: 'object',
                                properties: {
                                  id: {
                                    type: 'integer',
                                    example: 1
                                  },
                                  username: {
                                    type: 'string',
                                    example: 'admin1'
                                  },
                                  fullName: {
                                    type: 'string',
                                    example: 'Admin User'
                                  }
                                }
                              },
                              status: {
                                type: 'string',
                                example: 'approved'
                              },
                              comment: {
                                type: 'string',
                                example: 'Great work! Approved.'
                              },
                              reviewedAt: {
                                type: 'string',
                                format: 'date-time',
                                example: '2023-03-15T10:30:00Z'
                              }
                            }
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
      }
    },
    '/admin/logs/system-stats': {
      get: {
        tags: ['Admin Logs'],
        summary: 'Get system statistics',
        description: 'Retrieve comprehensive system statistics for the admin dashboard',
        operationId: 'getSystemStats',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: 'System statistics retrieved successfully',
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
                      example: 'System statistics retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        totalLogins: {
                          type: 'integer',
                          example: 1250
                        },
                        loginsByDay: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              date: {
                                type: 'string',
                                format: 'date',
                                example: '2023-05-15'
                              },
                              count: {
                                type: 'integer',
                                example: 42
                              }
                            }
                          }
                        },
                        totalViews: {
                          type: 'integer',
                          example: 3500
                        },
                        viewsByDay: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              date: {
                                type: 'string',
                                format: 'date',
                                example: '2023-05-15'
                              },
                              visitorCount: {
                                type: 'integer',
                                example: 35
                              },
                              companyCount: {
                                type: 'integer',
                                example: 5
                              },
                              totalCount: {
                                type: 'integer',
                                example: 40
                              }
                            }
                          }
                        },
                        projectsByDay: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              date: {
                                type: 'string',
                                format: 'date',
                                example: '2023-05-15'
                              },
                              count: {
                                type: 'integer',
                                example: 8
                              }
                            }
                          }
                        },
                        usersByDay: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              date: {
                                type: 'string',
                                format: 'date',
                                example: '2023-05-15'
                              },
                              count: {
                                type: 'integer',
                                example: 5
                              }
                            }
                          }
                        },
                        reviewsByDay: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              date: {
                                type: 'string',
                                format: 'date',
                                example: '2023-05-15'
                              },
                              count: {
                                type: 'integer',
                                example: 10
                              },
                              status: {
                                type: 'string',
                                example: 'approved'
                              }
                            }
                          }
                        },
                        reviewsByStatus: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              status: {
                                type: 'string',
                                example: 'approved'
                              },
                              count: {
                                type: 'integer',
                                example: 150
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
    },
    '/admin/logs/daily-stats': {
      get: {
        tags: ['Admin Logs'],
        summary: 'Get daily statistics',
        description: 'Retrieve statistics for today compared with the average of previous days',
        operationId: 'getDailyStats',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: 'Daily statistics retrieved successfully',
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
                      example: 'Daily statistics retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        logins: {
                          type: 'object',
                          properties: {
                            today: {
                              type: 'integer',
                              example: 45
                            },
                            average: {
                              type: 'number',
                              example: 37.5
                            },
                            percentChange: {
                              type: 'integer',
                              example: 20
                            }
                          }
                        },
                        views: {
                          type: 'object',
                          properties: {
                            today: {
                              type: 'integer',
                              example: 120
                            },
                            visitor: {
                              type: 'integer',
                              example: 100
                            },
                            company: {
                              type: 'integer',
                              example: 20
                            },
                            average: {
                              type: 'number',
                              example: 95.5
                            },
                            percentChange: {
                              type: 'integer',
                              example: 26
                            }
                          }
                        },
                        projects: {
                          type: 'object',
                          properties: {
                            today: {
                              type: 'integer',
                              example: 8
                            },
                            average: {
                              type: 'number',
                              example: 6.2
                            },
                            percentChange: {
                              type: 'integer',
                              example: 29
                            }
                          }
                        },
                        users: {
                          type: 'object',
                          properties: {
                            today: {
                              type: 'integer',
                              example: 5
                            },
                            average: {
                              type: 'number',
                              example: 4.1
                            },
                            percentChange: {
                              type: 'integer',
                              example: 22
                            }
                          }
                        },
                        reviews: {
                          type: 'object',
                          properties: {
                            today: {
                              type: 'integer',
                              example: 10
                            },
                            approved: {
                              type: 'integer',
                              example: 8
                            },
                            rejected: {
                              type: 'integer',
                              example: 2
                            },
                            average: {
                              type: 'number',
                              example: 7.5
                            },
                            percentChange: {
                              type: 'integer',
                              example: 33
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