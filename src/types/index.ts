// Authentication Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export type UserRole = 'Admin' | 'Privileged' | 'Normal' | 'User';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
}

export interface SettingItem {
  id: number;
  settingKey: string;
  settingValue: string;
}

export interface LoginResponse {
  userID: number;
  userName: string;
  role: UserRole;
  additionalConfig: any;
  settings: SettingItem[];
}

// Customer Types
export type CustomerType = 'individual' | 'company' | 'agent';

export interface BaseCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface IndividualCustomer extends BaseCustomer {
  customerType: 'individual';
  dateOfBirth?: string;
  preferences?: string[];
}

// API Individual Customer Type (matches actual API response)
export interface ApiIndividualCustomer {
  id: number;
  name: string;
  mobile: string;
  address: string;
  joinedDate: string;
  price: string;
  paymentMode: string;
  dietPreference: 'veg' | 'non-veg';
  meals: string; // JSON string like {"Breakfast":true,"Lunch":false,"Dinner":true}
  status: 'Active' | 'Inactive';
  ForzaCustomerID: string | null;
  CustomerCode: string | null; // Backend sends with capital C
}

// Customer Creation Request Types
export interface CreateCustomerRequest {
  name: string;
  mobile: string;
  address: string;
  joinedDate: string;
  price: string;
  paymentMode: string;
  dietPreference: 'veg' | 'non-veg';
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  customerCode: string;
}

export interface CreateCompanyCustomerRequest {
  companyName: string;
  contactPerson: string;
  mobile: string;
  address: string;
  registeredDate: string;
  tradeLicense: string;
  taxNumber: string;
  breakfastPrice: string;
  lunchPrice: string;
  dinnerPrice: string;
  creditLimit: string;
  creditDays: string;
  customerCode: string;
}

export interface CreateAgentCustomerRequest {
  name: string;
  mobile: string;
  address: string;
  joinedDate: string;
  breakfastPrice: string;
  lunchPrice: string;
  dinnerPrice: string;
  creditLimit: string;
  creditDays: string;
  customerCode: string;
}

// API Customer Types (matches actual API responses)
export interface ApiCompanyCustomer {
  id: number;
  name: string | null;
  contactPerson: string;
  mobile: string;
  address: string;
  registeredDate: string;
  tradeLicense: string;
  taxNumber: string;
  breakfastPrice: string;
  lunchPrice: string;
  dinnerPrice: string;
  creditLimit: string;
  creditDays: number | null;
  status: 'Active' | 'Inactive';
  ForzaCustomerID: string | null;
  CustomerCode: string | null; // Backend sends with capital C
}

export interface ApiAgentCustomer {
  id: number;
  name: string;
  mobile: string;
  address: string;
  joinedDate: string;
  breakfastPrice: string;
  lunchPrice: string;
  dinnerPrice: string;
  creditLimit: string;
  creditDays: number;
  status: 'Active' | 'Inactive';
  ForzaCustomerID: string | null;
  CustomerCode: string | null; // Backend sends with capital C
}

export interface CompanyCustomer extends BaseCustomer {
  customerType: 'company';
  companyName: string;
  contactPerson: string;
  businessType: string;
  taxId?: string;
  website?: string;
}

export interface AgentCustomer extends BaseCustomer {
  customerType: 'agent';
  territory: string;
  commissionRate: number;
  performance?: {
    totalSales: number;
    monthlyTarget: number;
  };
}

export type Customer = IndividualCustomer | CompanyCustomer | AgentCustomer;

// Order Types
export interface OrderItem {
  id: string;
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: 'breakfast' | 'lunch' | 'dinner';
  notes?: string;
}

export interface Order {
  OrderAID: number;
  orderId: number;
  CustomerId: string;
  CustomerName: string;
  CustomerMobile: string;
  CustomerType: CustomerType;
  Total: number;
  OrderStatus: 'Orderd' | 'Processed' | 'Delivered' | 'Cancelled';
  breakfastTotal: string;
  breakfastVeg: string;
  breakfastNonVeg: string;
  lunchTotal: string;
  lunchVeg: string;
  lunchNonVeg: string;
  dinnerTotal: string;
  dinnerVeg: string;
  dinnerNonVeg: string;
  OrderDate: string;
  OrderFor: string | null;
  ProcessDateTime: string;
  DeliveryDateTime: string;
}

// Dashboard Types
export interface DashboardSummary {
  totalIndividualCustomers: number;
  totalAgents: number;
  totalCompanies: number;
  totalActiveCustomers: number;
}

export interface RecentActivity {
  customerId: number;
  customerName: string;
  customerType: CustomerType;
  orderId: number;
  total: number;
  meals: string;
  activityDate: string;
  activityType: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentActivity: RecentActivity[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Order Summary Types
export interface OrderSummary {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
  topItems: Array<{
    itemName: string;
    quantity: number;
    revenue: number;
  }>;
}

// Order Pivot Types
export interface OrderPivot {
  customerId: string;
  customerName: string;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
}

// Form Types
export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  customerType: CustomerType;
  // Company specific
  companyName?: string;
  contactPerson?: string;
  businessType?: string;
  taxId?: string;
  website?: string;
  // Agent specific
  territory?: string;
  commissionRate?: number;
  // Individual specific
  dateOfBirth?: string;
  preferences?: string[];
}

export interface OrderFormData {
  customerId: string;
  orderForDate: string;
  items: Omit<OrderItem, 'id' | 'totalPrice'>[];
  notes?: string;
}

// Filter Types
export interface OrderFilters {
  orderId?: string;
  orderDate?: string;
  orderForDate?: string;
  customerType?: CustomerType;
  status?: string;
  customerId?: string;
}

export interface CustomerFilters {
  customerType?: CustomerType;
  status?: 'Active' | 'Inactive';
  search?: string;
}

// Invoice Types
export interface MonthlyInvoiceSummary {
  CustomerId: string;
  CustomerName: string;
  CustomerType: 'individual' | 'company' | 'agent';
  InvoiceMonth: string;
  InvoiceYear: number;
  InvoiceNo: number;
  DORefs: string | null;
  PaymentMode: 'Credit' | 'Cash';
  BreakfastTotal: number;
  LunchTotal: number;
  DinnerTotal: number;
  TotalAmount: number;
  PayStatus: 'Pending' | 'Paid';
  OrderAID: number;
  OrderId: number;
}

export interface InvoiceDetail {
  SL: number;
  Barcode: string;
  ItemCode: string;
  ItemName: string;
  UnitPrice: number;
  Quantity: number;
  Total: number;
  VatValue: number;
  VatId: number;
  OrderAID: number;
  OrderId: number;
}

export interface MonthlyInvoiceResponse {
  headers: MonthlyInvoiceSummary[];
  details: InvoiceDetail[];
}

// POST Invoice API Types
export interface PostInvoiceHeader {
  referenceNo: string;
  prefix: string;
  suffix: string;
  lpoDate: string;
  entryDate: string;
  customerId: number;
  invoiceAmount: number;
  paymentCollectionXml: string;
  taxPostingXml: string;
  termsXml: string;
  messagesXml: string;
  otherChargesXml: string;
}

export interface PostInvoiceDetail {
  sl: number;
  barCode: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  total: number;
  vatValue: number;
  vatId: number;
}

export interface PostInvoiceRequest {
  header: PostInvoiceHeader;
  details: PostInvoiceDetail[];
}

// Kitchen Types
export interface KitchenOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  orderForDate: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number; // in minutes
  status: 'pending' | 'preparing' | 'ready';
  notes?: string;
}

// Delivery Types
export interface DeliveryNote {
  id: string;
  orderId: string;
  customerName: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryDate: string;
  status: 'pending' | 'out_for_delivery' | 'delivered';
  driverName?: string;
  deliveryNotes?: string;
}

// Invoice Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  paymentMethod?: string;
}

// Table Column Types for TanStack Table
export interface ColumnVisibility {
  [key: string]: boolean;
}

export interface SortingState {
  id: string;
  desc: boolean;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Query Keys for TanStack Query
export const QUERY_KEYS = {
  // Authentication
  USER: ['user'],
  
  // Customers
  CUSTOMERS: ['customers'],
  CUSTOMER: (id: string) => ['customer', id],
  CUSTOMERS_BY_TYPE: (type: CustomerType) => ['customers', type],
  
  // Orders
  ORDERS: ['orders'],
  ORDER: (id: string) => ['order', id],
  ORDER_SUMMARY: ['orderSummary'],
  ORDER_PIVOT: ['orderPivot'],
  
  // Dashboard
  DASHBOARD: ['dashboard'],
  
  // Kitchen
  KITCHEN_ORDERS: ['kitchenOrders'],
  
  // Delivery
  DELIVERY_NOTES: ['deliveryNotes'],
  
  // Invoices
  INVOICES: ['invoices'],
  
  // Settings
  SETTINGS: ['settings'],
} as const;

// Settings Types
export interface AppSettings {
  dayCutOffTime: string;
  nightCutOffTime: string;
  morningWindowEnd: string; // Morning window end time (default 09:00)
}

export interface SettingsResponse {
  dayCutOffTime: string;
  nightCutOffTime: string;
  morningWindowEnd: string;
}

export interface UpdateSettingsRequest {
  dayCutOffTime: string;
  nightCutOffTime: string;
  morningWindowEnd: string;
}

export interface PostSettingRequest {
  settingKey: string;
  settingValue: string;
}
