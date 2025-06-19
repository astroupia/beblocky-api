import { Module } from '@nestjs/common';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';

@Module({
    imports: [CloudinaryModule],
    controllers: [CloudinaryController],
    providers: [CloudinaryService],
})
export class CloudinaryModule {

}
