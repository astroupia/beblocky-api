# Better-Auth Integration Solution

## Problem

The user's `_id` from better-auth is a string (e.g., `"eCNMJ7XlKZFEh3U3oBUjxwAxGeWWEqDh"`), but most modules in the backend expect MongoDB ObjectIds for `userId` fields.

## Solution: Update User Entity to Use String IDs

### 1. **Updated User Entity**

- Modified `src/user/entities/user.entity.ts` to use string IDs
- Added `_id: false` to schema options to disable automatic ObjectId generation
- Explicitly defined `_id` as a string field

### 2. **Updated Types**

- Modified `src/types/user/index.ts` to include string `_id`
- Updated `src/types/course/index.ts` to use string `userId` in course ratings

### 3. **Updated Course Rating System**

- Modified course rating entity to use string `userId`
- Updated repository methods to handle string user IDs
- Created utility functions for user ID validation

### 4. **Created User ID Utilities**

- `src/utils/user-id.utils.ts` - Functions for validating better-auth user IDs
- `createUserId()` - Validates and returns user ID string
- `isValidUserId()` - Checks if string is valid better-auth user ID

## Implementation Details

### User Entity Changes

```typescript
@Schema({
  timestamps: true,
  discriminatorKey: 'role',
  collection: 'users',
  _id: false, // Disable automatic ObjectId generation
})
export class UserSchemaClass implements User {
  @Prop({ type: String, required: true, unique: true })
  _id: string; // Explicit string ID from better-auth
  // ... other fields
}
```

### Course Rating Entity Changes

```typescript
export interface CourseRating {
  courseId: Types.ObjectId;
  userId: string; // String ID from better-auth
  rating: RatingValue;
  review?: string;
}
```

### User ID Validation

```typescript
export function createUserId(
  userId: string,
  fieldName: string = 'userId',
): string {
  if (!userId || typeof userId !== 'string') {
    throw new Error(`${fieldName} must be a non-empty string`);
  }

  if (!isValidUserId(userId)) {
    throw new Error(`Invalid ${fieldName}: ${userId}`);
  }

  return userId;
}
```

## Migration Strategy

### Phase 1: Update User Entity ✅

- [x] Update user entity to use string IDs
- [x] Update user types
- [x] Test user creation and retrieval

### Phase 2: Update Course Rating System ✅

- [x] Update course rating entity
- [x] Update course rating types
- [x] Update repository methods
- [x] Create user ID utilities

### Phase 3: Update Other Modules ✅

- [x] Update subscription module
- [x] Update payment module
- [x] Update certificate module
- [x] Update class module
- [x] Update parent module
- [x] Update admin module

### Phase 4: Database Migration ✅

- [x] Create migration script to update existing user documents
- [x] Update existing references to use string user IDs
- [x] Test data integrity

## Alternative Solutions Considered

### Solution 2: Hybrid Approach

- Keep ObjectId for internal user management
- Create a mapping table between better-auth IDs and internal ObjectIds
- Pros: Minimal changes to existing code
- Cons: Additional complexity and potential sync issues

### Solution 3: Custom ObjectId Generation

- Generate ObjectIds from better-auth string IDs
- Pros: Maintains existing ObjectId structure
- Cons: Potential collisions and complexity

## Recommended Approach

**Solution 1 (String IDs)** is recommended because:

- ✅ Simplest implementation
- ✅ Direct compatibility with better-auth
- ✅ No mapping tables or complex transformations
- ✅ Better performance (no ID lookups)
- ✅ Easier to maintain and debug

## Testing

1. Test user creation with better-auth string IDs
2. Test course rating functionality with string user IDs
3. Test all CRUD operations
4. Test data integrity and relationships
5. Test API endpoints with string user IDs

## Next Steps

1. ✅ Update remaining modules to use string user IDs
2. ✅ Create database migration scripts
3. Update API documentation
4. Test integration with frontend
5. Deploy and monitor for issues

## Migration Instructions

### Running the Migration

1. **Backup your database first!**

   ```bash
   mongodump --db beblocky-api --out ./backup
   ```

2. **Run the migration script:**

   ```bash
   node scripts/migrate-user-ids.js migrate
   ```

3. **Verify the migration:**
   - Check that all user documents have string \_id
   - Verify that all references are updated
   - Test API endpoints with string user IDs

### Rollback (if needed)

If you need to rollback the migration:

```bash
# Restore from backup
mongorestore --db beblocky-api ./backup/beblocky-api
```
