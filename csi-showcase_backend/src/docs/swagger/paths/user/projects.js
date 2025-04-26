// src/docs/swagger/paths/user/projects.js

export default {
    '/projects/all': {
      get: {
        tags: ['Projects'],
        summary: 'Get all approved projects',
        description: 'Get a list of all approved projects with pagination and filter options',
        operationId: 'getAllProjects',
        parameters: [
          {
            $ref: '#/components/parameters/page'
          },
          {
            $ref: '#/components/parameters/limit'
          },
          {
            name: 'category',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['coursework', 'academic', 'competition']
            },
            description: 'Filter by project category/type'
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
            name: 'level',
            in: 'query',
            schema: {
              type: 'integer',
              enum: [1, 2, 3, 4]
            },
            description: 'Filter by study year level'
          }
        ],
        responses: {
          200: {
            description: 'Projects retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProjectPaginated'
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
    '/projects/top': {
      get: {
        tags: ['Projects'],
        summary: 'Get top viewed projects',
        description: 'Get a list of top 9 most viewed projects',
        operationId: 'getTop9Projects',
        responses: {
          200: {
            description: 'Top projects retrieved successfully',
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
                      example: 'Top projects retrieved successfully'
                    },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/ProjectSimple'
                      }
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
    '/projects/latest': {
      get: {
        tags: ['Projects'],
        summary: 'Get latest projects',
        description: 'Get a list of latest projects',
        operationId: 'getLatestProjects',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              default: 9
            },
            description: 'Number of projects to return'
          }
        ],
        responses: {
          200: {
            description: 'Latest projects retrieved successfully',
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
                      example: 'Latest projects retrieved successfully'
                    },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/ProjectSimple'
                      }
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
    '/projects/user/{user_id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get user\'s projects',
        description: 'Get a list of projects owned by a specific user',
        operationId: 'getMyProjects',
        parameters: [
          {
            name: 'user_id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'User ID'
          },
          {
            $ref: '#/components/parameters/page'
          },
          {
            $ref: '#/components/parameters/limit'
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
                  $ref: '#/components/schemas/ProjectPaginated'
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
        tags: ['Projects'],
        summary: 'Upload new project',
        description: 'Upload a new project',
        operationId: 'uploadProject',
        parameters: [
          {
            name: 'user_id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'User ID'
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
                required: ['title', 'description', 'type', 'study_year', 'year', 'semester'],
                properties: {
                  title: {
                    type: 'string',
                    example: 'Web Development Final Project'
                  },
                  description: {
                    type: 'string',
                    example: 'A comprehensive web application built using React.js and Node.js...'
                  },
                  type: {
                    type: 'string',
                    enum: ['coursework', 'academic', 'competition'],
                    example: 'coursework'
                  },
                  study_year: {
                    type: 'integer',
                    enum: [1, 2, 3, 4],
                    example: 3
                  },
                  year: {
                    type: 'integer',
                    example: 2023
                  },
                  semester: {
                    type: 'integer',
                    enum: [1, 2, 3],
                    example: 1
                  },
                  visibility: {
                    type: 'integer',
                    enum: [0, 1],
                    example: 1,
                    description: '0: Private, 1: Public'
                  },
                  tags: {
                    type: 'string',
                    example: 'web,javascript,react,nodejs'
                  },
                  contributors: {
                    type: 'string',
                    example: '[{"user_id":2},{"user_id":3}]',
                    description: 'JSON string of user IDs'
                  },
                  // Type-specific fields
                  // For coursework
                  course_code: {
                    type: 'string',
                    example: 'CS401'
                  },
                  course_name: {
                    type: 'string',
                    example: 'Web Development'
                  },
                  instructor: {
                    type: 'string',
                    example: 'Dr. Jane Smith'
                  },
                  // For academic
                  abstract: {
                    type: 'string',
                    example: 'This paper presents a novel approach to...'
                  },
                  publication_date: {
                    type: 'string',
                    format: 'date',
                    example: '2023-05-20'
                  },
                  published_year: {
                    type: 'integer',
                    example: 2023
                  },
                  authors: {
                    type: 'string',
                    example: 'John Doe, Jane Smith, Robert Johnson'
                  },
                  publication_venue: {
                    type: 'string',
                    example: 'IEEE Conference on Web Technologies'
                  },
                  // For competition
                  competition_name: {
                    type: 'string',
                    example: 'National Hackathon 2023'
                  },
                  competition_year: {
                    type: 'integer',
                    example: 2023
                  },
                  competition_level: {
                    type: 'string',
                    enum: ['university', 'local', 'regional', 'national', 'international'],
                    example: 'national'
                  },
                  achievement: {
                    type: 'string',
                    example: 'First Place'
                  },
                  team_members: {
                    type: 'string',
                    example: 'John Doe, Jane Smith, Robert Johnson'
                  },
                  // File uploads
                  coverImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'Cover image for the project'
                  },
                  courseworkPoster: {
                    type: 'string',
                    format: 'binary',
                    description: 'Poster for coursework projects'
                  },
                  courseworkVideo: {
                    type: 'string',
                    format: 'binary',
                    description: 'Video for coursework projects'
                  },
                  paperFile: {
                    type: 'string',
                    format: 'binary',
                    description: 'PDF file for academic papers'
                  },
                  competitionPoster: {
                    type: 'string',
                    format: 'binary',
                    description: 'Poster for competition projects'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Project created successfully',
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
                      example: 'Project created successfully'
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
                          example: 'Web Development Final Project'
                        },
                        message: {
                          type: 'string',
                          example: 'Project submitted successfully. Please wait for admin approval.'
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
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/projects/{projectId}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project details',
        description: 'Get detailed information about a specific project',
        operationId: 'getProjectDetails',
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
                  $ref: '#/components/schemas/ProjectResponse'
                }
              }
            }
          },
          403: {
            description: 'Project is not publicly accessible',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  success: false,
                  statusCode: 403,
                  message: 'You do not have permission to view this project'
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
      },
      put: {
        tags: ['Projects'],
        summary: 'Update project',
        description: 'Update project information',
        operationId: 'updateProjectWithFiles',
        parameters: [
          {
            $ref: '#/components/parameters/projectId'
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
                  title: {
                    type: 'string',
                    example: 'Updated Project Title'
                  },
                  description: {
                    type: 'string',
                    example: 'Updated project description...'
                  },
                  study_year: {
                    type: 'integer',
                    enum: [1, 2, 3, 4],
                    example: 3
                  },
                  year: {
                    type: 'integer',
                    example: 2023
                  },
                  semester: {
                    type: 'integer',
                    enum: [1, 2, 3],
                    example: 1
                  },
                  visibility: {
                    type: 'integer',
                    enum: [0, 1],
                    example: 1
                  },
                  tags: {
                    type: 'string',
                    example: 'updated,tags,web,javascript'
                  },
                  contributors: {
                    type: 'string',
                    example: '[{"user_id":2},{"user_id":3}]',
                    description: 'JSON string of user IDs'
                  },
                  // Type-specific fields similar to the POST endpoint
                  // File uploads
                  coverImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'New cover image for the project'
                  },
                  posterImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'New poster image'
                  },
                  additionalFiles: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'binary'
                    },
                    description: 'Additional files for the project'
                  }
                }
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
                        message: {
                          type: 'string',
                          example: 'Project updated successfully. Please wait for admin approval.'
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
        tags: ['Projects'],
        summary: 'Delete project',
        description: 'Delete a project',
        operationId: 'deleteProject',
        parameters: [
          {
            $ref: '#/components/parameters/projectId'
          }
        ],
        security: [
          {
            bearerAuth: []
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
          404: {
            $ref: '#/components/responses/NotFound'
          },
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/projects/{projectId}/files': {
      post: {
        tags: ['Projects'],
        summary: 'Upload project file',
        description: 'Upload a file for a specific project',
        operationId: 'uploadProjectFile',
        parameters: [
          {
            $ref: '#/components/parameters/projectId'
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
                required: ['file'],
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to upload'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'File uploaded successfully',
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
                      example: 'File uploaded successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        fileId: {
                          type: 'integer',
                          example: 1
                        },
                        fileName: {
                          type: 'string',
                          example: 'document.pdf'
                        },
                        filePath: {
                          type: 'string',
                          example: 'uploads/documents/document-1234.pdf'
                        },
                        fileSize: {
                          type: 'integer',
                          example: 1024000
                        },
                        fileType: {
                          type: 'string',
                          example: 'pdf'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Invalid file',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  success: false,
                  statusCode: 400,
                  message: 'No file uploaded'
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
    '/projects/{projectId}/company-view': {
      post: {
        tags: ['Projects'],
        summary: 'Record company view',
        description: 'Record a view from a company',
        operationId: 'recordCompanyView',
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
                type: 'object',
                required: ['company_name', 'contact_email'],
                properties: {
                  company_name: {
                    type: 'string',
                    example: 'Acme Inc.'
                  },
                  contact_email: {
                    type: 'string',
                    format: 'email',
                    example: 'contact@acme.com'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Company view recorded successfully',
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
                      example: 'Company view recorded successfully'
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
          404: {
            description: 'Project not found or not publicly accessible',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  success: false,
                  statusCode: 404,
                  message: 'Project not found or not publicly accessible'
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
    '/projects/{projectId}/visitor-view': {
      post: {
        tags: ['Projects'],
        summary: 'Record visitor view',
        description: 'Record a view from a visitor',
        operationId: 'recordVisitorView',
        parameters: [
          {
            $ref: '#/components/parameters/projectId'
          }
        ],
        responses: {
          200: {
            description: 'Visitor view recorded successfully',
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
                      example: 'Visitor view recorded successfully'
                    },
                    data: {
                      type: 'null'
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'Project not found or not publicly accessible',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  success: false,
                  statusCode: 404,
                  message: 'Project not found or not publicly accessible'
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
    '/projects/types': {
      get: {
        tags: ['Projects'],
        summary: 'Get project types',
        description: 'Get a list of all project types/categories',
        operationId: 'getProjectTypes',
        responses: {
          200: {
            description: 'Project types retrieved successfully',
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
                      example: 'Project types retrieved successfully'
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          value: {
                            type: 'string',
                            example: 'coursework'
                          },
                          label: {
                            type: 'string',
                            example: 'ผลงานการเรียน'
                          }
                        }
                      }
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
    '/projects/years': {
      get: {
        tags: ['Projects'],
        summary: 'Get project years',
        description: 'Get a list of all academic years with projects',
        operationId: 'getProjectYears',
        responses: {
          200: {
            description: 'Project years retrieved successfully',
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
                      example: 'Project years retrieved successfully'
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'integer',
                        example: 2023
                      }
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
    '/projects/study-years': {
      get: {
        tags: ['Projects'],
        summary: 'Get study years',
        description: 'Get a list of all study years',
        operationId: 'getStudyYears',
        responses: {
          200: {
            description: 'Study years retrieved successfully',
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
                      example: 'Study years retrieved successfully'
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'integer',
                        enum: [1, 2, 3, 4],
                        example: 3
                      }
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
    }
  };