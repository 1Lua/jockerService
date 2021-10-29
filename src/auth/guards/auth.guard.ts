import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthService } from '../auth.service'

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly _authService: AuthService,
    ){}    
    async canActivate(context: ExecutionContext): Promise<boolean> {
        let ctx = GqlExecutionContext.create(context)
        let req: Request | any = ctx.getContext().req
        
        let authorization: string | undefined = req.headers.authorization
        if(authorization == undefined){
            throw new BadRequestException('GqlAuthorizationHeader: header authorization is empty')
        }
        
        let verified = await this._authService.decodeToken(authorization)
        return !!verified
    }
}
