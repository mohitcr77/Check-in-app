import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AttendEase API Documentation',
      version: '1.3.0',
      description: 'Complete API documentation for AttendEase - Intelligent Attendance Management System with Geofencing, Work-Life Balance Analytics, and Security Features',
      contact: {
        name: 'AttendEase Support',
        email: 'support@attendease.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server'
      },
      {
        url: 'https://check-in-app-qt3z.onrender.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { type: 'string', enum: ['employee', 'admin'], example: 'employee' },
            organization: { type: 'string', example: '507f1f77bcf86cd799439012' },
            profileImage: { type: 'string', example: 'https://s3.amazonaws.com/bucket/profile.jpg' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Organization: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
            name: { type: 'string', example: 'TechCorp Inc.' },
            code: { type: 'string', example: 'TECHCORP123' },
            admin: { type: 'string', example: '507f1f77bcf86cd799439011' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Location: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439013' },
            name: { type: 'string', example: 'Main Office' },
            address: { type: 'string', example: '123 Tech Street, San Francisco, CA' },
            latitude: { type: 'number', example: 37.7749 },
            longitude: { type: 'number', example: -122.4194 },
            radius: { type: 'number', example: 200, description: 'Geofence radius in meters' },
            organization: { type: 'string', example: '507f1f77bcf86cd799439012' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        AttendanceRecord: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439014' },
            user: { type: 'string', example: '507f1f77bcf86cd799439011' },
            location: { type: 'string', example: '507f1f77bcf86cd799439013' },
            organization: { type: 'string', example: '507f1f77bcf86cd799439012' },
            check_in_time: { type: 'string', format: 'date-time' },
            check_out_time: { type: 'string', format: 'date-time', nullable: true },
            check_in_metadata: {
              type: 'object',
              properties: {
                coordinates: {
                  type: 'object',
                  properties: {
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    accuracy: { type: 'number' }
                  }
                },
                device: {
                  type: 'object',
                  properties: {
                    deviceId: { type: 'string' },
                    deviceName: { type: 'string' },
                    osName: { type: 'string' },
                    osVersion: { type: 'string' },
                    appVersion: { type: 'string' }
                  }
                },
                isMockLocation: { type: 'boolean' },
                isAutomatic: { type: 'boolean' },
                ipAddress: { type: 'string' },
                riskScore: { type: 'number', minimum: 0, maximum: 100 }
              }
            },
            check_out_metadata: { type: 'object' },
            flagged: { type: 'boolean', default: false },
            flagReason: { type: 'string' },
            adminReviewed: { type: 'boolean', default: false },
            adminNotes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Analytics: {
          type: 'object',
          properties: {
            totalHours: { type: 'number', example: 42.5 },
            averageHoursPerDay: { type: 'number', example: 8.5 },
            totalDaysWorked: { type: 'number', example: 5 },
            overtimeHours: { type: 'number', example: 2.5 },
            averageArrivalTime: { type: 'string', example: '9:15' },
            longestDay: {
              type: 'object',
              properties: {
                date: { type: 'string', example: '2026-01-10' },
                hours: { type: 'number', example: 10.5 }
              }
            },
            shortestDay: {
              type: 'object',
              properties: {
                date: { type: 'string', example: '2026-01-13' },
                hours: { type: 'number', example: 6.0 }
              }
            },
            workPattern: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  hours: { type: 'number' }
                }
              }
            },
            healthScore: { type: 'number', minimum: 0, maximum: 100, example: 85 },
            suggestions: {
              type: 'array',
              items: { type: 'string' },
              example: ['Great work-life balance!', 'Consider taking regular breaks']
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            msg: { type: 'string', example: 'Error message' },
            error: { type: 'string', example: 'Detailed error description' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and token management endpoints'
      },
      {
        name: 'Users',
        description: 'User profile and account management'
      },
      {
        name: 'Organizations',
        description: 'Organization registration and management'
      },
      {
        name: 'Locations',
        description: 'Office location and geofence management'
      },
      {
        name: 'Attendance',
        description: 'Check-in/check-out and attendance tracking'
      },
      {
        name: 'Analytics',
        description: 'Work-life balance analytics and insights'
      },
      {
        name: 'Admin',
        description: 'Administrative operations (admin only)'
      }
    ],
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          description: 'Create a new user account. Role is automatically set to "employee". Admins must be promoted by existing admins. Rate limited to 5 requests per 15 minutes.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    password: { type: 'string', format: 'password', minLength: 6, example: 'SecurePass123!' },
                    role: { type: 'string', enum: ['employee'], example: 'employee', description: 'Only employee role allowed during registration' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                      accessToken: { type: 'string', description: 'JWT access token (15min expiry)' },
                      refreshToken: { type: 'string', description: 'JWT refresh token (7 days expiry)' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'User already exists or validation error'
            },
            429: {
              description: 'Too many registration attempts'
            }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login user',
          description: 'Authenticate user and receive access and refresh tokens. Rate limited to 5 requests per 15 minutes.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    password: { type: 'string', format: 'password', example: 'SecurePass123!' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                      accessToken: { type: 'string' },
                      refreshToken: { type: 'string' }
                    }
                  }
                }
              }
            },
            400: { description: 'Invalid credentials' },
            429: { description: 'Too many login attempts' }
          }
        }
      },
      '/api/auth/refresh-token': {
        post: {
          tags: ['Authentication'],
          summary: 'Refresh access token',
          description: 'Get a new access token using refresh token. Implements token rotation for security.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: {
                    refreshToken: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Token refreshed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string' },
                      refreshToken: { type: 'string' }
                    }
                  }
                }
              }
            },
            401: { description: 'Refresh token is required' },
            403: { description: 'Invalid refresh token' }
          }
        }
      },
      '/api/users/profile': {
        get: {
          tags: ['Users'],
          summary: 'Get user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'User profile retrieved',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            },
            401: { description: 'Unauthorized' }
          }
        },
        put: {
          tags: ['Users'],
          summary: 'Update user profile',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Profile updated successfully' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/users/change-password': {
        put: {
          tags: ['Users'],
          summary: 'Change password',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['oldPassword', 'newPassword'],
                  properties: {
                    oldPassword: { type: 'string', format: 'password' },
                    newPassword: { type: 'string', format: 'password', minLength: 6 }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Password changed successfully' },
            400: { description: 'Invalid old password' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/users/upload-profile-image': {
        post: {
          tags: ['Users'],
          summary: 'Upload profile image',
          description: 'Upload user profile image to AWS S3',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    profileImage: { type: 'string', format: 'binary' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Image uploaded successfully' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/users/delete': {
        delete: {
          tags: ['Users'],
          summary: 'Delete user account',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Account deleted successfully' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/organizations/register': {
        post: {
          tags: ['Organizations'],
          summary: 'Register new organization (Admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', example: 'TechCorp Inc.' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Organization created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Organization' }
                }
              }
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Admin access required' }
          }
        }
      },
      '/api/organizations/join': {
        post: {
          tags: ['Organizations'],
          summary: 'Join organization',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['code'],
                  properties: {
                    code: { type: 'string', example: 'TECHCORP123' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Joined organization successfully' },
            400: { description: 'Invalid code or already in organization' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/organizations': {
        get: {
          tags: ['Organizations'],
          summary: 'List all organizations',
          responses: {
            200: {
              description: 'Organizations list',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Organization' }
                  }
                }
              }
            }
          }
        }
      },
      '/api/location': {
        post: {
          tags: ['Locations'],
          summary: 'Create location (Admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'address', 'latitude', 'longitude'],
                  properties: {
                    name: { type: 'string', example: 'Main Office' },
                    address: { type: 'string', example: '123 Tech St' },
                    latitude: { type: 'number', example: 37.7749 },
                    longitude: { type: 'number', example: -122.4194 },
                    radius: { type: 'number', example: 200 }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Location created successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Admin access required' }
          }
        },
        get: {
          tags: ['Locations'],
          summary: 'Get all locations',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Locations list',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Location' }
                  }
                }
              }
            }
          }
        }
      },
      '/api/location/{locationId}': {
        put: {
          tags: ['Locations'],
          summary: 'Update location (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'locationId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    address: { type: 'string' },
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    radius: { type: 'number' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Location updated' },
            401: { description: 'Unauthorized' },
            403: { description: 'Admin access required' }
          }
        },
        delete: {
          tags: ['Locations'],
          summary: 'Delete location (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'locationId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: 'Location deleted' },
            401: { description: 'Unauthorized' },
            403: { description: 'Admin access required' }
          }
        }
      },
      '/api/attendance/checkIn': {
        post: {
          tags: ['Attendance'],
          summary: 'Check-in',
          description: 'Check-in to a location with device security metadata',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['locationId', 'latitude', 'longitude'],
                  properties: {
                    locationId: { type: 'string' },
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    accuracy: { type: 'number' },
                    isAutomatic: { type: 'boolean' },
                    isMockLocation: { type: 'boolean' },
                    deviceInfo: {
                      type: 'object',
                      properties: {
                        deviceId: { type: 'string' },
                        deviceName: { type: 'string' },
                        osName: { type: 'string' },
                        osVersion: { type: 'string' },
                        appVersion: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Check-in successful' },
            400: { description: 'Already checked in' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/attendance/checkout': {
        post: {
          tags: ['Attendance'],
          summary: 'Check-out',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['latitude', 'longitude'],
                  properties: {
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    accuracy: { type: 'number' },
                    isAutomatic: { type: 'boolean' },
                    isMockLocation: { type: 'boolean' },
                    deviceInfo: { type: 'object' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Check-out successful' },
            400: { description: 'No active check-in' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/attendance/records': {
        get: {
          tags: ['Attendance'],
          summary: 'Get user attendance records',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Attendance records',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AttendanceRecord' }
                  }
                }
              }
            }
          }
        }
      },
      '/api/analytics/user': {
        get: {
          tags: ['Analytics'],
          summary: 'Get user analytics',
          description: 'Get work-life balance analytics',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'period',
              in: 'query',
              schema: { type: 'string', enum: ['week', 'month'], default: 'week' }
            }
          ],
          responses: {
            200: {
              description: 'Analytics retrieved',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Analytics' }
                }
              }
            }
          }
        }
      },
      '/api/analytics/team': {
        get: {
          tags: ['Analytics'],
          summary: 'Get team analytics (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'period',
              in: 'query',
              schema: { type: 'string', enum: ['week', 'month'], default: 'week' }
            }
          ],
          responses: {
            200: { description: 'Team analytics retrieved' },
            401: { description: 'Unauthorized' },
            403: { description: 'Admin access required' }
          }
        }
      },
      '/api/analytics/flagged': {
        get: {
          tags: ['Analytics'],
          summary: 'Get flagged records (Admin only)',
          description: 'Get attendance records flagged for review',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Flagged records',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AttendanceRecord' }
                  }
                }
              }
            }
          }
        }
      },
      '/api/analytics/flagged/{recordId}/review': {
        put: {
          tags: ['Analytics'],
          summary: 'Review flagged record (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'recordId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['adminNotes'],
                  properties: {
                    adminNotes: { type: 'string' },
                    clearFlag: { type: 'boolean', default: false }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Record reviewed' },
            401: { description: 'Unauthorized' },
            403: { description: 'Admin access required' }
          }
        }
      },
      '/api/admin/users': {
        get: {
          tags: ['Admin'],
          summary: 'Get all users (Admin only)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Users list',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          }
        }
      },
      '/api/admin/users/{userId}/role': {
        put: {
          tags: ['Admin'],
          summary: 'Update user role (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['role'],
                  properties: {
                    role: { type: 'string', enum: ['employee', 'admin'] }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Role updated' },
            403: { description: 'Not authorized or user not in organization' }
          }
        }
      },
      '/api/admin/users/{userId}': {
        delete: {
          tags: ['Admin'],
          summary: 'Delete user (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: 'User deleted' },
            400: { description: 'Cannot delete yourself' },
            403: { description: 'Not authorized' }
          }
        }
      },
      '/api/admin/attendance/{userId}': {
        get: {
          tags: ['Admin'],
          summary: 'Get user attendance (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'User attendance',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AttendanceRecord' }
                  }
                }
              }
            }
          }
        }
      },
      '/api/admin/attendance/report': {
        post: {
          tags: ['Admin'],
          summary: 'Generate attendance report (Admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    startDate: { type: 'string', format: 'date' },
                    endDate: { type: 'string', format: 'date' },
                    userId: { type: 'string' },
                    locationId: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Report generated' }
          }
        }
      },
      '/api/admin/attendanceRecords/date': {
        get: {
          tags: ['Admin'],
          summary: 'Get attendance by date (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'date',
              in: 'query',
              required: true,
              schema: { type: 'string', format: 'date' }
            }
          ],
          responses: {
            200: { description: 'Attendance records for date' }
          }
        }
      },
      '/api/admin/getLocations': {
        get: {
          tags: ['Admin'],
          summary: 'Get locations by organization (Admin only)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Organization locations',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Location' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export default swaggerDocs;
