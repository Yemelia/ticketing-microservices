import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';


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

it('returns an error if order doesn\'t exist', async () => {
  await request(app)
    .get(`/api/order/${new mongoose.Types.ObjectId()}`)
    .set('Cookie', global.signin())
    .expect(404);
});

it('returns an error if user does not have permissions', async () => {
  const userOne = global.signin();
  const ticket = await createTicket();
  const { body: order } = await createOrder(ticket.id, userOne);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .expect(401);
});

it('fetches order by id', async () => {
  const user = global.signin();
  const ticket = await createTicket();

  const { body: order } = await createOrder(ticket.id, user);

  const response = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(200);

  expect(response.body).toEqual(order);
});