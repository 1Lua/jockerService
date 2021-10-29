import { UseGuards } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { AuthGuard } from 'src/auth/guards/auth.guard'
import { JokeInput } from './graphql/inputs/joke.input'
import { JokeType } from './graphql/types/joke.type'
import { JockesService } from './jockes.service'

@Resolver(() => String)
export class JokeResolver {
    constructor(private readonly _jokesService: JockesService) {}

    @UseGuards(AuthGuard)
    @Query(() => JokeType,{
        description: '[Dictionary] Allows users to get the jokes'
    })
    async joke(@Args('input') input: JokeInput): Promise<JokeType> {
        return this._jokesService.getJoke(input)
    }
}
