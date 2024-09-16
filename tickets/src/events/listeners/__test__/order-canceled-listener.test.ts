import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from '@yemeliaorg/common';
import { Message } from 'node-nats-streaming';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { OrderCancelledListener } from '../order-canceled-listener';

const setup = async () => {
    // create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: 'acf',
  });

  await ticket.save();

  // create a fake data event
  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, ticket, data, msg };
};

it('reset orderId for ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  // call th onMessage function with the data object + message
  await listener.onMessage(data, msg);

  // write assertions to make sure ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.orderId).not.toBeDefined();
});

it('acks the message', async () => { 
  const { listener, data, msg } = await setup();

  // call th onMessage function with the data object + message
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, ticket, data, msg } = await setup();

  // call th onMessage function with the data object + message
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});