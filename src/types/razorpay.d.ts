// types/razorpay.d.ts
declare module "razorpay" {
  export interface RazorpayInstance {
    customers: {
      create(params: {
        name: string;
        email: string;
        contact: string;
        notes?: Record<string, any>;
      }): Promise<{
        id: string;
        name: string;
        email: string;
        contact: string;
        created_at: number;
      }>;

      all(params?: {
        email?: string;
        count?: number;
        skip?: number;
      }): Promise<{
        items: Array<{
          id: string;
          name: string;
          email: string;
          contact: string;
          created_at: number;
        }>;
        count: number;
      }>;
    };

    plans: {
      all(params?: {
        count?: number;
        skip?: number;
      }): Promise<{
        items: Array<{
          id: string;
          entity: string;
          interval: number;
          period: string;
          item: {
            id: string;
            name: string;
            amount: number;
            currency: string;
            description?: string;
          };
          created_at: number;
        }>;
        count: number;
      }>;

      fetch(id: string): Promise<{
        id: string;
        entity: string;
        interval: number;
        period: string;
        item: {
          id: string;
          name: string;
          amount: number;
          currency: string;
          description?: string;
        };
        created_at: number;
      }>;
    };

    subscriptions: {
      create(params: {
        plan_id: string;
        customer_id: string;
        total_count?: number;
        quantity?: number;
        expire_by?: number;
        notes?: Record<string, any>;
        [key: string]: any;
      }): Promise<{
        id: string;
        plan_id: string;
        customer_id: string;
        status: string;
        current_start: number;
        current_end: number;
        start_at: number;
        expire_by: number;
        notes?: Record<string, any>;
      }>;

      fetch(id: string): Promise<any>;
      cancel(id: string): Promise<any>;
      all(params?: any): Promise<any>;
    };
  }
}