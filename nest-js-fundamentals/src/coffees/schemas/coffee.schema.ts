import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Mongo automatically makes all the collections plural and lowercased.
@Schema()
export class Coffee extends Document {
  //Mongoose assigns each of your schemas an _id field by default if one is not passed into the Schema constructor.
  @Prop()
  name: string;

  @Prop()
  brand: string;

  @Prop({ default: 0 })
  recommendations: number;

  @Prop([String])
  flavours: string[];
}

export const CoffeeSchema = SchemaFactory.createForClass(Coffee);
