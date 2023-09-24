import { Publisher, Subjects, TicketCreatedEvent } from '@yemeliaorg/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
