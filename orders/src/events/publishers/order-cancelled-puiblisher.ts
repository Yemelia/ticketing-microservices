import { Publisher, OrderCretedEvent, Subjects, OrderCancelledEvent } from '@yemeliaorg/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCanceled;
}