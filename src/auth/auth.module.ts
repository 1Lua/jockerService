import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from 'src/users/users.module'
import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { RefreshTokenEntity } from './entities/refresh-token.entity'
import { AuthGuard } from './guards/auth.guard'

@Module({
    imports: [
        TypeOrmModule.forFeature([RefreshTokenEntity]),
        ConfigService,
        UsersModule
    ],
    providers: [
        AuthService,
        AuthResolver,
        AuthGuard,
    ],
    exports: [
        AuthService,
    ],
})
export class AuthModule {}
