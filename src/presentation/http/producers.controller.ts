import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateProducerUseCase } from '../../application/use-cases-producer/create-producer.use-case';
import { DeleteProducerUseCase } from '../../application/use-cases-producer/delete-producer.use-case';
import { GetProducerUseCase } from '../../application/use-cases-producer/get-producer.use-case';
import { ListProducersUseCase } from '../../application/use-cases-producer/list-producers.use-case';
import { UpdateProducerUseCase } from '../../application/use-cases-producer/update-producer.use-case';
import { CreateProducerDto } from './dto/create-producer.dto';
import { UpdateProducerDto } from './dto/update-producer.dto';

@Controller('producers')
export class ProducersController {
  constructor(
    private readonly createProducer: CreateProducerUseCase,
    private readonly listProducers: ListProducersUseCase,
    private readonly getProducer: GetProducerUseCase,
    private readonly updateProducer: UpdateProducerUseCase,
    private readonly deleteProducer: DeleteProducerUseCase,
  ) {}

  @Post()
  create(@Body() body: CreateProducerDto) {
    return this.createProducer.execute(body);
  }

  @Get()
  async list(@Query('page') page?: string, @Query('limit') limit?: string) {
    const result = await this.listProducers.execute(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
    return {
      data: result.items,
      meta: { page: result.page, limit: result.limit, total: result.total },
    };
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.getProducer.execute(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateProducerDto,
  ) {
    return this.updateProducer.execute(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteProducer.execute(id);
  }
}
