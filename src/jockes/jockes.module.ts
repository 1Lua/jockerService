import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { JockesService } from './jockes.service'
import { JokeResolver } from './joke.resolver'

@Module({
    imports: [AuthModule],
    providers: [JockesService, JokeResolver],
    exports: [JockesService],
})
export class JockesModule {}
