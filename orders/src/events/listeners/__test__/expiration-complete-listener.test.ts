import mongoose from 'mongoose';
import { ExpirationCompleteEvent, OrderStatus } from '@yemeliaorg/common';
import { Message } from 'node-nats-streaming';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { Order } from '../../../models/order';

const setup = async () => {
    // create an instance of the listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 20,
  });

  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'test',
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  // create a fake data event
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  }

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, data, msg, order };
};

it('updates order status to cancelled', async () => {
  const { listener, data, msg } = await setup();

  // call th onMessage function with the data object + message
  await listener.onMessage(data, msg);

  // write assertions to make sure ticket was created
  const updatedOrder = await Order.findById(data.orderId);

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {
  const { listener, order, data, msg } = await setup();

  // call th onMessage function with the data object + message
  await listener.onMessage(data, msg);

  // write assertions to make sure ticket was created
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

  expect(eventData.id).toEqual(order.id);
});

it('acks the message', async () => { 
  const { listener, data, msg } = await setup();

  // call th onMessage function with the data object + message
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});