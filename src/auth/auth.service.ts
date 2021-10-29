import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Algorithm, decode, JwtPayload, sign, SignOptions, verify } from 'jsonwebtoken'
import { UserEntity } from 'src/users/entities/user.entity'
import { AuthUserInput } from 'src/users/graphql/inputs/auth-user.input'
import { CreateUserInput } from 'src/users/graphql/inputs/create-user.input'
import { UsersService } from 'src/users/users.service'
import { AuthType } from './graphql/types/auth.type'

import * as fs from 'fs'
import {v4 as Uuidv4} from 'uuid'
import { InjectRepository } from '@nestjs/typeorm'
import { RefreshTokenEntity } from './entities/refresh-token.entity'
import { Repository } from 'typeorm'
import { randomBytes } from 'crypto'

const DEFAULT_TOKEN_TTL             = 3600
const DEFAULT_REFRESH_TOKEN_TTL     = 3600
const DEFAULT_REFRESH_TOKEN_LENGTH  = 64


@Injectable()
export class AuthService {
    private _logger = new Logger(AuthService.name)
    private readonly _tokenTTL  : number
    private readonly _jwtOption : SignOptions
    private readonly _alg       : Algorithm
    private readonly _tokenType : string
    private readonly _refreshTokenLength    : number
    private readonly _refreshTokenTTL       : number
    private readonly _jwtPrivateKey
    private readonly _jwtPublicKey

    constructor(
        @InjectRepository(RefreshTokenEntity)
        private readonly _refTokRepository  : Repository<RefreshTokenEntity>,
        private readonly _configService     : ConfigService,
        private readonly _usersService      : UsersService,
    ){
        this._tokenTTL  = this._configService.get<number>('TOKEN_TTL', DEFAULT_TOKEN_TTL)
        this._alg       = this._configService.get<Algorithm>('ALGORITHM', 'RS256')
        this._tokenType = this._configService.get<string>('TOKEN_TYPE', 'Bearer')
        this._refreshTokenLength    = this._configService.get<number>('REFRESH_TOKEN_LENGTH', DEFAULT_REFRESH_TOKEN_LENGTH)
        this._refreshTokenTTL       = this._configService.get<number>('REFRESH_TOKEN_TTL', DEFAULT_REFRESH_TOKEN_TTL)

        this._jwtOption = {
            algorithm: this._alg,
            expiresIn: Number(this._tokenTTL),
            keyid: 'main'
        }
        this._jwtPrivateKey = fs.readFileSync(`${process.cwd()}/assets/private.key`)
        this._jwtPublicKey  = fs.readFileSync(`${process.cwd()}/assets/public.key`)
    }

    async signUp(input: CreateUserInput): Promise<UserEntity> {
        return await this._usersService.createUser(input)
    }

    async signIn(input: AuthUserInput): Promise<AuthType> {
        let user = await this._usersService.login(input)
        
        if(!user){
            throw new Error('Auth Failed')
        }

        let payload: JwtPayload = {
            sub: String(user.id)
        }

        return await this.createJWT(payload)
    }

    async createJWT(payload: JwtPayload): Promise<AuthType>{
        let jwt = await this.createToken(payload)
        jwt.refreshToken = await this.createRefreshToken(Number(payload.sub));
        return jwt
    }

    async createToken(payload: JwtPayload): Promise<AuthType>{

        let expires = this._tokenTTL
        let options = this._jwtOption
        options.jwtid = Uuidv4()

        let token   = sign(payload, this._jwtPrivateKey, options) 
        return {
            token,
            expiresIn: expires,
            type: this._tokenType
        } as AuthType
    }

    async createRefreshToken(userId: number): Promise<string>{
        let refreshToken = randomBytes(Number(this._refreshTokenLength)).toString('hex')
        let token = {
            userId,
            token: refreshToken,
            expiresAt: Date.now() + this._refreshTokenTTL*1000
        } as RefreshTokenEntity

        let newRefreshToken = await this._refTokRepository.create(token)
        await this._refTokRepository.save(newRefreshToken)

        return newRefreshToken.token
    }

    async getTokenByRefreshToken(refreshToken: string, oldToken: string): Promise<AuthType>{
        let token = await this._refTokRepository.findOne({token: refreshToken})
        
        if(token == undefined){
            throw new Error('Refresh token not found')
        }
        if(token.expiresAt < Date.now()){
            throw new Error('Refresh token expired')
        }

        let oldPayload = await this.decodeToken(oldToken)

        if(oldPayload == undefined){
            throw new Error('Old token is invalid')
        }

        let {sub} = oldPayload
        let payload: JwtPayload = {
            sub,
        }

        let newToken = await this.createJWT(payload)
        
        await this._refTokRepository.delete({id: token.id})
        return newToken
    }

    async verifyToken(token: string): Promise<{isVerified: boolean}>{
        try{
            verify(token, this._jwtPublicKey, {algorithms: [this._alg]})
            return {
                isVerified: true
            }
        }catch(error){
            this._logger.error(error)
            this._logger.warn(token)
            return {
                isVerified: false
            }
        }
    }

    async decodeToken(token: string): Promise<JwtPayload | undefined>{
        let response = await this.verifyToken(token)
        if(response.isVerified){
            let parsedToken:JwtPayload = decode(token, {json: true})!
            return parsedToken
        }
        return undefined
    }
}
