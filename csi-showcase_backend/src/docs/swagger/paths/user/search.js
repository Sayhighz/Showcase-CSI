// src/docs/swagger/paths/user/search.js

export default {
    '/search/projects': {
      get: {
        tags: ['Search'],
        summary: 'Search projects',
        description: 'Search for projects based on various criteria',
        operationId: 'searchProjects',
        parameters: [
          {
            $ref: '#/components/parameters/keyword'
          },
          {
            $ref: '#/components/parameters/type'
          },
          {
            $ref: '#/components/parameters/year'
          },
          {
            $ref: '#/components/parameters/studyYear'
          },
          {
            $ref: '#/components/parameters/page'
          },
          {
            $ref: '#/components/parameters/limit'
          }
        ],
        responses: {
          200: {
            description: 'Search results retrieved successfully',
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
                      example: 'Search results retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        projects: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/ProjectSimple'
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
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/search/students': {
      get: {
        tags: ['Search'],
        summary: 'Search students',
        description: 'Search for students by name or username',
        operationId: 'searchStudents',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            $ref: '#/components/parameters/keyword'
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              default: 10
            },
            description: 'Maximum number of results to return'
          },
          {
            name: 'requireAuth',
            in: 'query',
            schema: {
              type: 'boolean',
              default: true
            },
            description: 'Whether authentication is required for this search'
          }
        ],
        responses: {
          200: {
            description: 'Search results retrieved successfully',
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
                      example: 'Found 5 students matching "john"'
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
                          username: {
                            type: 'string',
                            example: 'johndoe'
                          },
                          fullName: {
                            type: 'string',
                            example: 'John Doe'
                          },
                          image: {
                            type: 'string',
                            nullable: true,
                            example: 'uploads/profiles/profile-1234.jpg'
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
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/search/tags': {
      get: {
        tags: ['Search'],
        summary: 'Search projects by tags',
        description: 'Search for projects that have a specific tag',
        operationId: 'searchProjectsByTags',
        parameters: [
          {
            name: 'tag',
            in: 'query',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'Tag to search for'
          },
          {
            $ref: '#/components/parameters/page'
          },
          {
            $ref: '#/components/parameters/limit'
          }
        ],
        responses: {
          200: {
            description: 'Search results retrieved successfully',
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
                      example: 'Found 10 projects with tag "javascript"'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        tag: {
                          type: 'string',
                          example: 'javascript'
                        },
                        projects: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/ProjectSimple'
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
          400: {
            description: 'Tag parameter is missing',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  success: false,
                  statusCode: 400,
                  message: 'Please provide a tag'
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
    '/search/popular-tags': {
      get: {
        tags: ['Search'],
        summary: 'Get popular tags',
        description: 'Get a list of popular tags',
        operationId: 'getPopularTags',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              default: 10
            },
            description: 'Maximum number of tags to return'
          }
        ],
        responses: {
          200: {
            description: 'Popular tags retrieved successfully',
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
                      example: 'Retrieved 10 popular tags'
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          tag: {
                            type: 'string',
                            example: 'javascript'
                          },
                          count: {
                            type: 'integer',
                            example: 42
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
    '/search/popular-searches': {
      get: {
        tags: ['Search'],
        summary: 'Get popular searches',
        description: 'Get a list of popular search terms',
        operationId: 'getPopularSearches',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              default: 10
            },
            description: 'Maximum number of search terms to return'
          }
        ],
        responses: {
          200: {
            description: 'Popular searches retrieved successfully',
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
                      example: 'Retrieved 10 popular searches'
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          keyword: {
                            type: 'string',
                            example: 'machine learning'
                          },
                          count: {
                            type: 'integer',
                            example: 56
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
    '/search/log': {
      post: {
        tags: ['Search'],
        summary: 'Log search keyword',
        description: 'Log a search keyword for analytics',
        operationId: 'logSearch',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['keyword'],
                properties: {
                  keyword: {
                    type: 'string',
                    example: 'machine learning'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Search keyword logged successfully',
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
                      example: 'Search keyword logged successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        keyword: {
                          type: 'string',
                          example: 'machine learning'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Keyword is missing',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  success: false,
                  statusCode: 400,
                  message: 'Please provide a search keyword'
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
    '/search/history': {
      get: {
        tags: ['Search'],
        summary: 'Get user search history',
        description: 'Get the search history of the current user',
        operationId: 'getUserSearchHistory',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              default: 10
            },
            description: 'Maximum number of history items to return'
          }
        ],
        responses: {
          200: {
            description: 'Search history retrieved successfully',
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
                      example: 'Retrieved 10 search history items'
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          keyword: {
                            type: 'string',
                            example: 'machine learning'
                          },
                          search_count: {
                            type: 'integer',
                            example: 5
                          },
                          last_searched: {
                            type: 'string',
                            format: 'date-time',
                            example: '2023-03-15T10:30:00Z'
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
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    }
  };