import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '@yemeliaorg/common';
import { Order } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

const createTicket = () => {
  const ticket = Ticket.build({
    title: 'test',
    price: 300
  });

  ticket.save();

  return ticket;
};

const createOrder = async (ticketId: string, cookie: string[]) => {
  return await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId })
    .expect(201);
};

it('throw error if order does not exist', async () => {
  await request(app)
    .delete(`/api/orders/${new mongoose.Types.ObjectId()}`)
    .set('Cookie', global.signin())
    .expect(404);
});

it('throw error if user does not have permission', async () => {
  const user = global.signin();

  const ticket = await createTicket();
  const { body: order } = await createOrder(ticket.id, user);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .expect(401);
});

it('should cancel an order', async () => {
  const user = global.signin();

  const ticket = await createTicket();
  const { body: order } = await createOrder(ticket.id, user);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});


it('emits an order cancelled event', async () => {
  const user = global.signin();

  const ticket = await createTicket();
  const { body: order } = await createOrder(ticket.id, user);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});