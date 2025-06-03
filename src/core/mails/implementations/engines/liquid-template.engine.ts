import { Injectable } from '@nestjs/common';
import { Liquid } from 'liquidjs';
import { IMailsTemplateEngine } from '../../interfaces/mails-template.engine.interface';
import { InternalServerErrorException } from '../../../exceptions';

@Injectable()
export class LiquidTemplateEngine implements IMailsTemplateEngine {
  private readonly engine: Liquid;
  constructor() {
    this.engine = new Liquid({
      strictVariables: true,
      strictFilters: true,
      cache: true,
    });
  }
  async render(template: string, data: Record<string, any>): Promise<string> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await this.engine.parseAndRender(template, data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Template rendering failed: ${errorMessage}`,
      );
    }
  }
  async renderSubject(
    template: string,
    data: Record<string, any>,
  ): Promise<string> {
    return this.render(template, data);
  }
}
