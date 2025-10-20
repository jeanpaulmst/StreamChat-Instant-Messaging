import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';
import { UsersService } from '../users/users.service';
import { AddContactDto } from './dto/add-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    private usersService: UsersService,
  ) {}

  async addContact(userId: string, addContactDto: AddContactDto) {
    const { contactEmail } = addContactDto;

    // Buscar el usuario que se quiere agregar como contacto
    const contactUser = await this.usersService.findByEmail(contactEmail);
    if (!contactUser) {
      throw new NotFoundException(
        'No existe un usuario con ese email registrado',
      );
    }

    // Verificar que no intente agregarse a sí mismo
    if (userId === contactUser._id.toString()) {
      throw new BadRequestException(
        'No puedes agregarte a ti mismo como contacto',
      );
    }

    // Verificar si el contacto ya existe
    const existingContact = await this.contactModel.findOne({
      userId: new Types.ObjectId(userId),
      contactId: contactUser._id,
    });

    if (existingContact) {
      throw new ConflictException(
        'Este usuario ya está en tu lista de contactos',
      );
    }

    // Crear el contacto
    const newContact = new this.contactModel({
      userId: new Types.ObjectId(userId),
      contactId: contactUser._id,
    });

    await newContact.save();

    return {
      message: 'Contacto agregado exitosamente',
      contact: {
        id: contactUser._id,
        name: contactUser.name,
        email: contactUser.email,
        phoneNumber: contactUser.phoneNumber,
        profilePhoto: contactUser.profilePhoto,
      },
    };
  }

  async getContacts(userId: string) {
    const contacts = await this.contactModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('contactId', 'name email phoneNumber profilePhoto')
      .exec();

    return contacts.map((contact) => {
      const contactUser = contact.contactId as any;
      return {
        id: contactUser._id,
        name: contactUser.name,
        email: contactUser.email,
        phoneNumber: contactUser.phoneNumber,
        profilePhoto: contactUser.profilePhoto,
        addedAt: contact.addedAt,
      };
    });
  }

  async deleteContact(userId: string, contactId: string) {
    const contact = await this.contactModel.findOne({
      userId: new Types.ObjectId(userId),
      contactId: new Types.ObjectId(contactId),
    });

    if (!contact) {
      throw new NotFoundException('Contacto no encontrado en tu lista');
    }

    await this.contactModel.deleteOne({
      userId: new Types.ObjectId(userId),
      contactId: new Types.ObjectId(contactId),
    });

    return {
      message: 'Contacto eliminado exitosamente',
    };
  }
}
