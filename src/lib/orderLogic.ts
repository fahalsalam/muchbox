import { UserRole, AppSettings } from '@/types';

/**
 * Order Creation Logic Utilities
 * Implements the comprehensive order creation rules based on user roles and time windows
 */

export interface OrderDateResult {
  orderDate: Date;
  isAllowed: boolean;
  reason?: string;
}

export interface OrderPermissions {
  canPlaceOrder: boolean;
  canEditOrderDate: boolean;
  reason?: string;
}

/**
 * Calculate the order delivery date based on current time and morning window
 * Step 2: Order Date Rule
 */
export function calculateOrderDate(
  currentTime: Date,
  morningWindowEnd: string = '09:00'
): Date {
  const [endHour, endMinute] = morningWindowEnd.split(':').map(Number);
  
  // Create morning window end time for today
  const morningWindowEndTime = new Date(currentTime);
  morningWindowEndTime.setHours(endHour, endMinute, 0, 0);
  
  const orderDate = new Date(currentTime);
  
  // If current time is between 12:00 AM - 9:00 AM (morning window)
  if (currentTime.getHours() < endHour || 
      (currentTime.getHours() === endHour && currentTime.getMinutes() < endMinute)) {
    // OrderDate = Today
    return orderDate;
  } else {
    // If order placed after 9:00 AM → OrderDate = Today + 1
    orderDate.setDate(orderDate.getDate() + 1);
    return orderDate;
  }
}

/**
 * Check if orders are allowed based on cut-off time and user role
 * Step 3: Cut-off Time Rule
 */
export function checkOrderPermissions(
  currentTime: Date,
  userRole: UserRole,
  cutOffTime: string = '22:00'
): OrderPermissions {
  const [cutOffHour, cutOffMinute] = cutOffTime.split(':').map(Number);
  
  // Create cut-off time for today
  const cutOffDateTime = new Date(currentTime);
  cutOffDateTime.setHours(cutOffHour, cutOffMinute, 0, 0);
  
  // Admin users are always allowed
  switch (userRole) {
    case 'Admin':
      return {
        canPlaceOrder: true,
        canEditOrderDate: true,
        reason: 'Admin user - no restrictions'
      };
  }
  
  // Check if current time is after cut-off
  const isAfterCutOff = currentTime > cutOffDateTime;
  
  if (isAfterCutOff) {
    return {
      canPlaceOrder: false,
      canEditOrderDate: false,
      reason: `Orders are not allowed after ${cutOffTime}. Please try again tomorrow.`
    };
  }
  
  // Normal, User, and Privileged users can place orders before cut-off
  // Step 4: Date Edit Permissions
  if (userRole === 'Privileged') {
    return {
      canPlaceOrder: true,
      canEditOrderDate: true,
      reason: undefined
    };
  }
  
  // Normal and User roles - restricted permissions
  return {
    canPlaceOrder: true,
    canEditOrderDate: false,
    reason: userRole === 'User' ? 'OrderDate is locked for User role' : 'OrderDate is locked for Normal users'
  };
}

/**
 * Main order creation logic that combines all rules
 */
export function getOrderCreationLogic(
  userRole: UserRole,
  settings: AppSettings,
  currentTime: Date = new Date()
): {
  orderDate: Date;
  permissions: OrderPermissions;
  isInMorningWindow: boolean;
} {
  // Provide safe defaults if settings are undefined
  const morningWindowEnd = settings?.morningWindowEnd || '14:30'
  const nightCutOffTime = settings?.nightCutOffTime || '22:00'
  
  // Calculate suggested order date
  const orderDate = calculateOrderDate(currentTime, morningWindowEnd);
  
  // Check permissions
  const permissions = checkOrderPermissions(currentTime, userRole, nightCutOffTime);
  
  // Check if we're in morning window
  const [endHour, endMinute] = morningWindowEnd.split(':').map(Number);
  const isInMorningWindow = currentTime.getHours() < endHour || 
    (currentTime.getHours() === endHour && currentTime.getMinutes() < endMinute);
  
  return {
    orderDate,
    permissions,
    isInMorningWindow
  };
}

/**
 * Format time for display
 */
export function formatTimeForDisplay(time: string): string {
  try {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  } catch {
    return time;
  }
}

/**
 * Get user-friendly explanation of the order date logic
 */
export function getOrderDateExplanation(
  userRole: UserRole,
  settings: AppSettings,
  currentTime: Date = new Date()
): string {
  const logic = getOrderCreationLogic(userRole, settings, currentTime);
  const morningEndFormatted = formatTimeForDisplay(settings.morningWindowEnd);
  const cutOffFormatted = formatTimeForDisplay(settings.nightCutOffTime);
  
  let explanation = '';
  
  if (logic.isInMorningWindow) {
    explanation = `Orders placed before ${morningEndFormatted} are delivered today.`;
  } else {
    explanation = `Orders placed after ${morningEndFormatted} are delivered tomorrow.`;
  }
  
  if (userRole === 'Admin') {
    explanation += ' As an Admin, you can place orders anytime and edit delivery dates freely.';
  } else if (userRole === 'Privileged') {
    explanation += ` Orders are blocked after ${cutOffFormatted}, but you can edit delivery dates.`;
  } else if (userRole === 'User') {
    explanation += ` Orders are blocked after ${cutOffFormatted}, and delivery date is locked for User role.`;
  } else {
    explanation += ` Orders are blocked after ${cutOffFormatted}, and delivery date is locked.`;
  }
  
  return explanation;
}

/**
 * Validate if a custom order date is allowed for the user
 */
export function validateCustomOrderDate(
  customDate: Date,
  userRole: UserRole,
  currentTime: Date = new Date()
): { isValid: boolean; reason?: string } {
  if (userRole === 'Admin') {
    return { isValid: true };
  }
  
  if (userRole === 'Normal' || userRole === 'User') {
    return { 
      isValid: false, 
      reason: userRole === 'User' ? 'User role cannot edit delivery dates' : 'Normal users cannot edit delivery dates' 
    };
  }
  
  // Privileged users can edit but with some restrictions
  const today = new Date(currentTime);
  today.setHours(0, 0, 0, 0);
  
  const selectedDate = new Date(customDate);
  selectedDate.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return { 
      isValid: false, 
      reason: 'Cannot select past dates for delivery' 
    };
  }
  
  return { isValid: true };
}
