import { Publisher, OrderCretedEvent, Subjects } from '@yemeliaorg/common';

export class OrderCreatedPublisher extends Publisher<OrderCretedEvent> {
  readonly subject = Subjects.OrderCreated;
}