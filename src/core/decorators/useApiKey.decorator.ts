import { SetMetadata } from '@nestjs/common';

export const IS_API_KEY = 'isUseApiKey';
export const UseApiKey = () => SetMetadata(IS_API_KEY, true);
