import request from 'supertest';
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

it('fetches orders for an particular user', async () => {
  const ticketOne = await createTicket();
  const ticketTwo = await createTicket();
  const ticketThree = await createTicket();

  const userOne = global.signin();
  const userTwo = global.signin();

  const { body: orderOne } = await createOrder(ticketOne.id, userOne);

  const { body: orderTwo } = await createOrder(ticketTwo.id, userTwo);
  const { body: orderThree } = await createOrder(ticketThree.id, userTwo);

  const responseUserOne = await request(app)
    .get('/api/orders')
    .set('Cookie', userOne)
    .expect(200);

  const responseUserTwo = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200);

  expect(responseUserOne.body).toEqual([orderOne]);
  expect(responseUserTwo.body).toEqual([orderTwo, orderThree]);
})