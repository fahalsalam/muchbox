import { api } from '@/lib/api';
import { API_ENDPOINTS, HEADER_KEYS, QUERY_PARAMS } from './endpoints';
import {
  Customer,
  CustomerType,
  CustomerFormData,
  Order,
  OrderFormData,
  OrderFilters,
  DashboardData,
  OrderSummary,
  OrderPivot,
  LoginCredentials,
  ApiResponse,
  ApiIndividualCustomer,
  ApiCompanyCustomer,
  ApiAgentCustomer,
  CreateCustomerRequest,
  CreateCompanyCustomerRequest,
  CreateAgentCustomerRequest,
  MonthlyInvoiceResponse,
  PostInvoiceRequest,
} from '@/types';

// Authentication Services
export const authService = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: any }>> => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post(API_ENDPOINTS.LOGOUT);
    } catch (error: any) {
      console.error('Logout error:', error.response?.data || error.message);
      // Don't throw on logout error, just log it
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoggedIn');
    }
  },
};

// Customer Services
export const customerService = {
  // Create customer by type
  createCustomer: async (data: CustomerFormData): Promise<ApiResponse<Customer>> => {
    try {
      const response = await api.post(
        API_ENDPOINTS.CUSTOMER_MASTER,
        data,
        {
          headers: {
            [HEADER_KEYS.CUSTOMER_TYPE]: data.customerType,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Create customer error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get customers by type
  getCustomers: async (customerType?: CustomerType): Promise<ApiResponse<Customer[]>> => {
    try {
      const params = customerType ? { [QUERY_PARAMS.CUSTOMER_TYPE]: customerType } : {};
      const response = await api.get(API_ENDPOINTS.GET_CUSTOMERS, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get customers error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Update customer
  updateCustomer: async (
    data: Partial<CustomerFormData>,
    customerId: string,
    customerType: CustomerType,
    forzaCustomerID?: string
  ): Promise<ApiResponse<Customer>> => {
    try {
      const headers: Record<string, string> = {
        [HEADER_KEYS.CUSTOMER_TYPE]: customerType,
        [HEADER_KEYS.CUSTOMER_ID]: customerId,
      };
      
      // Add forzaCustomerID header if provided
      if (forzaCustomerID) {
        headers[HEADER_KEYS.FORZA_CUSTOMER_ID] = forzaCustomerID;
      }
      
      const response = await api.put(
        API_ENDPOINTS.UPDATE_CUSTOMER,
        data,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Update customer error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Update customer status (soft delete)
  updateCustomerStatus: async (
    customerId: string,
    isDelete: boolean
  ): Promise<ApiResponse<void>> => {
    try {
      console.log('🚀 Making DELETE request to:', API_ENDPOINTS.DELETE_CUSTOMER);
      console.log('📋 Request headers:', {
        [HEADER_KEYS.IS_DELETE]: isDelete.toString(),
        [HEADER_KEYS.CUSTOMER_ID]: customerId,
      });
      
      const response = await api.delete(API_ENDPOINTS.DELETE_CUSTOMER, {
        headers: {
          [HEADER_KEYS.IS_DELETE]: isDelete.toString(),
          [HEADER_KEYS.CUSTOMER_ID]: customerId,
        },
      });
      
      console.log('📥 DELETE response:', response.data);
      console.log('📊 Response status:', response.status);
      console.log('🔍 Full response object:', response);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Update customer status error:', error.response?.data || error.message);
      console.error('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        }
      });
      throw error.response?.data || error;
    }
  },

  // Get individual customers
  getIndividualCustomers: async (): Promise<ApiResponse<ApiIndividualCustomer[]>> => {
    try {
      console.log('🔍 Fetching individual customers...');
      const response = await api.get(API_ENDPOINTS.GET_CUSTOMERS, {
        params: {
          customerType: 'individual'
        }
      });
      console.log('📥 Individual customers response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get individual customers error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get company customers
  getCompanyCustomers: async (): Promise<ApiResponse<ApiCompanyCustomer[]>> => {
    try {
      console.log('🔍 Fetching company customers...');
      const response = await api.get(API_ENDPOINTS.GET_CUSTOMERS, {
        params: {
          customerType: 'company'
        }
      });
      console.log('📥 Company customers response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get company customers error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get agent customers
  getAgentCustomers: async (): Promise<ApiResponse<ApiAgentCustomer[]>> => {
    try {
      console.log('🔍 Fetching agent customers...');
      const response = await api.get(API_ENDPOINTS.GET_CUSTOMERS, {
        params: {
          customerType: 'agent'
        }
      });
      console.log('📥 Agent customers response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get agent customers error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Create individual customer
  createIndividualCustomer: async (customerData: CreateCustomerRequest): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(API_ENDPOINTS.CUSTOMER_MASTER, customerData, {
        headers: {
          [HEADER_KEYS.CUSTOMER_TYPE]: 'individual'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Create customer error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Create company customer
  createCompanyCustomer: async (customerData: CreateCompanyCustomerRequest): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(API_ENDPOINTS.CUSTOMER_MASTER, customerData, {
        headers: {
          [HEADER_KEYS.CUSTOMER_TYPE]: 'company'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Create company customer error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Create agent customer
  createAgentCustomer: async (customerData: CreateAgentCustomerRequest): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(API_ENDPOINTS.CUSTOMER_MASTER, customerData, {
        headers: {
          [HEADER_KEYS.CUSTOMER_TYPE]: 'agent'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Create agent customer error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
};

// Order Services
export const orderService = {
  // Create order
  createOrder: async (data: OrderFormData): Promise<ApiResponse<Order>> => {
    try {
      const response = await api.post(API_ENDPOINTS.ORDERS, data);
      return response.data;
    } catch (error: any) {
      console.error('Create order error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get orders with filters
  getOrders: async (filters?: OrderFilters): Promise<ApiResponse<Order[]>> => {
    try {
      const params: Record<string, string> = {};
      if (filters?.orderId) params[QUERY_PARAMS.ORDER_ID] = filters.orderId;
      if (filters?.orderDate) params[QUERY_PARAMS.ORDER_DATE] = filters.orderDate;
      if (filters?.orderForDate) params[QUERY_PARAMS.ORDER_FOR_DATE] = filters.orderForDate;
      if (filters?.customerType) params[QUERY_PARAMS.CUSTOMER_TYPE] = filters.customerType;

      const response = await api.get(API_ENDPOINTS.GET_ORDERS, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get orders error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Update order
  updateOrder: async (
    data: Partial<OrderFormData>,
    orderId: string,
    orderAID?: string
  ): Promise<ApiResponse<Order>> => {
    try {
      const headers: Record<string, string> = {
        [HEADER_KEYS.ORDER_ID]: orderId,
      };
      if (orderAID) {
        headers[HEADER_KEYS.ORDER_AID] = orderAID;
      }

      const response = await api.put(API_ENDPOINTS.UPDATE_ORDER, data, { headers });
      return response.data;
    } catch (error: any) {
      console.error('Update order error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get order summary
  getOrderSummary: async (): Promise<ApiResponse<OrderSummary[]>> => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDER_SUMMARY);
      return response.data;
    } catch (error: any) {
      console.error('Get order summary error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get order pivot data
  getOrderPivot: async (): Promise<ApiResponse<OrderPivot[]>> => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDER_PIVOT);
      return response.data;
    } catch (error: any) {
      console.error('Get order pivot error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
};

// Kitchen Services
export const kitchenService = {
  // Process orders
  processOrders: async (data: {
    orderIds: string[];
    status: string;
  }): Promise<ApiResponse<void>> => {
    try {
      const response = await api.post(API_ENDPOINTS.PROCESS_ORDERS, data);
      return response.data;
    } catch (error: any) {
      console.error('Process orders error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
};

// Delivery Services
export const deliveryService = {
  // Mark orders for delivery
  deliverOrders: async (data: {
    orderIds: string[];
    deliveryAddress: string;
    deliveryTime: string;
  }): Promise<ApiResponse<void>> => {
    try {
      const response = await api.post(API_ENDPOINTS.DELIVER_ORDERS, data);
      return response.data;
    } catch (error: any) {
      console.error('Deliver orders error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Process delivery orders with date parameters
  processDeliveryOrders: async (orderDate: string, orderFor: string): Promise<ApiResponse<any>> => {
    try {
      console.log('🔍 Processing delivery orders...');
      const response = await api.post(API_ENDPOINTS.DELIVER_ORDERS, '', {
        params: {
          orderDate,
          orderFor,
        },
        headers: {
          'accept': 'text/plain',
        },
      });
      console.log('📥 Delivery orders response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Process delivery orders error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
};

// Dashboard Services
export const dashboardService = {
  // Get dashboard data
  getDashboardData: async (): Promise<ApiResponse<DashboardData>> => {
    try {
      console.log('🔍 Fetching dashboard data...');
      const response = await api.get(API_ENDPOINTS.DASHBOARD);
      console.log('📥 Dashboard API response:', response.data);
      console.log('📊 Dashboard data structure:', {
        summary: response.data?.data?.summary,
        recentActivity: response.data?.data?.recentActivity,
        recentActivityLength: response.data?.data?.recentActivity?.length
      });
      return response.data;
    } catch (error: any) {
      console.error('Get dashboard data error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
};

// Invoice Services
export const invoiceService = {
  // Get monthly invoice summary
  getMonthlyInvoiceSummary: async (): Promise<ApiResponse<MonthlyInvoiceResponse>> => {
    try {
      console.log('🔍 Fetching monthly invoice summary...');
      const response = await api.get(API_ENDPOINTS.MONTHLY_INVOICE_SUMMARY, {
        headers: {
          'accept': 'text/plain',
        },
      });
      console.log('📥 Monthly invoice summary response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get monthly invoice summary error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Post invoice
  postInvoice: async (data: PostInvoiceRequest): Promise<ApiResponse<any>> => {
    try {
      console.log('🔍 Posting invoice...');
      const response = await api.post(API_ENDPOINTS.POST_INVOICE, data, {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
      });
      console.log('📥 Post invoice response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Post invoice error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
};

// Process Services
export const processService = {
  // Deliver and process notes
  deliverAndProcessNotes: async (orderDate: string, orderFor: string): Promise<ApiResponse<any>> => {
    try {
      console.log('🔍 Processing orders with deliverAndProcessNotes...');
      const response = await api.post(API_ENDPOINTS.DELIVER_AND_PROCESS_NOTES, '', {
        params: {
          orderDate,
          orderFor,
        },
        headers: {
          'accept': 'text/plain',
          'Content-Type': 'application/json',
        },
      });
      console.log('📥 Deliver and process notes response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Deliver and process notes error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
};
