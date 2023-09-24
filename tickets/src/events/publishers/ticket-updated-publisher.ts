import { Publisher, Subjects, TicketUpdatedEvent } from '@yemeliaorg/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
