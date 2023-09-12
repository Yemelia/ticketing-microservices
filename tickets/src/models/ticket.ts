import mongoose from 'mongoose';

// Required to create new User
interface TicketAttrs {
  title: string;
  price: string;
  userId: string;
}

// Desscribe props that User Document has
interface TicketDoc extends mongoose.Document {
  title: string;
  price: string;
  userId: string;
}

// Describe props that User Model has
interface TicketModel extends mongoose.Model<any> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  userId: {
    type: String,
    require: true,
  }
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
    },
  }
});

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
