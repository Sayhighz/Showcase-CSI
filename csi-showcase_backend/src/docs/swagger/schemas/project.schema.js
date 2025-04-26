// src/docs/swagger/schemas/project.schema.js

export const Project = {
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
      description: {
        type: 'string',
        example: 'A comprehensive web application built using React.js and Node.js...'
      },
      type: {
        type: 'string',
        enum: ['coursework', 'academic', 'competition'],
        example: 'coursework'
      },
      studyYear: {
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
      status: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected'],
        example: 'approved'
      },
      author: {
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
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com'
          }
        }
      },
      contributors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 2
            },
            username: {
              type: 'string',
              example: 'janedoe'
            },
            fullName: {
              type: 'string',
              example: 'Jane Doe'
            }
          }
        }
      },
      files: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            type: {
              type: 'string',
              example: 'image'
            },
            path: {
              type: 'string',
              example: 'uploads/images/project-1234.jpg'
            },
            name: {
              type: 'string',
              example: 'project-screenshot.jpg'
            },
            size: {
              type: 'integer',
              example: 154200
            }
          }
        }
      },
      viewsCount: {
        type: 'integer',
        example: 42
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2023-02-15T08:30:00Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2023-02-20T10:15:00Z'
      }
    }
  };
  
  export const ProjectCreate = {
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
        type: 'array',
        items: {
          type: 'object',
          properties: {
            user_id: {
              type: 'integer',
              example: 2
            }
          }
        }
      },
      // Type-specific properties
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
      }
    }
  };
  
  export const ProjectUpdate = {
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
        type: 'array',
        items: {
          type: 'object',
          properties: {
            user_id: {
              type: 'integer',
              example: 2
            }
          }
        }
      },
      // Type-specific properties can be updated as well, similar to ProjectCreate schema
    }
  };
  
  export const ProjectResponse = {
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
        example: 'Project retrieved successfully'
      },
      data: {
        $ref: '#/components/schemas/Project'
      }
    }
  };
  
  export const ProjectReview = {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['approved', 'rejected'],
        example: 'approved'
      },
      comment: {
        type: 'string',
        example: 'Great work! The project meets all the requirements.'
      }
    }
  };
  
  export const ProjectSimple = {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 1
      },
      title: {
        type: 'string',
        example: 'Web Development Project'
      },
      description: {
        type: 'string',
        example: 'A comprehensive web application...'
      },
      category: {
        type: 'string',
        example: 'coursework'
      },
      level: {
        type: 'string',
        example: 'ปี 3'
      },
      year: {
        type: 'integer',
        example: 2023
      },
      image: {
        type: 'string',
        nullable: true,
        example: 'uploads/images/project-1234.jpg'
      },
      student: {
        type: 'string',
        example: 'John Doe'
      },
      studentId: {
        type: 'integer',
        example: 1
      },
      projectLink: {
        type: 'string',
        example: '/projects/1'
      },
      viewsCount: {
        type: 'integer',
        example: 42
      }
    }
  };
  
  export const ProjectStatistics = {
    type: 'object',
    properties: {
      total: {
        type: 'integer',
        example: 150
      },
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
              example: 80
            },
            label: {
              type: 'string',
              example: 'ผลงานการเรียน'
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
              example: 120
            },
            label: {
              type: 'string',
              example: 'อนุมัติแล้ว'
            }
          }
        }
      },
      byMonth: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date',
              example: '2023-05'
            },
            count: {
              type: 'integer',
              example: 15
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
              example: 'Popular Project Title'
            },
            views: {
              type: 'integer',
              example: 150
            },
            type: {
              type: 'string',
              example: 'coursework'
            },
            author: {
              type: 'string',
              example: 'John Doe'
            },
            username: {
              type: 'string',
              example: 'johndoe'
            }
          }
        }
      }
    }
  };
  
  export const ProjectTypeStats = {
    type: 'object',
    properties: {
      stats: {
        type: 'object',
        properties: {
          coursework: {
            type: 'object',
            properties: {
              count: {
                type: 'integer',
                example: 80
              },
              avgViews: {
                type: 'number',
                example: 35.5
              },
              approvalRate: {
                type: 'number',
                example: 85.2
              },
              approvedCount: {
                type: 'integer',
                example: 68
              },
              rejectedCount: {
                type: 'integer',
                example: 12
              },
              totalReviewCount: {
                type: 'integer',
                example: 80
              },
              topProjects: {
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
                      example: 'Top Coursework Project'
                    },
                    viewsCount: {
                      type: 'integer',
                      example: 120
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
          academic: {
            type: 'object',
            properties: {
              count: {
                type: 'integer',
                example: 40
              },
              avgViews: {
                type: 'number',
                example: 42.8
              },
              approvalRate: {
                type: 'number',
                example: 90.0
              },
              approvedCount: {
                type: 'integer',
                example: 36
              },
              rejectedCount: {
                type: 'integer',
                example: 4
              },
              totalReviewCount: {
                type: 'integer',
                example: 40
              },
              topProjects: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      example: 2
                    },
                    title: {
                      type: 'string',
                      example: 'Top Academic Paper'
                    },
                    viewsCount: {
                      type: 'integer',
                      example: 150
                    },
                    author: {
                      type: 'object',
                      properties: {
                        username: {
                          type: 'string',
                          example: 'janedoe'
                        },
                        fullName: {
                          type: 'string',
                          example: 'Jane Doe'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          competition: {
            type: 'object',
            properties: {
              count: {
                type: 'integer',
                example: 30
              },
              avgViews: {
                type: 'number',
                example: 55.2
              },
              approvalRate: {
                type: 'number',
                example: 93.3
              },
              approvedCount: {
                type: 'integer',
                example: 28
              },
              rejectedCount: {
                type: 'integer',
                example: 2
              },
              totalReviewCount: {
                type: 'integer',
                example: 30
              },
              topProjects: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      example: 3
                    },
                    title: {
                      type: 'string',
                      example: 'Top Competition Project'
                    },
                    viewsCount: {
                      type: 'integer',
                      example: 180
                    },
                    author: {
                      type: 'object',
                      properties: {
                        username: {
                          type: 'string',
                          example: 'robertj'
                        },
                        fullName: {
                          type: 'string',
                          example: 'Robert Johnson'
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
      monthlyTrends: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            month: {
              type: 'string',
              example: '2023-05'
            },
            coursework: {
              type: 'integer',
              example: 8
            },
            academic: {
              type: 'integer',
              example: 4
            },
            competition: {
              type: 'integer',
              example: 3
            }
          }
        }
      }
    }
  };
  
  export const StudyYearStats = {
    type: 'object',
    properties: {
      stats: {
        type: 'object',
        properties: {
          1: {
            type: 'object',
            properties: {
              count: {
                type: 'integer',
                example: 30
              },
              avgViews: {
                type: 'number',
                example: 25.5
              },
              approvalRate: {
                type: 'number',
                example: 80.0
              },
              approvedCount: {
                type: 'integer',
                example: 24
              },
              rejectedCount: {
                type: 'integer',
                example: 6
              },
              totalReviewCount: {
                type: 'integer',
                example: 30
              },
              byType: {
                type: 'object',
                properties: {
                  coursework: {
                    type: 'integer',
                    example: 20
                  },
                  academic: {
                    type: 'integer',
                    example: 5
                  },
                  competition: {
                    type: 'integer',
                    example: 5
                  }
                }
              },
              topProjects: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      example: 4
                    },
                    title: {
                      type: 'string',
                      example: 'Top Year 1 Project'
                    },
                    viewsCount: {
                      type: 'integer',
                      example: 90
                    },
                    type: {
                      type: 'string',
                      example: 'coursework'
                    },
                    author: {
                      type: 'object',
                      properties: {
                        username: {
                          type: 'string',
                          example: 'freshman'
                        },
                        fullName: {
                          type: 'string',
                          example: 'Fresh Student'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          2: {
            type: 'object',
            properties: {
              count: {
                type: 'integer',
                example: 40
              },
              avgViews: {
                type: 'number',
                example: 30.5
              },
              approvalRate: {
                type: 'number',
                example: 85.0
              },
              approvedCount: {
                type: 'integer',
                example: 34
              },
              rejectedCount: {
                type: 'integer',
                example: 6
              },
              totalReviewCount: {
                type: 'integer',
                example: 40
              },
              byType: {
                type: 'object',
                properties: {
                  coursework: {
                    type: 'integer',
                    example: 25
                  },
                  academic: {
                    type: 'integer',
                    example: 10
                  },
                  competition: {
                    type: 'integer',
                    example: 5
                  }
                }
              },
              topProjects: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      example: 5
                    },
                    title: {
                      type: 'string',
                      example: 'Top Year 2 Project'
                    },
                    viewsCount: {
                      type: 'integer',
                      example: 100
                    },
                    type: {
                      type: 'string',
                      example: 'academic'
                    },
                    author: {
                      type: 'object',
                      properties: {
                        username: {
                          type: 'string',
                          example: 'sophomore'
                        },
                        fullName: {
                          type: 'string',
                          example: 'Sophomore Student'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          3: {
            type: 'object',
            properties: {
              count: {
                type: 'integer',
                example: 50
              },
              avgViews: {
                type: 'number',
                example: 40.2
              },
              approvalRate: {
                type: 'number',
                example: 88.0
              },
              approvedCount: {
                type: 'integer',
                example: 44
              },
              rejectedCount: {
                type: 'integer',
                example: 6
              },
              totalReviewCount: {
                type: 'integer',
                example: 50
              },
              byType: {
                type: 'object',
                properties: {
                  coursework: {
                    type: 'integer',
                    example: 20
                  },
                  academic: {
                    type: 'integer',
                    example: 15
                  },
                  competition: {
                    type: 'integer',
                    example: 15
                  }
                }
              },
              topProjects: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      example: 6
                    },
                    title: {
                      type: 'string',
                      example: 'Top Year 3 Project'
                    },
                    viewsCount: {
                      type: 'integer',
                      example: 130
                    },
                    type: {
                      type: 'string',
                      example: 'competition'
                    },
                    author: {
                      type: 'object',
                      properties: {
                        username: {
                          type: 'string',
                          example: 'junior'
                        },
                        fullName: {
                          type: 'string',
                          example: 'Junior Student'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          4: {
            type: 'object',
            properties: {
              count: {
                type: 'integer',
                example: 30
              },
              avgViews: {
                type: 'number',
                example: 50.8
              },
              approvalRate: {
                type: 'number',
                example: 93.3
              },
              approvedCount: {
                type: 'integer',
                example: 28
              },
              rejectedCount: {
                type: 'integer',
                example: 2
              },
              totalReviewCount: {
                type: 'integer',
                example: 30
              },
              byType: {
                type: 'object',
                properties: {
                  coursework: {
                    type: 'integer',
                    example: 15
                  },
                  academic: {
                    type: 'integer',
                    example: 10
                  },
                  competition: {
                    type: 'integer',
                    example: 5
                  }
                }
              },
              topProjects: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      example: 7
                    },
                    title: {
                      type: 'string',
                      example: 'Top Year 4 Project'
                    },
                    viewsCount: {
                      type: 'integer',
                      example: 180
                    },
                    type: {
                      type: 'string',
                      example: 'academic'
                    },
                    author: {
                      type: 'object',
                      properties: {
                        username: {
                          type: 'string',
                          example: 'senior'
                        },
                        fullName: {
                          type: 'string',
                          example: 'Senior Student'
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
  };
  
  export const ProjectPaginated = {
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
              $ref: '#/components/schemas/ProjectSimple'
            }
          },
          pagination: {
            $ref: '#/components/schemas/Pagination'
          }
        }
      }
    }
  };