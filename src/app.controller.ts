import { Controller, Get } from '@nestjs/common';
import { Public } from './core/decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Application')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Returns a simple message to verify the API is running',
  })
  @ApiResponse({ status: 200, description: 'API is running', type: String })
  test() {
    return 'Hello World!';
  }
}
