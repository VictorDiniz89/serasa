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
  } from '@nestjs/common';
  import { CreateFarmUseCase } from '../../application/use-cases-farm/create-farm.use-case';
  import { DeleteFarmUseCase } from '../../application/use-cases-farm/delete-farm.use-case';
  import { GetFarmUseCase } from '../../application/use-cases-farm/get-farm.use-case';
  import { UpdateFarmUseCase } from '../../application/use-cases-farm/update-farm.use-case';
  import { CreateFarmDto } from './dto/create-farm.dto';
  import { UpdateFarmDto } from './dto/update-farm.dto';
  
  @Controller()
  export class FarmsController {
    constructor(
      private readonly createFarm: CreateFarmUseCase,
      private readonly getFarm: GetFarmUseCase,
      private readonly updateFarm: UpdateFarmUseCase,
      private readonly deleteFarm: DeleteFarmUseCase,
    ) {}
  
    @Post('producers/:producerId/farms')
    create(
      @Param('producerId', ParseUUIDPipe) producerId: string,
      @Body() body: CreateFarmDto,
    ) {
      return this.createFarm.execute(producerId, body);
    }
  
    @Get('farms/:id')
    get(@Param('id', ParseUUIDPipe) id: string) {
      return this.getFarm.execute(id);
    }
  
    @Patch('farms/:id')
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() body: UpdateFarmDto,
    ) {
      return this.updateFarm.execute(id, body);
    }
  
    @Delete('farms/:id')
    @HttpCode(204)
    delete(@Param('id', ParseUUIDPipe) id: string) {
      return this.deleteFarm.execute(id);
    }
  }