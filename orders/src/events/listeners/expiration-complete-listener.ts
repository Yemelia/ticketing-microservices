import { ExpirationCompleteEvent, Listener, OrderStatus, Subjects } from '@yemeliaorg/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queue-group-name';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-puiblisher';
import { natsWrapper } from '../../nats-wrapper';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();
    
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}