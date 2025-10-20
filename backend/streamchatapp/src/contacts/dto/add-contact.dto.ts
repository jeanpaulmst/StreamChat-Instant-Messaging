import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddContactDto {
  @ApiProperty({
    description: 'Email del usuario que deseas agregar como contacto',
    example: 'amigo@example.com',
  })
  @IsNotEmpty({ message: 'El email del contacto es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  contactEmail: string;
}
