import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AuthType{
    @Field(()=> Int)
    expiresIn: number;

    @Field(()=>String)
    token: string;

    @Field(()=>String)
    refreshToken: string;

    @Field(()=>String, {defaultValue: "Bearer"})
    type: string;
}