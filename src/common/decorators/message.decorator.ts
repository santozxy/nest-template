// src/common/decorators/message.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const MESSAGE_KEY = 'customMessage';

export const Message = (message: string) => SetMetadata(MESSAGE_KEY, message);
