import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType('User')
export class UserType {
    @Field(() => Int)
    id: number

    @Field(() => String)
    email: string

    @Field(() => String)
    username: string
}
