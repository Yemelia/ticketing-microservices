import { Subjects } from './subjects';
import { OrderStatus } from './types/order-status';

export interface OrderCancelledEvent {
  subject: Subjects.OrderCanceled,
  data: {
    id: string;
    ticket: {
      id: string;
    }
  };
}