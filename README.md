# Route Scheduling System API

A REST API for managing route scheduling with driver assignments, built with Node.js, Express, MongoDB, and Mongoose.

## Features

### Core Requirements ✅

- **POST /api/v1/routes** - Add new routes
- **POST /api/v1/drivers** - Add drivers
- **GET /api/v1/schedule** - View driver-route assignments
- Automatic driver assignment logic
- One active route per driver constraint
- Unassigned route handling

### Bonus Features ✅

- **GET /api/v1/drivers/{id}/history** - Driver route history
- **Pagination** for all GET endpoints
- Advanced filtering and search
- Comprehensive validation with Joi
- Error handling and logging
- Security middleware

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Validation**: Joi
- **Security**: Helmet, CORS, XSS protection
- **Logging**: Morgan

## API Endpoints

### Routes

- `POST /api/v1/routes` - Create a new route
- `GET /api/v1/routes` - Get all routes (with pagination & filtering)
- `GET /api/v1/routes/:id` - Get a specific route
- `PATCH /api/v1/routes/:id` - Update a route
- `DELETE /api/v1/routes/:id` - Delete a route (soft delete)

### Drivers

- `POST /api/v1/drivers` - Create a new driver
- `GET /api/v1/drivers` - Get all drivers (with pagination & filtering)
- `GET /api/v1/drivers/:id` - Get a specific driver
- `PATCH /api/v1/drivers/:id` - Update a driver
- `DELETE /api/v1/drivers/:id` - Delete a driver (soft delete)
- `GET /api/v1/drivers/:id/history` - Get driver's route history

### Schedule

- `GET /api/v1/schedule` - Get all schedule assignments
- `GET /api/v1/schedule/:id` - Get a specific schedule assignment
- `PATCH /api/v1/schedule/:id` - Update schedule status
- `POST /api/v1/schedule` - Manually assign driver to route
- `GET /api/v1/schedule/unassigned-routes` - Get unassigned routes
- `GET /api/v1/schedule/available-drivers` - Get available drivers

### Health Check

- `GET /api/v1/health` - API health status
- `GET /` - API information

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd route-scheduling-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp env.example .env
   ```

   Update `.env` with your configuration:

   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/route-scheduling-system
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**

   - Local: Ensure MongoDB is running on your system
   - Cloud: Use MongoDB Atlas or similar service

5. **Run the application**

   ```bash
   # Development mode
   npm start

   # Or with nodemon for auto-restart
   npx nodemon server.js
   ```

6. **Verify installation**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

## API Usage Examples

### Create a Route

```bash
curl -X POST http://localhost:3000/api/v1/routes \
  -H "Content-Type: application/json" \
  -d '{
    "startLocation": "New York",
    "endLocation": "Boston",
    "distance": 350,
    "estimatedTime": 240
  }'
```

### Create a Driver

```bash
curl -X POST http://localhost:3000/api/v1/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "licenseType": "B",
    "availability": true
  }'
```

### Get Schedule

```bash
curl http://localhost:3000/api/v1/schedule
```

### Get Driver History

```bash
curl http://localhost:3000/api/v1/drivers/{driver-id}/history
```

## Data Models

### Route

```javascript
{
  startLocation: String (required, 2-100 chars),
  endLocation: String (required, 2-100 chars),
  distance: Number (required, 0.1-10000),
  estimatedTime: Number (required, 1-1440 minutes),
  status: String (pending/assigned/in-progress/completed/cancelled),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Driver

```javascript
{
  name: String (required, 2-50 chars),
  licenseType: String (required, A/B/C/D),
  availability: Boolean (default: true),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Schedule

```javascript
{
  driver: ObjectId (ref: Driver),
  route: ObjectId (ref: Route),
  status: String (active/completed/cancelled),
  assignedAt: Date,
  completedAt: Date,
  notes: String (max 500 chars),
  createdAt: Date,
  updatedAt: Date
}
```

## Business Logic

### Driver Assignment Rules

1. **One Active Route**: Each driver can handle only one active route at a time
2. **Availability Priority**: Available drivers (`availability: true`) are preferred
3. **Automatic Assignment**: Routes are automatically assigned to available drivers when created
4. **Unassigned Routes**: Routes remain unassigned if no drivers are available
5. **Status Updates**: Driver availability updates when routes are completed/cancelled

### Route Status Flow

- `pending` → `assigned` → `in-progress` → `completed`
- Routes can be `cancelled` at any stage

### Schedule Status Flow

- `active` → `completed` or `cancelled`

## Validation

### Input Validation

- **Joi schemas** for all request validation
- **Mongoose validation** for data integrity
- **Custom validation** for business rules

### Error Handling

- **Global error handler** for consistent error responses
- **Operational errors** vs **Programming errors**
- **Detailed error messages** in development
- **Sanitized errors** in production

## Security Features

- **Helmet** for security headers
- **CORS** configuration
- **XSS protection** with xss-clean
- **NoSQL injection** protection with mongo-sanitize
- **Parameter pollution** prevention with hpp
- **Request size limits**

## Pagination & Filtering

### Query Parameters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `status` - Filter by status
- `availability` - Filter drivers by availability
- `licenseType` - Filter drivers by license type
- `startLocation` - Search routes by start location
- `endLocation` - Search routes by end location

### Example

```bash
GET /api/v1/routes?page=2&limit=5&status=pending
GET /api/v1/drivers?availability=true&licenseType=B
GET /api/v1/schedule?status=active&page=1&limit=20
```

## Assumptions Made

1. **Soft Deletes**: Routes and drivers are soft-deleted (marked as inactive)
2. **Automatic Assignment**: Routes are automatically assigned when created
3. **License Types**: A, B, C, D license types are supported
4. **Time Units**: Distance in kilometers, time in minutes
5. **Single Database**: All data stored in one MongoDB database
6. **No Authentication**: API is open (can be extended with auth)
7. **Status Management**: Comprehensive status tracking for routes and schedules

## Development

### Project Structure

```
├── app.js                 # Express app configuration
├── server.js              # Server startup
├── models/                # Mongoose models
│   ├── driverModel.js
│   ├── routeModel.js
│   └── scheduleModel.js
├── controllers/           # Route controllers
│   ├── driverController.js
│   ├── routeController.js
│   └── scheduleController.js
├── routes/                # Express routes
│   ├── driverRoutes.js
│   ├── routeRoutes.js
│   └── scheduleRoutes.js
├── validators/            # Joi validation schemas
│   ├── driverValidator.js
│   ├── routeValidator.js
│   └── scheduleValidator.js
├── utils/                 # Utility functions
│   ├── appError.js
│   ├── catchAsync.js
│   └── errorController.js
└── package.json
```

### Scripts

- `npm start` - Start the server
- `npm run debug` - Start with debugger

## Testing

Test the API using tools like:

- **Postman** - GUI testing
- **curl** - Command line testing
- **Thunder Client** - VS Code extension
- **Insomnia** - API client

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set up proper CORS origins
4. Use process manager (PM2)
5. Set up monitoring and logging
6. Configure reverse proxy (Nginx)

## License

ISC License

## Author

Eslam Amin

---

**Note**: This API implements all required features plus bonus features for the DRB internship task. The system is production-ready with proper error handling, validation, and security measures.
