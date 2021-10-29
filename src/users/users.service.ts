import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from './entities/user.entity'
import { AuthUserInput } from './graphql/inputs/auth-user.input'
import { CreateUserInput } from './graphql/inputs/create-user.input'

import * as bcrypt from 'bcryptjs'

const MIN_PASSWORD_LENGTH = 6

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly _usersRepository: Repository<UserEntity>,
    ) {}

    async hashPassword(password: string): Promise<string> {
        const ROUND = 12
        let salt = await bcrypt.genSalt(ROUND)
        let hashedPassword = await bcrypt.hash(password, salt)
        return hashedPassword
    }

    async checkEmailAvailability(email: string): Promise<boolean>{
        let user = await this._usersRepository.findOne({email})
        return !user
    }

    async checkUserNameAvailability(username: string): Promise<boolean>{
        let user = await this._usersRepository.findOne({username})
        return !user
    }

    checkPassword(password: string): boolean{
        if(password.length < MIN_PASSWORD_LENGTH){
            return false
        }
        return true
    }

    async createUser(input: CreateUserInput): Promise<UserEntity> {
        let { email, username, password } = input

        let checkEmail = await this.checkEmailAvailability(email)
        if(!checkEmail){
            throw new Error('Email is unaviable')
        }
        let checkPass = this.checkPassword(password)
        if(!checkPass){
            throw new Error(`Minimal password length: ${MIN_PASSWORD_LENGTH}`)
        }
        let checkUsername = await this.checkUserNameAvailability(username)
        if(!checkUsername){
            throw new Error('Username is unaviable')
        }

        let user = this._usersRepository.create({
            email,
            username,
            password: await this.hashPassword(password),
        })
        return await this._usersRepository.save(user)
    }

    async login(input: AuthUserInput): Promise<UserEntity> {
        let {username, password} = input
        let user = await this._usersRepository.findOne({username})

        if(!user){
            throw new Error('User not found')
        }

        let passwordMatch = await bcrypt.compare(password, user.password)

        if(!passwordMatch){
            throw new Error('Invalid password')
        }

        return user
    }
}
