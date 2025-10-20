import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { AddContactDto } from './dto/add-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Usuarios - Contactos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users/:userId/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los contactos de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de contactos obtenida exitosamente',
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439011',
          name: 'María García',
          email: 'maria@example.com',
          phoneNumber: '+987654321',
          profilePhoto: 'url_foto',
          addedAt: '2025-01-15T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para ver los contactos de otro usuario',
  })
  async getContacts(@Request() req, @Param('userId') userId: string) {
    // Validar que el usuario autenticado solo pueda ver sus propios contactos
    if (req.user._id.toString() !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para ver los contactos de otro usuario',
      );
    }
    return this.contactsService.getContacts(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar un nuevo contacto a un usuario por email' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 201,
    description: 'Contacto agregado exitosamente',
    schema: {
      example: {
        message: 'Contacto agregado exitosamente',
        contact: {
          id: '507f1f77bcf86cd799439011',
          name: 'María García',
          email: 'maria@example.com',
          phoneNumber: '+987654321',
          profilePhoto: 'url_foto',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'El contacto ya existe en tu lista',
  })
  @ApiResponse({
    status: 400,
    description: 'No puedes agregarte a ti mismo como contacto',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para agregar contactos a otro usuario',
  })
  async addContact(
    @Request() req,
    @Param('userId') userId: string,
    @Body() addContactDto: AddContactDto,
  ) {
    // Validar que el usuario autenticado solo pueda agregar contactos a su propia lista
    if (req.user._id.toString() !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para agregar contactos a otro usuario',
      );
    }
    return this.contactsService.addContact(userId, addContactDto);
  }

  @Delete(':contactId')
  @ApiOperation({ summary: 'Eliminar un contacto de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'contactId',
    description: 'ID del contacto a eliminar',
    example: '507f1f77bcf86cd799439022',
  })
  @ApiResponse({
    status: 200,
    description: 'Contacto eliminado exitosamente',
    schema: {
      example: {
        message: 'Contacto eliminado exitosamente',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para eliminar contactos de otro usuario',
  })
  async deleteContact(
    @Request() req,
    @Param('userId') userId: string,
    @Param('contactId') contactId: string,
  ) {
    // Validar que el usuario autenticado solo pueda eliminar sus propios contactos
    if (req.user._id.toString() !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar contactos de otro usuario',
      );
    }
    return this.contactsService.deleteContact(userId, contactId);
  }
}
