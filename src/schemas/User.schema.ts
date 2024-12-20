import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ minlength: 8, required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
