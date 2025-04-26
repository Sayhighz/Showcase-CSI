// src/docs/swagger/paths/admin/statistics.js

export default {
    '/admin/statistics/dashboard': {
      get: {
        tags: ['Admin Statistics'],
        summary: 'Get dashboard statistics',
        description: 'Retrieve comprehensive statistics for the admin dashboard',
        operationId: 'getDashboardStats',
        security: [
          {
            bearerAuth: [],
            adminApiKey: []
          }
        ],
        responses: {
          200: {
            description: 'Dashboard statistics retrieved successfully',
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
                      example: 'Dashboard statistics retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        totals: {
                          type: 'object',
                          properties: {
                            projects: {
                              type: 'integer',
                              example: 250
                            },
                            users: {
                              type: 'integer',
                              example: 150
                            },
                            views: {
                              type: 'integer',
                              example: 5000
                            }
                          }
                        },
                        projectStats: {
                          type: 'object',
                          properties: {
                            byType: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  type: {
                                    type: 'string',
                                    example: 'coursework'
                                  },
                                  count: {
                                    type: 'integer',
                                    example: 150
                                  }
                                }
                              }
                            },
                            byStatus: {
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
                                    example: 200
                                  }
                                }
                              }
                            },
                            byMonth: {
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
                                    example: 25
                                  }
                                }
                              }
                            },
                            topViewed: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  id: {
                                    type: 'integer',
                                    example: 1
                                  },
                                  title: {
                                    type: 'string',
                                    example: 'Web Development Final Project'
                                  },
                                  viewsCount: {
                                    type: 'integer',
                                    example: 120
                                  },
                                  category: {
                                    type: 'string',
                                    example: 'coursework'
                                  },
                                  author: {
                                    type: 'object',
                                    properties: {
                                      username: {
                                        type: 'string',
                                        example: 'johndoe'
                                      },
                                      fullName: {
                                        type: 'string',
                                        example: 'John Doe'
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        userStats: {
                          type: 'object',
                          properties: {
                            byRole: {
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
                            byMonth: {
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
                        },
                        viewStats: {
                          type: 'object',
                          properties: {
                            byMonth: {
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
    '/admin/statistics/today': {
      get: {
        tags: ['Admin Statistics'],
        summary: 'Get today\'s statistics',
        description: 'Retrieve today\'s statistics compared with yesterday',
        operationId: 'getTodayStats',
        security: [
          {
            bearerAuth: [],
            adminApiKey: []
          }
        ],
        responses: {
          200: {
            description: 'Today\'s statistics retrieved successfully',
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
                      example: 'Today statistics retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        projects: {
                          type: 'object',
                          properties: {
                            today: {
                              type: 'integer',
                              example: 8
                            },
                            yesterday: {
                              type: 'integer',
                              example: 6
                            },
                            percentChange: {
                              type: 'integer',
                              example: 33
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
                            yesterday: {
                              type: 'integer',
                              example: 4
                            },
                            percentChange: {
                              type: 'integer',
                              example: 25
                            }
                          }
                        },
                        views: {
                          type: 'object',
                          properties: {
                            visitor: {
                              type: 'object',
                              properties: {
                                today: {
                                  type: 'integer',
                                  example: 100
                                },
                                yesterday: {
                                  type: 'integer',
                                  example: 80
                                },
                                percentChange: {
                                  type: 'integer',
                                  example: 25
                                }
                              }
                            },
                            company: {
                              type: 'object',
                              properties: {
                                today: {
                                  type: 'integer',
                                  example: 20
                                },
                                yesterday: {
                                  type: 'integer',
                                  example: 15
                                },
                                percentChange: {
                                  type: 'integer',
                                  example: 33
                                }
                              }
                            },
                            total: {
                              type: 'object',
                              properties: {
                                today: {
                                  type: 'integer',
                                  example: 120
                                },
                                yesterday: {
                                  type: 'integer',
                                  example: 95
                                },
                                percentChange: {
                                  type: 'integer',
                                  example: 26
                                }
                              }
                            }
                          }
                        },
                        logins: {
                          type: 'object',
                          properties: {
                            today: {
                              type: 'integer',
                              example: 45
                            },
                            yesterday: {
                              type: 'integer',
                              example: 38
                            },
                            percentChange: {
                              type: 'integer',
                              example: 18
                            }
                          }
                        },
                        reviews: {
                          type: 'object',
                          properties: {
                            approved: {
                              type: 'object',
                              properties: {
                                today: {
                                  type: 'integer',
                                  example: 8
                                },
                                yesterday: {
                                  type: 'integer',
                                  example: 5
                                },
                                percentChange: {
                                  type: 'integer',
                                  example: 60
                                }
                              }
                            },
                            rejected: {
                              type: 'object',
                              properties: {
                                today: {
                                  type: 'integer',
                                  example: 2
                                },
                                yesterday: {
                                  type: 'integer',
                                  example: 1
                                },
                                percentChange: {
                                  type: 'integer',
                                  example: 100
                                }
                              }
                            },
                            total: {
                              type: 'object',
                              properties: {
                                today: {
                                  type: 'integer',
                                  example: 10
                                },
                                yesterday: {
                                  type: 'integer',
                                  example: 6
                                },
                                percentChange: {
                                  type: 'integer',
                                  example: 67
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
    '/admin/statistics/project-types': {
      get: {
        tags: ['Admin Statistics'],
        summary: 'Get project type statistics',
        description: 'Retrieve statistics grouped by project types',
        operationId: 'getProjectTypeStats',
        security: [
          {
            bearerAuth: [],
            adminApiKey: []
          }
        ],
        responses: {
          200: {
            description: 'Project type statistics retrieved successfully',
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
                      example: 'Project type statistics retrieved successfully'
                    },
                    data: {
                      $ref: '#/components/schemas/ProjectTypeStats'
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
    '/admin/statistics/study-years': {
      get: {
        tags: ['Admin Statistics'],
        summary: 'Get study year statistics',
        description: 'Retrieve statistics grouped by study years',
        operationId: 'getStudyYearStats',
        security: [
          {
            bearerAuth: [],
            adminApiKey: []
          }
        ],
        responses: {
          200: {
            description: 'Study year statistics retrieved successfully',
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
                      example: 'Study year statistics retrieved successfully'
                    },
                    data: {
                      $ref: '#/components/schemas/StudyYearStats'
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