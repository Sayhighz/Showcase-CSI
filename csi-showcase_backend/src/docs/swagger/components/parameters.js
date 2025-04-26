// src/docs/swagger/components/parameters.js

export default {
    userId: {
      name: 'userId',
      in: 'path',
      required: true,
      schema: {
        type: 'integer',
        example: 1
      },
      description: 'User ID'
    },
    projectId: {
      name: 'projectId',
      in: 'path',
      required: true,
      schema: {
        type: 'integer',
        example: 1
      },
      description: 'Project ID'
    },
    page: {
      name: 'page',
      in: 'query',
      schema: {
        type: 'integer',
        default: 1,
        minimum: 1
      },
      description: 'Page number for pagination'
    },
    limit: {
      name: 'limit',
      in: 'query',
      schema: {
        type: 'integer',
        default: 10,
        minimum: 1,
        maximum: 100
      },
      description: 'Number of items per page'
    },
    keyword: {
      name: 'keyword',
      in: 'query',
      schema: {
        type: 'string'
      },
      description: 'Search keyword'
    },
    type: {
      name: 'type',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['coursework', 'academic', 'competition']
      },
      description: 'Filter by project type'
    },
    year: {
      name: 'year',
      in: 'query',
      schema: {
        type: 'integer',
        example: 2023
      },
      description: 'Filter by academic year'
    },
    studyYear: {
      name: 'studyYear',
      in: 'query',
      schema: {
        type: 'integer',
        enum: [1, 2, 3, 4]
      },
      description: 'Filter by study year level'
    },
    status: {
      name: 'status',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected']
      },
      description: 'Filter by project status'
    },
    role: {
      name: 'role',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['student', 'admin']
      },
      description: 'Filter by user role'
    },
    search: {
      name: 'search',
      in: 'query',
      schema: {
        type: 'string'
      },
      description: 'General search term'
    },
    fileId: {
      name: 'fileId',
      in: 'query',
      schema: {
        type: 'integer',
        example: 1
      },
      description: 'File ID'
    },
    startDate: {
      name: 'startDate',
      in: 'query',
      schema: {
        type: 'string',
        format: 'date',
        example: '2023-01-01'
      },
      description: 'Start date for date range filter'
    },
    endDate: {
      name: 'endDate',
      in: 'query',
      schema: {
        type: 'string',
        format: 'date',
        example: '2023-12-31'
      },
      description: 'End date for date range filter'
    }
  };