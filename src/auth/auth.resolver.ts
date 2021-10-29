import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { AuthUserInput } from 'src/users/graphql/inputs/auth-user.input'
import { CreateUserInput } from 'src/users/graphql/inputs/create-user.input'
import { UserType } from 'src/users/graphql/types/user.type'
import { AuthService } from './auth.service'
import { UpdateTokenInput } from './graphql/inputs/update-token.input'
import { AuthType } from './graphql/types/auth.type'

@Resolver(() => String)
export class AuthResolver {
    constructor(private readonly _authService: AuthService) {}

    @Mutation(() => UserType, {
        description: '[Dictionary] Allows registring users'
    })
    async signUp(@Args('input') input: CreateUserInput): Promise<UserType> {
        return await this._authService.signUp(input)
    }

    @Mutation(() => AuthType, {
        description: '[Dictionary] Allows users to be authenticated '
    })
    async signIn(@Args('input') input: AuthUserInput): Promise<AuthType> {
        return await this._authService.signIn(input)
    }

    @Mutation(()=> AuthType, {
        description: '[Dictionary] Allows users to update the token'
    })
    async updateToken(@Args('input') input: UpdateTokenInput): Promise<AuthType>{
        return await this._authService.getTokenByRefreshToken(input.refreshToken, input.token)
    }
}
