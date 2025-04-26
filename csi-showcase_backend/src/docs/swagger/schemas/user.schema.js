// src/docs/swagger/schemas/user.schema.js

export const User = {
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
      image: {
        type: 'string',
        nullable: true,
        example: 'uploads/profiles/profile-1234.jpg'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2023-01-15T08:30:00Z'
      }
    }
  };
  
  export const UserLogin = {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: {
        type: 'string',
        example: 'johndoe'
      },
      password: {
        type: 'string',
        format: 'password',
        example: 'password123'
      }
    }
  };
  
  export const UserRegister = {
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
      }
    }
  };
  
  export const UserProfile = {
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
      image: {
        type: 'string',
        nullable: true,
        example: 'uploads/profiles/profile-1234.jpg'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2023-01-15T08:30:00Z'
      },
      stats: {
        type: 'object',
        properties: {
          totalProjects: {
            type: 'integer',
            example: 5
          },
          approvedProjects: {
            type: 'integer',
            example: 3
          }
        }
      },
      projects: {
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
              example: 'Web Development Project'
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
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              example: 'approved'
            },
            image: {
              type: 'string',
              example: 'uploads/images/project-1234.jpg'
            },
            projectLink: {
              type: 'string',
              example: '/projects/1'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-02-15T08:30:00Z'
            }
          }
        }
      }
    }
  };
  
  export const ChangePassword = {
    type: 'object',
    required: ['currentPassword', 'newPassword'],
    properties: {
      currentPassword: {
        type: 'string',
        format: 'password',
        example: 'OldPassword123!'
      },
      newPassword: {
        type: 'string',
        format: 'password',
        example: 'NewPassword456!'
      }
    }
  };
  
  export const ForgotPassword = {
    type: 'object',
    required: ['email'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'john.doe@example.com'
      }
    }
  };
  
  export const ResetPassword = {
    type: 'object',
    required: ['token', 'newPassword', 'confirmPassword'],
    properties: {
      token: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      newPassword: {
        type: 'string',
        format: 'password',
        example: 'NewPassword456!'
      },
      confirmPassword: {
        type: 'string',
        format: 'password',
        example: 'NewPassword456!'
      }
    }
  };
  
  export const UserLoginResponse = {
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
        example: 'Login successful'
      },
      data: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          user: {
            $ref: '#/components/schemas/User'
          }
        }
      }
    }
  };