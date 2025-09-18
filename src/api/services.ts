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
    customerType: CustomerType
  ): Promise<ApiResponse<Customer>> => {
    try {
      const response = await api.put(
        API_ENDPOINTS.UPDATE_CUSTOMER,
        data,
        {
          headers: {
            [HEADER_KEYS.CUSTOMER_TYPE]: customerType,
            [HEADER_KEYS.CUSTOMER_ID]: customerId,
          },
        }
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
      const response = await api.delete(API_ENDPOINTS.DELETE_CUSTOMER, {
        headers: {
          [HEADER_KEYS.IS_DELETE]: isDelete.toString(),
          [HEADER_KEYS.CUSTOMER_ID]: customerId,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Update customer status error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get individual customers
  getIndividualCustomers: async (): Promise<ApiResponse<ApiIndividualCustomer[]>> => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_CUSTOMERS, {
        params: {
          customerType: 'individual'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get individual customers error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get company customers
  getCompanyCustomers: async (): Promise<ApiResponse<ApiCompanyCustomer[]>> => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_CUSTOMERS, {
        params: {
          customerType: 'company'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get company customers error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get agent customers
  getAgentCustomers: async (): Promise<ApiResponse<ApiAgentCustomer[]>> => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_CUSTOMERS, {
        params: {
          customerType: 'agent'
        }
      });
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
};

// Dashboard Services
export const dashboardService = {
  // Get dashboard data
  getDashboardData: async (): Promise<ApiResponse<DashboardData>> => {
    try {
      const response = await api.get(API_ENDPOINTS.DASHBOARD);
      return response.data;
    } catch (error: any) {
      console.error('Get dashboard data error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
};
