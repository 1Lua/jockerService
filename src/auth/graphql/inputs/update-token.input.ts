import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateTokenInput{
    @Field(()=>String)
    refreshToken: string;

    @Field(()=>String)
    token: string;
}