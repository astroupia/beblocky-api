# User Listener Integration

## Overview

The User Listener is a service that automatically creates role-specific instances (teacher, admin, student, parent, organization) when a new user is created in the database. This ensures that every user has the appropriate role-specific profile created automatically.

## How It Works

### 1. **MongoDB Change Streams** (Primary Method)

The `UserListenerService` uses MongoDB change streams to listen for new user documents being inserted into the `users` collection. This works regardless of how the user is created (Better-Auth, API, direct database insertion).

### 2. **Event Emitter** (Alternative Method)

The service also supports event-driven architecture using NestJS EventEmitter for cases where user creation happens through the API.

## When It's Triggered

The user listener is triggered in the following scenarios:

### ✅ **Better-Auth Integration**

- When Better-Auth creates a new user in your MongoDB database
- The change stream detects the new document and automatically creates the role-specific instance
- **No additional configuration needed** - works out of the box

### ✅ **API User Creation**

- When someone calls `POST /users` endpoint
- The `UserService.create()` method emits a `user.created` event
- The listener processes the event and creates the role-specific instance

### ✅ **Direct Database Insertion**

- When users are inserted directly into the database (scripts, migrations, etc.)
- Change streams detect the insertion and trigger the listener

### ✅ **Webhook Integration**

- Better-Auth can call `POST /users/webhook/better-auth` endpoint
- This emits the `user.created` event for processing

## Implementation Details

### Files Created/Modified

1. **`src/user/services/user-listener.service.ts`** - Main listener service
2. **`src/user/services/user.service.ts`** - Updated to emit events
3. **`src/user/controllers/user.controller.ts`** - Added webhook endpoint
4. **`src/user/user.module.ts`** - Updated to include listener and dependencies
5. **`src/app.module.ts`** - Added EventEmitterModule
6. **`scripts/test-user-listener.js`** - Test script

### Service Architecture

```typescript
@Injectable()
export class UserListenerService implements OnModuleInit, OnModuleDestroy {
  // Listens for MongoDB change streams
  // Automatically creates role-specific instances
  // Handles all user roles: teacher, admin, student, parent, organization
}
```

## Role-Specific Instance Creation

When a new user is created, the listener automatically:

1. **Detects the user's role** from the `role` field
2. **Calls the appropriate service** using the `createFromUser` method
3. **Creates the role-specific instance** with the user's ID
4. **Logs the process** for monitoring and debugging

### Supported Roles

- **Teacher** → Creates teacher instance via `TeacherService.createFromUser()`
- **Admin** → Creates admin instance via `AdminService.createFromUser()`
- **Student** → Creates student instance via `StudentService.createFromUser()`
- **Parent** → Creates parent instance via `ParentService.createFromUser()`
- **Organization** → Creates organization instance via `OrganizationService.createFromUser()`

## Configuration

### MongoDB Change Streams

Change streams require MongoDB 3.6+ and a replica set. For local development:

```bash
# Start MongoDB with replica set
mongod --replSet rs0 --port 27017
```

### Event Emitter Configuration

```typescript
EventEmitterModule.forRoot({
  wildcard: false,
  delimiter: '.',
  maxListeners: 10,
  verboseMemoryLeak: false,
  ignoreErrors: false,
});
```

## Testing

### Run the Test Script

```bash
npm run test:user-listener
```

This script:

1. Creates test users with different roles
2. Waits for the listener to process them
3. Verifies that role-specific instances were created
4. Cleans up test data

### Manual Testing

1. Start your NestJS application
2. Create a user via Better-Auth or API
3. Check the logs for listener activity
4. Verify the role-specific instance exists in the database

## Monitoring and Logging

The listener provides comprehensive logging:

```
[UserListenerService] Initializing user listener with MongoDB change streams...
[UserListenerService] User listener started successfully
[UserListenerService] New user detected: eCNMJ7XlKZFEh3U3oBUjxwAxGeWWEqDh
[UserListenerService] Processing new user creation for user: eCNMJ7XlKZFEh3U3oBUjxwAxGeWWEqDh with role: teacher
[UserListenerService] Creating teacher instance for user: eCNMJ7XlKZFEh3U3oBUjxwAxGeWWEqDh
[UserListenerService] Teacher instance created successfully for user: eCNMJ7XlKZFEh3U3oBUjxwAxGeWWEqDh
```

## Error Handling

The listener includes robust error handling:

- **Individual user processing errors** are logged but don't stop the listener
- **Change stream errors** are logged and handled gracefully
- **Service creation errors** are logged with full error details
- **Unknown roles** are logged as warnings

## Benefits

### ✅ **Automatic Role Creation**

- No manual intervention required
- Ensures every user has a role-specific profile
- Reduces data inconsistency

### ✅ **Better-Auth Compatibility**

- Works seamlessly with Better-Auth
- No additional configuration needed
- Real-time processing

### ✅ **Scalable Architecture**

- Uses MongoDB change streams for efficiency
- Event-driven design for loose coupling
- Clean separation of concerns

### ✅ **Comprehensive Logging**

- Full audit trail of user creation
- Easy debugging and monitoring
- Production-ready logging

## Troubleshooting

### Common Issues

1. **Change streams not working**

   - Ensure MongoDB is running as a replica set
   - Check MongoDB version (3.6+ required)

2. **Role instances not created**

   - Check logs for errors
   - Verify user role is valid
   - Ensure all required services are available

3. **Performance issues**
   - Monitor change stream performance
   - Consider adding indexes if needed
   - Check for memory leaks

### Debug Mode

Enable verbose logging by setting the log level:

```typescript
// In your logger configuration
logLevel: 'debug';
```

## Production Considerations

1. **Replica Set**: Ensure MongoDB is configured as a replica set
2. **Monitoring**: Set up alerts for listener errors
3. **Backup**: Regular backups of role-specific collections
4. **Performance**: Monitor change stream performance
5. **Security**: Secure webhook endpoints if used

## API Endpoints

### Webhook Endpoint

```
POST /users/webhook/better-auth
```

- Accepts user data from Better-Auth
- Emits `user.created` event for processing
- Returns `{ success: true }`

### Manual User Creation

```
POST /users
```

- Creates user and emits event
- Automatically triggers role instance creation

## Summary

The User Listener provides a robust, automatic solution for creating role-specific instances when users are created. It works with Better-Auth, API calls, and direct database operations, ensuring data consistency and reducing manual intervention.
