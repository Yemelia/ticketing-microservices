import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from '@yemeliaorg/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';


export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCanceled = Subjects.OrderCanceled;

  queueGroupName = queueGroupName

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw Error('Ticket not found');
    }

    ticket.set({
      orderId: undefined,
    });

    await ticket.save();

    const {
      id,
      price,
      title,
      userId,
      orderId,
      version,
    } = ticket;

    new TicketUpdatedPublisher(this.client).publish({
      id,
      price,
      title,
      userId,
      orderId,
      version,
    });

    msg.ack();
  }
}