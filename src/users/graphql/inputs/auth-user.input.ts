import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class AuthUserInput {
    @Field(() => String)
    username: string

    @Field(() => String)
    password: string
}
