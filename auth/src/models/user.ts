import mongoose from 'mongoose';
import { Password } from '../services/password';

// Required to create new User
interface UserAttrs {
  email: string;
  password: string;
}

// Describe props that User Model has
interface UserModel extends mongoose.Model<any> {
  build(attrs: UserAttrs): UserDoc;
}

// Desscribe props that User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;

      delete ret._id;
      delete ret.password;
      delete ret.__v;
    },
  }
});

userSchema.pre('save', async function(done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password')!);
    this.set('password', hashed);
  }

  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };