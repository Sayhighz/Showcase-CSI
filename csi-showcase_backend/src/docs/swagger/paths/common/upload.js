// src/docs/swagger/paths/common/upload.js

export default {
    '/upload/profile-image': {
      post: {
        tags: ['Upload'],
        summary: 'Upload a profile image',
        description: 'Allows authenticated users to upload their profile image',
        operationId: 'uploadProfileImage',
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
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
                      example: 'File uploaded successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        file: {
                          $ref: '#/components/schemas/FileResponse'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'File upload error',
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
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/upload/images': {
      post: {
        tags: ['Upload'],
        summary: 'Upload multiple images',
        description: 'Allows authenticated users to upload multiple images',
        operationId: 'uploadImages',
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  images: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'binary'
                    },
                    description: 'Image files (JPG, PNG, or GIF)'
                  },
                  project_id: {
                    type: 'integer',
                    description: 'Optional project ID to associate the files with'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Images uploaded successfully',
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
                      example: 'Files uploaded successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        files: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/FileResponse'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'File upload error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
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
    '/upload/video': {
      post: {
        tags: ['Upload'],
        summary: 'Upload a single video',
        description: 'Allows authenticated users to upload a video file',
        operationId: 'uploadVideo',
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  video: {
                    type: 'string',
                    format: 'binary',
                    description: 'Video file (MP4, AVI, or MOV)'
                  },
                  project_id: {
                    type: 'integer',
                    description: 'Optional project ID to associate the file with'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Video uploaded successfully',
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
                        file: {
                          $ref: '#/components/schemas/FileResponse'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'File upload error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
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
    '/upload/documents': {
      post: {
        tags: ['Upload'],
        summary: 'Upload multiple documents',
        description: 'Allows authenticated users to upload multiple document files',
        operationId: 'uploadDocuments',
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  documents: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'binary'
                    },
                    description: 'Document files (PDF, DOC, DOCX, PPT, or PPTX)'
                  },
                  project_id: {
                    type: 'integer',
                    description: 'Optional project ID to associate the files with'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Documents uploaded successfully',
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
                      example: 'Files uploaded successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        files: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/FileResponse'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'File upload error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
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
    '/upload/delete': {
      delete: {
        tags: ['Upload'],
        summary: 'Delete a file',
        description: 'Allows authenticated users to delete a file',
        operationId: 'deleteFile',
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['filePath'],
                properties: {
                  filePath: {
                    type: 'string',
                    description: 'Path of the file to delete',
                    example: 'uploads/images/file-1234.jpg'
                  },
                  file_id: {
                    type: 'integer',
                    description: 'Optional database file ID',
                    example: 1
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'File deleted successfully',
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
                      example: 'File deleted successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        filePath: {
                          type: 'string',
                          example: 'uploads/images/file-1234.jpg'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Invalid file path',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          401: {
            $ref: '#/components/responses/Unauthorized'
          },
          404: {
            description: 'File not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  success: false,
                  statusCode: 404,
                  message: 'File not found or could not be deleted'
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
    '/upload/storage-status': {
      get: {
        tags: ['Upload'],
        summary: 'Get storage status',
        description: 'Retrieves storage status (admin only)',
        operationId: 'getStorageStatus',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: 'Storage status retrieved successfully',
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
                      example: 'Storage status retrieved successfully'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        totalSpace: {
                          type: 'number',
                          example: 10737418240
                        },
                        usedSpace: {
                          type: 'number',
                          example: 2147483648
                        },
                        freeSpace: {
                          type: 'number',
                          example: 8589934592
                        },
                        usagePercentage: {
                          type: 'number',
                          example: 20
                        },
                        formattedTotal: {
                          type: 'string',
                          example: '10 GB'
                        },
                        formattedUsed: {
                          type: 'string',
                          example: '2 GB'
                        },
                        formattedFree: {
                          type: 'string',
                          example: '8 GB'
                        },
                        byFileType: {
                          type: 'object',
                          properties: {
                            images: {
                              type: 'object',
                              properties: {
                                count: {
                                  type: 'integer',
                                  example: 150
                                },
                                size: {
                                  type: 'number',
                                  example: 1073741824
                                },
                                formattedSize: {
                                  type: 'string',
                                  example: '1 GB'
                                }
                              }
                            },
                            videos: {
                              type: 'object',
                              properties: {
                                count: {
                                  type: 'integer',
                                  example: 30
                                },
                                size: {
                                  type: 'number',
                                  example: 536870912
                                },
                                formattedSize: {
                                  type: 'string',
                                  example: '512 MB'
                                }
                              }
                            },
                            documents: {
                              type: 'object',
                              properties: {
                                count: {
                                  type: 'integer',
                                  example: 100
                                },
                                size: {
                                  type: 'number',
                                  example: 536870912
                                },
                                formattedSize: {
                                  type: 'string',
                                  example: '512 MB'
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
    }
  };