import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContactDocument = Contact & Document;

@Schema({ timestamps: true })
export class Contact {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  contactId: Types.ObjectId;

  @Prop({ default: Date.now })
  addedAt: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);

// Índice compuesto para evitar duplicados y mejorar búsquedas
ContactSchema.index({ userId: 1, contactId: 1 }, { unique: true });
