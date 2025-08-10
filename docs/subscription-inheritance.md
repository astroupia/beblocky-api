# Subscription Inheritance Feature

## Overview

The subscription inheritance feature allows students (children) to automatically inherit their parent's subscription plan when they are added to a parent account. This ensures that children get access to the same premium features as their parents without requiring separate payments.

## How It Works

### 1. **Parent-Child Relationship**

- Parents can add children to their account using the `POST /parents/:parentId/children` endpoint
- Each child is linked to the parent via the `parentId` field in the student record
- When a child is added, the system automatically checks the parent's subscription status

### 2. **Subscription Inheritance Logic**

- **Parent has active subscription** → Child inherits the parent's plan
- **Parent has no subscription** → Child keeps their existing subscription (usually FREE tier)
- **Child already has subscription** → Child's subscription is upgraded to match parent's plan
- **Child has no subscription** → New subscription is created inheriting from parent

### 3. **Inheritance Rules**

- **Plan Name**: Child inherits the exact same plan name as parent
- **Features**: Child gets access to all parent's subscription features
- **Price**: Child pays $0 (inherits for free)
- **End Date**: Child's subscription expires when parent's subscription expires
- **Auto-renewal**: Child's subscription doesn't auto-renew (depends on parent)
- **Status**: Child's subscription is set to 'active'

## API Endpoints

### Add Child to Parent

```http
POST /parents/:parentId/children
```

**Request Body:**

```json
{
  "email": "child@example.com",
  "dateOfBirth": "2010-05-15",
  "grade": 5,
  "gender": "male",
  "section": "A",
  "emergencyContact": {
    "name": "Parent Emergency",
    "relationship": "Parent",
    "phone": "+251911234567"
  }
}
```

**Response:**

```json
{
  "parent": {
    "_id": "parent_id",
    "userId": "user_id",
    "children": ["student_id"]
    // ... other parent fields
  },
  "student": {
    "_id": "student_id",
    "userId": "child_user_id",
    "parentId": "parent_id"
    // ... other student fields
  },
  "subscriptionInherited": true,
  "parentSubscriptionPlan": "Pro-Bundle"
}
```

## Implementation Details

### Parent Service (`src/parent/services/parent.service.ts`)

The `addChild` method has been enhanced with subscription inheritance logic:

```typescript
async addChild(parentId: string, addChildDto: AddChildDto) {
  // ... existing validation logic ...

  // Get parent's subscription to inherit
  const parentSubscriptions = await this.subscriptionService.findByUserId(parent.userId);
  const parentActiveSubscription = parentSubscriptions.find(
    (sub) => sub.status === SubscriptionStatus.ACTIVE,
  );

  // ... create/update student logic ...

  // Handle subscription inheritance
  let subscriptionInherited = false;
  if (parentActiveSubscription) {
    subscriptionInherited = await this.inheritParentSubscription(
      student.userId,
      parentActiveSubscription,
    );
  }

  return {
    parent: updatedParent,
    student: student,
    subscriptionInherited,
    parentSubscriptionPlan: parentActiveSubscription?.planName || null,
  };
}
```

### Subscription Inheritance Method

```typescript
private async inheritParentSubscription(
  childUserId: string,
  parentSubscription: any,
): Promise<boolean> {
  try {
    // Check if child already has a subscription
    const childSubscriptions = await this.subscriptionService.findByUserId(childUserId);
    const childActiveSubscription = childSubscriptions.find(
      (sub) => sub.status === SubscriptionStatus.ACTIVE,
    );

    if (childActiveSubscription) {
      // Update existing subscription to inherit parent's plan
      await this.subscriptionService.update(
        (childActiveSubscription as any)._id.toString(),
        {
          planName: parentSubscription.planName,
          features: parentSubscription.features,
          price: 0, // Child inherits for free
          status: SubscriptionStatus.ACTIVE,
          endDate: parentSubscription.endDate,
          autoRenew: false,
          cancelAtPeriodEnd: false,
        },
      );
    } else {
      // Create new subscription inheriting from parent
      await this.subscriptionService.create({
        userId: childUserId,
        planName: parentSubscription.planName,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: parentSubscription.endDate,
        autoRenew: false,
        price: 0,
        currency: parentSubscription.currency,
        billingCycle: parentSubscription.billingCycle,
        features: parentSubscription.features,
        lastPaymentDate: new Date(),
        nextBillingDate: parentSubscription.nextBillingDate,
        cancelAtPeriodEnd: false,
      });
    }

    return true;
  } catch (error) {
    console.error('Error inheriting parent subscription for child:', error);
    return false;
  }
}
```

## Testing

### Manual Testing

Use the provided test script to verify the functionality:

```bash
pnpm run test:subscription-inheritance
```

### Test Scenarios

1. **New Child**: Child without existing subscription inherits parent's plan
2. **Existing Child**: Child with existing subscription gets upgraded to parent's plan
3. **No Parent Subscription**: Child keeps their current subscription
4. **Multiple Children**: Each child inherits the same parent subscription

## Use Cases

### 1. **Family Learning Plans**

- Parents purchase premium subscriptions
- Children automatically get access to premium features
- Single payment covers the entire family

### 2. **Educational Institutions**

- Schools can set up parent accounts with premium access
- Students inherit access through their parents
- Simplified billing and access management

### 3. **Subscription Management**

- Parents can upgrade/downgrade their subscription
- Children's access automatically adjusts
- Centralized subscription control

## Benefits

1. **Cost Efficiency**: Single subscription covers multiple family members
2. **User Experience**: Seamless access for children without additional setup
3. **Administrative Simplicity**: Centralized subscription management
4. **Scalability**: Easy to add/remove children from family plans

## Error Handling

- **Parent not found**: Returns 404 error
- **User not found**: Returns 404 error
- **Subscription inheritance fails**: Logs error but doesn't break child creation
- **Database errors**: Graceful fallback with error logging

## Future Enhancements

1. **Subscription Limits**: Limit number of children per parent subscription
2. **Partial Inheritance**: Allow selective feature inheritance
3. **Temporary Access**: Time-limited inheritance for trial periods
4. **Bulk Operations**: Add multiple children at once
5. **Inheritance Rules**: Configurable inheritance policies

## Monitoring

The system logs subscription inheritance events:

- ✅ Successful inheritance with plan details
- ❌ Failed inheritance attempts with error details
- 📋 Inheritance statistics and usage metrics

This feature ensures that families can easily share premium educational content while maintaining proper access control and billing management.
