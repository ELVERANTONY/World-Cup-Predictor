import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'World Cup Predictor 2026 API',
      version: '2.0.0',
      description: 'Complete API for the World Cup Predictor 2026 - Phase 2',
      contact: { name: 'API Support' },
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            avatarUrl: { type: 'string' },
            role: { type: 'string', enum: ['USER', 'ADMIN'] },
            totalPoints: { type: 'integer' },
            accuracyRate: { type: 'number' },
            rank: { type: 'integer' },
            level: { type: 'integer' },
            xp: { type: 'integer' },
            currentStreak: { type: 'integer' },
            maxStreak: { type: 'integer' },
            predictionsCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Team: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            shortName: { type: 'string' },
            flagUrl: { type: 'string' },
            group: { type: 'string' },
            rank: { type: 'integer' },
            points: { type: 'integer' },
            played: { type: 'integer' },
            won: { type: 'integer' },
            drawn: { type: 'integer' },
            lost: { type: 'integer' },
            goalsFor: { type: 'integer' },
            goalsAgainst: { type: 'integer' },
          },
        },
        Stadium: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' },
            capacity: { type: 'integer' },
            imageUrl: { type: 'string' },
            surface: { type: 'string' },
          },
        },
        Match: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            homeTeam: { $ref: '#/components/schemas/Team' },
            awayTeam: { $ref: '#/components/schemas/Team' },
            stadium: { $ref: '#/components/schemas/Stadium' },
            date: { type: 'string', format: 'date-time' },
            stage: { type: 'string' },
            status: { type: 'string', enum: ['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED'] },
            homeScore: { type: 'integer' },
            awayScore: { type: 'integer' },
            referee: { type: 'string' },
            extraTime: { type: 'boolean' },
            penalties: { type: 'boolean' },
          },
        },
        Prediction: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            match: { $ref: '#/components/schemas/Match' },
            homeScore: { type: 'integer' },
            awayScore: { type: 'integer' },
            points: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Room: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            code: { type: 'string' },
            description: { type: 'string' },
            isPublic: { type: 'boolean' },
            maxMembers: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
                user: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/api/v1/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' }, name: { type: 'string' } } } } } },
          responses: { '201': { description: 'User registered successfully' }, '409': { description: 'Email already registered' } },
        },
      },
      '/api/v1/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login with email and password',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
          responses: { '200': { description: 'Login successful' }, '401': { description: 'Invalid credentials' } },
        },
      },
      '/api/v1/auth/google': {
        post: {
          tags: ['Auth'],
          summary: 'Login/Register with Google',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' } } } } } },
          responses: { '200': { description: 'Google login successful' } },
        },
      },
      '/api/v1/auth/refresh-token': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } } } },
          responses: { '200': { description: 'Token refreshed' } },
        },
      },
      '/api/v1/auth/profile': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'User profile' } },
        },
        put: {
          tags: ['Auth'],
          summary: 'Update current user profile',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, avatarUrl: { type: 'string' }, favoriteTeamId: { type: 'string' } } } } } },
          responses: { '200': { description: 'Profile updated' } },
        },
      },
      '/api/v1/teams': {
        get: { tags: ['Teams'], summary: 'Get all teams', responses: { '200': { description: 'List of teams' } } },
        post: { tags: ['Teams'], summary: 'Create a team (Admin)', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Team created' } } },
      },
      '/api/v1/teams/{id}': {
        get: { tags: ['Teams'], summary: 'Get team by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Team details' } } },
        put: { tags: ['Teams'], summary: 'Update team (Admin)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Team updated' } } },
        delete: { tags: ['Teams'], summary: 'Delete team (Admin)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Team deleted' } } },
      },
      '/api/v1/stadiums': {
        get: { tags: ['Stadiums'], summary: 'Get all stadiums', responses: { '200': { description: 'List of stadiums' } } },
        post: { tags: ['Stadiums'], summary: 'Create a stadium (Admin)', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Stadium created' } } },
      },
      '/api/v1/matches': {
        get: { tags: ['Matches'], summary: 'Get all matches with filters', responses: { '200': { description: 'List of matches' } } },
        post: { tags: ['Matches'], summary: 'Create a match (Admin)', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Match created' } } },
      },
      '/api/v1/matches/{id}/result': {
        patch: { tags: ['Matches'], summary: 'Update match result (Admin)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Result updated' } } },
      },
      '/api/v1/predictions': {
        post: { tags: ['Predictions'], summary: 'Create a prediction', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Prediction created' } } },
      },
      '/api/v1/predictions/my': {
        get: { tags: ['Predictions'], summary: 'Get my predictions', security: [{ bearerAuth: [] }], responses: { '200': { description: 'My predictions' } } },
      },
      '/api/v1/rooms': {
        get: { tags: ['Rooms'], summary: 'List rooms', responses: { '200': { description: 'List of rooms' } } },
        post: { tags: ['Rooms'], summary: 'Create a room', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Room created' } } },
      },
      '/api/v1/rooms/join': {
        post: { tags: ['Rooms'], summary: 'Join a room by code', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Joined room' } } },
      },
      '/api/v1/rooms/my': {
        get: { tags: ['Rooms'], summary: 'Get my rooms', security: [{ bearerAuth: [] }], responses: { '200': { description: 'My rooms' } } },
      },
      '/api/v1/rankings/global': {
        get: { tags: ['Rankings'], summary: 'Get global ranking', responses: { '200': { description: 'Global ranking' } } },
      },
      '/api/v1/rankings/room/{roomId}': {
        get: { tags: ['Rankings'], summary: 'Get room ranking', parameters: [{ name: 'roomId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Room ranking' } } },
      },
      '/api/v1/rankings/weekly': {
        get: { tags: ['Rankings'], summary: 'Get weekly ranking', responses: { '200': { description: 'Weekly ranking' } } },
      },
      '/api/v1/rankings/monthly': {
        get: { tags: ['Rankings'], summary: 'Get monthly ranking', responses: { '200': { description: 'Monthly ranking' } } },
      },
      '/api/v1/statistics/global': {
        get: { tags: ['Statistics'], summary: 'Get global statistics', responses: { '200': { description: 'Global stats' } } },
      },
      '/api/v1/statistics/user/{userId}': {
        get: { tags: ['Statistics'], summary: 'Get user statistics', security: [{ bearerAuth: [] }], responses: { '200': { description: 'User stats' } } },
      },
      '/api/v1/admin/dashboard': {
        get: { tags: ['Admin'], summary: 'Get admin dashboard', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Dashboard data' } } },
      },
      '/api/v1/admin/audit-logs': {
        get: { tags: ['Admin'], summary: 'Get audit logs', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Audit logs' } } },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
