import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@yemeliaorg/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket throw error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark ticket as being reserver by settings its orderID property
    ticket.set({
      orderId: data.id,
    });

    // Save the ticket
    await ticket.save();

    const {
      id,
      price,
      title,
      userId,
      orderId,
      version,
    } = ticket;

    await  new TicketUpdatedPublisher(this.client).publish({
      id,
      price,
      title,
      userId,
      orderId,
      version,
    });

    // ack the message
    msg.ack();
  }
}