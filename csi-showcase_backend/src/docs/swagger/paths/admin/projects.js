// src/docs/swagger/paths/admin/projects.js

export default {
    '/admin/projects': {
      get: {
        tags: ['Admin Projects'],
        summary: 'Get all projects',
        description: 'Get a list of all projects with pagination and filter options (admin only)',
        operationId: 'getAllProjects',
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
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected']
            },
            description: 'Filter by project status'
          },
          {
            name: 'type',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['coursework', 'academic', 'competition']
            },
            description: 'Filter by project type'
          },
          {
            name: 'year',
            in: 'query',
            schema: {
              type: 'integer',
              example: 2023
            },
            description: 'Filter by academic year'
          },
          {
            name: 'search',
            in: 'query',
            schema: {
              type: 'string'
            },
            description: 'Search term for project title or description'
          }
        ],
        responses: {
          200: {
            description: 'Projects retrieved successfully',
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
                      example: 'Projects retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        projects: {
                          type: 'array',
                          items: {
                            allOf: [
                              {
                                $ref: '#/components/schemas/ProjectSimple'
                              },
                              {
                                type: 'object',
                                properties: {
                                  status: {
                                    type: 'string',
                                    enum: ['pending', 'approved', 'rejected'],
                                    example: 'pending'
                                  },
                                  userId: {
                                    type: 'integer',
                                    example: 1
                                  },
                                  username: {
                                    type: 'string',
                                    example: 'johndoe'
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
      }
    },
    '/admin/projects/pending': {
      get: {
        tags: ['Admin Projects'],
        summary: 'Get pending projects',
        description: 'Get a list of projects waiting for approval (admin only)',
        operationId: 'getPendingProjects',
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
          }
        ],
        responses: {
          200: {
            description: 'Pending projects retrieved successfully',
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
                      example: 'Pending projects retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        projects: {
                          type: 'array',
                          items: {
                            allOf: [
                              {
                                $ref: '#/components/schemas/ProjectSimple'
                              },
                              {
                                type: 'object',
                                properties: {
                                  status: {
                                    type: 'string',
                                    enum: ['pending'],
                                    example: 'pending'
                                  },
                                  createdAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    example: '2023-05-15T10:30:00Z'
                                  },
                                  userId: {
                                    type: 'integer',
                                    example: 1
                                  },
                                  username: {
                                    type: 'string',
                                    example: 'johndoe'
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
      }
    },
    '/admin/projects/{projectId}': {
      get: {
        tags: ['Admin Projects'],
        summary: 'Get project details',
        description: 'Get detailed information about a specific project (admin only)',
        operationId: 'getProjectDetails',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            $ref: '#/components/parameters/projectId'
          }
        ],
        responses: {
          200: {
            description: 'Project details retrieved successfully',
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
                      example: 'Project details retrieved successfully'
                    },
                    data: {
                      $ref: '#/components/schemas/Project'
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
        tags: ['Admin Projects'],
        summary: 'Update project',
        description: 'Update project information (admin only)',
        operationId: 'updateProject',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            $ref: '#/components/parameters/projectId'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProjectUpdate'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Project updated successfully',
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
                      example: 'Project updated successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        projectId: {
                          type: 'integer',
                          example: 1
                        },
                        title: {
                          type: 'string',
                          example: 'Updated Project Title'
                        },
                        updatedAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2023-05-15T10:30:00Z'
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
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      },
      delete: {
        tags: ['Admin Projects'],
        summary: 'Delete project',
        description: 'Delete a project (admin only)',
        operationId: 'deleteProject',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            $ref: '#/components/parameters/projectId'
          }
        ],
        responses: {
          200: {
            description: 'Project deleted successfully',
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
                      example: 'Project deleted successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        projectId: {
                          type: 'integer',
                          example: 1
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
    '/admin/projects/{projectId}/review': {
      post: {
        tags: ['Admin Projects'],
        summary: 'Review project',
        description: 'Approve or reject a project (admin only)',
        operationId: 'reviewProject',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            $ref: '#/components/parameters/projectId'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProjectReview'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Project reviewed successfully',
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
                      example: 'Project approved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        projectId: {
                          type: 'integer',
                          example: 1
                        },
                        status: {
                          type: 'string',
                          enum: ['approved', 'rejected'],
                          example: 'approved'
                        },
                        comment: {
                          type: 'string',
                          example: 'Great work! The project meets all the requirements.'
                        },
                        reviewedAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2023-05-15T10:30:00Z'
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
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/admin/projects/{projectId}/reviews': {
      get: {
        tags: ['Admin Projects'],
        summary: 'Get project reviews',
        description: 'Get the review history of a specific project (admin only)',
        operationId: 'getProjectReviews',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            $ref: '#/components/parameters/projectId'
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
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          review_id: {
                            type: 'integer',
                            example: 1
                          },
                          admin_id: {
                            type: 'integer',
                            example: 1
                          },
                          admin_username: {
                            type: 'string',
                            example: 'admin'
                          },
                          admin_name: {
                            type: 'string',
                            example: 'Admin User'
                          },
                          status: {
                            type: 'string',
                            enum: ['approved', 'rejected', 'updated'],
                            example: 'approved'
                          },
                          review_comment: {
                            type: 'string',
                            example: 'Great work! The project meets all the requirements.'
                          },
                          reviewed_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2023-05-15T10:30:00Z'
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
    '/admin/projects/review-stats': {
      get: {
        tags: ['Admin Projects'],
        summary: 'Get admin review statistics',
        description: 'Get statistics about project reviews by admins (admin only)',
        operationId: 'getAdminReviewStats',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: 'Admin review statistics retrieved successfully',
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
                      example: 'Admin review statistics retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        overall: {
                          type: 'object',
                          properties: {
                            total_reviews: {
                              type: 'integer',
                              example: 150
                            },
                            approved_count: {
                              type: 'integer',
                              example: 120
                            },
                            rejected_count: {
                              type: 'integer',
                              example: 30
                            },
                            pending_count: {
                              type: 'integer',
                              example: 15
                            }
                          }
                        },
                        admin_stats: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              user_id: {
                                type: 'integer',
                                example: 1
                              },
                              username: {
                                type: 'string',
                                example: 'admin'
                              },
                              full_name: {
                                type: 'string',
                                example: 'Admin User'
                              },
                              review_count: {
                                type: 'integer',
                                example: 50
                              },
                              approved_count: {
                                type: 'integer',
                                example: 40
                              },
                              rejected_count: {
                                type: 'integer',
                                example: 10
                              }
                            }
                          }
                        },
                        time_stats: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              month: {
                                type: 'string',
                                example: '2023-05'
                              },
                              review_count: {
                                type: 'integer',
                                example: 25
                              },
                              approved_count: {
                                type: 'integer',
                                example: 20
                              },
                              rejected_count: {
                                type: 'integer',
                                example: 5
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
    '/admin/projects/stats': {
      get: {
        tags: ['Admin Projects'],
        summary: 'Get project statistics',
        description: 'Get comprehensive statistics about projects for the admin dashboard',
        operationId: 'getProjectStats',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: 'Project statistics retrieved successfully',
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
                      example: 'Project statistics retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        project_counts: {
                          type: 'object',
                          properties: {
                            total_projects: {
                              type: 'integer',
                              example: 250
                            },
                            approved_count: {
                              type: 'integer',
                              example: 200
                            },
                            pending_count: {
                              type: 'integer',
                              example: 30
                            },
                            rejected_count: {
                              type: 'integer',
                              example: 20
                            },
                            academic_count: {
                              type: 'integer',
                              example: 80
                            },
                            coursework_count: {
                              type: 'integer',
                              example: 150
                            },
                            competition_count: {
                              type: 'integer',
                              example: 20
                            }
                          }
                        },
                        top_projects: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              project_id: {
                                type: 'integer',
                                example: 1
                              },
                              title: {
                                type: 'string',
                                example: 'Popular Project Title'
                              },
                              type: {
                                type: 'string',
                                example: 'coursework'
                              },
                              views_count: {
                                type: 'integer',
                                example: 120
                              },
                              username: {
                                type: 'string',
                                example: 'johndoe'
                              },
                              full_name: {
                                type: 'string',
                                example: 'John Doe'
                              },
                              cover_image: {
                                type: 'string',
                                example: 'uploads/images/project-cover-1234.jpg'
                              }
                            }
                          }
                        },
                        recent_projects: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              project_id: {
                                type: 'integer',
                                example: 2
                              },
                              title: {
                                type: 'string',
                                example: 'Recent Project Title'
                              },
                              type: {
                                type: 'string',
                                example: 'academic'
                              },
                              created_at: {
                                type: 'string',
                                format: 'date-time',
                                example: '2023-05-15T10:30:00Z'
                              },
                              status: {
                                type: 'string',
                                example: 'pending'
                              },
                              username: {
                                type: 'string',
                                example: 'janedoe'
                              },
                              full_name: {
                                type: 'string',
                                example: 'Jane Doe'
                              }
                            }
                          }
                        },
                        monthly_uploads: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              month: {
                                type: 'string',
                                example: '2023-05'
                              },
                              project_count: {
                                type: 'integer',
                                example: 25
                              },
                              academic_count: {
                                type: 'integer',
                                example: 8
                              },
                              coursework_count: {
                                type: 'integer',
                                example: 15
                              },
                              competition_count: {
                                type: 'integer',
                                example: 2
                              }
                            }
                          }
                        },
                        monthly_views: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              month: {
                                type: 'string',
                                example: '2023-05'
                              },
                              view_count: {
                                type: 'integer',
                                example: 500
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
    '/admin/projects/all-reviews': {
      get: {
        tags: ['Admin Projects'],
        summary: 'Get all project reviews',
        description: 'Get a list of all project reviews with pagination (admin only)',
        operationId: 'getAllProjectReviews',
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
                                    example: 'admin'
                                  },
                                  fullName: {
                                    type: 'string',
                                    example: 'Admin User'
                                  }
                                }
                              },
                              status: {
                                type: 'string',
                                enum: ['approved', 'rejected', 'updated'],
                                example: 'approved'
                              },
                              comment: {
                                type: 'string',
                                example: 'Great work! The project meets all the requirements.'
                              },
                              reviewedAt: {
                                type: 'string',
                                format: 'date-time',
                                example: '2023-05-15T10:30:00Z'
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
    }
  };