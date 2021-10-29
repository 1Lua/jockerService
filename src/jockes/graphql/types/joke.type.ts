import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType('Joke')
export class JokeType {
    @Field(() => String)
    text: string

    @Field(() => String)
    category: string
}
