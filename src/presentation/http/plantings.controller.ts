import {
    Body,
    Controller,
    Delete,
    HttpCode,
    Param,
    ParseUUIDPipe,
    Post,
  } from '@nestjs/common';
  import { CreatePlantingUseCase } from '../../application/use-cases-planting/create-planting.use-case';
  import { DeletePlantingUseCase } from '../../application/use-cases-planting/delete-planting.use-case';
  import { CreatePlantingDto } from './dto/create-planting.dto';
  
  @Controller()
  export class PlantingsController {
    constructor(
      private readonly createPlanting: CreatePlantingUseCase,
      private readonly deletePlanting: DeletePlantingUseCase,
    ) {}
  
    @Post('farms/:farmId/plantings')
    create(
      @Param('farmId', ParseUUIDPipe) farmId: string,
      @Body() body: CreatePlantingDto,
    ) {
      return this.createPlanting.execute(farmId, body);
    }
  
    @Delete('plantings/:id')
    @HttpCode(204)
    delete(@Param('id', ParseUUIDPipe) id: string) {
      return this.deletePlanting.execute(id);
    }
  }