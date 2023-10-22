import mongoose from 'mongoose';
import { TicketCreatedEvent } from '@yemeliaorg/common';
import { Message } from 'node-nats-streaming';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
    // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 20,
  });

  await ticket.save();

  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'title2',
    price: 300,
    userId: new mongoose.Types.ObjectId().toHexString(),
  }

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, data, msg, ticket };
};

it('finds, updates and saves a ticket', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
});

it('acks the message', async () => { 
  const { listener, data, msg } = await setup();

  // call th onMessage function with the data object + message
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('should throw an error and does not call ack if wrong version', async () => { 
  const { listener, data, msg } = await setup();

  data.version = data.version + 1;

  // call th onMessage function with the data object + message
  try {
    await listener.onMessage(data, msg);
  } catch {
  }

  expect(msg.ack).not.toHaveBeenCalled();
});