import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParentController } from './controllers/parent.controller';
import { ParentService } from './services/parent.service';
import { ParentRepository } from './repositories/parent.repository';
import { ParentSchema } from './entities/parent.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Parent', schema: ParentSchema }]),
  ],
  controllers: [ParentController],
  providers: [ParentService, ParentRepository],
  exports: [ParentService],
})
export class ParentModule {}
