import * as https from 'https'
import { JokeInput } from './graphql/inputs/joke.input'
import { JokeType } from './graphql/types/joke.type'

class Jocker {
    /**
     * This returns random joke
     * @returns Promise<string>
     */
    static getJoke(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let data: string = ''
            https.get('https://v2.jokeapi.dev/joke/Any?format=txt', (res) => {
                res.on('data', (chunk) => {
                    data += chunk
                })

                res.on('end', () => {
                    resolve(data)
                })

                res.on('error', () => {
                    reject('Не удалось получить шутку ;(')
                })
            })
        })
    }

    /**
     * This returns categories of joke
     * @returns Promise<Array<string>>
     */
    static getJokeCategories(): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            let data: string = ''

            https.get('https://v2.jokeapi.dev/categories', (res) => {
                res.on('data', (chunk) => {
                    data += chunk
                })

                res.on('end', () => {
                    try {
                        let categories: Array<string> =
                            JSON.parse(data).categories
                        resolve(categories)
                    } catch (err) {
                        reject('Не удалось получить категории шуток..')
                    }
                })

                res.on('error', () => {
                    reject('Не удалось получить категории шуток..')
                })
            })
        })
    }

    /**
     * This returns random joke by categiry
     *
     * @param category
     * @returns Promise<string>
     */

    static getJokeByCategory(category: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let data: string = ''

            https.get(
                `https://v2.jokeapi.dev/joke/${category}?format=txt`,
                (res) => {
                    res.on('data', (chunk) => {
                        data += chunk
                    })

                    res.on('end', () => {
                        if (!data.match('No matching joke found')) {
                            resolve(data)
                        } else {
                            reject('incorrect_category')
                        }
                    })

                    res.on('error', () => {
                        reject('Не удалось получить шутку ;(')
                    })
                },
            )
        })
    }
}

export class JockesService {
    async getJoke(input: JokeInput): Promise<JokeType> {
        return {
            text: await Jocker.getJokeByCategory(input.category || 'Any'),
            category: input.category || 'Any',
        }
    }
}
