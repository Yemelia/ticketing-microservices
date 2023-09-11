import request from 'supertest';
import { app } from '../../app';

it('returns a 400 with an invalid email', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'test',
      password: 'password',
    })
    .expect(400);
});

it('returns a 400 with an invalid password', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: '',
    })
    .expect(400);
});

it('returns a 400 with missing email and password', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com'
    })
    .expect(400);

  await request(app)
    .post('/api/users/signin')
    .send({
      password: 'password'
    })
    .expect(400);
});

it('fails when a email that does not exist is supplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);
});

it('fails when a incorrect password is supplied', async () => {
  await signup();

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'wrongpassword',
    })
    .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
  await signup();

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password',
    })

  expect(response.get('Set-Cookie')).toBeDefined();
});