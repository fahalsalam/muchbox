import { toast } from 'sonner'

// Toast utility functions with consistent styling and behavior

export const showToast = {
  // Success toast
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    })
  },

  // Error toast
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    })
  },

  // Info toast
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    })
  },

  // Warning toast
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    })
  },

  // Custom toast with action
  withAction: (
    message: string,
    description: string,
    actionLabel: string,
    actionFn: () => void
  ) => {
    toast(message, {
      description,
      action: {
        label: actionLabel,
        onClick: actionFn,
      },
      duration: 6000,
    })
  },

  // Loading toast
  loading: (message: string, description?: string) => {
    return toast.loading(message, {
      description,
    })
  },

  // Promise toast
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return toast.promise(promise, messages)
  },

  // Dismiss toast
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId)
  },
}

// Specific toast messages for common actions
export const toastMessages = {
  // Auth
  loginSuccess: () => showToast.success('Welcome back!', 'You have successfully logged in.'),
  loginError: (error?: string) => showToast.error('Login Failed', error || 'Please check your credentials and try again.'),
  logoutSuccess: () => showToast.info('Logged Out', 'You have been successfully logged out.'),

  // Orders
  orderCreated: () => showToast.success('Order Created', 'New order has been successfully created.'),
  orderUpdated: () => showToast.success('Order Updated', 'Order details have been saved.'),
  orderDeleted: () => showToast.success('Order Deleted', 'Order has been removed successfully.'),
  orderProcessed: () => showToast.success('Order Processed', 'Order is now ready for delivery.'),
  orderDelivered: () => showToast.success('Order Delivered', 'Order has been successfully delivered.'),

  // Customers
  customerCreated: () => showToast.success('Customer Added', 'New customer has been successfully registered.'),
  customerUpdated: () => showToast.success('Customer Updated', 'Customer information has been saved.'),
  customerDeleted: () => showToast.success('Customer Removed', 'Customer has been successfully removed.'),

  // Generic
  saveSuccess: () => showToast.success('Saved Successfully', 'Your changes have been saved.'),
  saveError: () => showToast.error('Save Failed', 'Unable to save changes. Please try again.'),
  deleteConfirm: (itemName: string, onConfirm: () => void) => 
    showToast.withAction(
      'Confirm Deletion',
      `Are you sure you want to delete ${itemName}?`,
      'Delete',
      onConfirm
    ),
  networkError: () => showToast.error('Network Error', 'Please check your internet connection and try again.'),
  unexpectedError: () => showToast.error('Unexpected Error', 'Something went wrong. Please refresh the page and try again.'),
}

// Demo toast for testing
export const showDemoToast = () => {
  showToast.withAction(
    'Event has been created',
    'Sunday, December 03, 2023 at 9:00 AM',
    'Undo',
    () => {
      showToast.info('Action undone', 'The event has been removed.')
    }
  )
}
