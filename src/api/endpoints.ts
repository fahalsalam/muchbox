// API Endpoint Constants
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: 'DQ/login',
  LOGOUT: 'auth/logout',
  
  // Customer Management
  CUSTOMER_MASTER: 'postCustomerMaster',
  GET_CUSTOMERS: 'getCustomerMaster',
  UPDATE_CUSTOMER: 'putCustomerMaster',
  DELETE_CUSTOMER: 'deleteCustomer',
  
  // Order Management
  ORDERS: 'postOrder',
  GET_ORDERS: 'getOrders',
  UPDATE_ORDER: 'putOrder',
  ORDER_SUMMARY: 'getOrderSummary',
  ORDER_PIVOT: 'getOrderPivot',
  
  // Order Processing
  PROCESS_ORDERS: 'processOrders',
  DELIVER_ORDERS: 'deliverOrders',
  
  // Dashboard
  DASHBOARD: 'getCustomerDashboard',
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

// Header Keys
export const HEADER_KEYS = {
  CUSTOMER_TYPE: 'customerType',
  CUSTOMER_ID: 'customerId',
  ORDER_AID: 'orderAID',
  ORDER_ID: 'orderId',
  IS_DELETE: 'isdelete',
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
} as const;

// Query Parameter Keys
export const QUERY_PARAMS = {
  CUSTOMER_TYPE: 'customerType',
  ORDER_ID: 'orderId',
  ORDER_DATE: 'orderDate',
  ORDER_FOR_DATE: 'orderForDate',
  PAGE: 'page',
  LIMIT: 'limit',
  SEARCH: 'search',
  STATUS: 'status',
} as const;
