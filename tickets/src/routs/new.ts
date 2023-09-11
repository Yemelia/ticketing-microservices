import express, { Request, Response } from 'express';
import { requireAuth } from '@yemeliaorg/common';

const router = express.Router();

router.post('/api/tickets', requireAuth, (req: Request, res: Response) => {
  res.sendStatus(200);
});

export { router as createTicketRouter }