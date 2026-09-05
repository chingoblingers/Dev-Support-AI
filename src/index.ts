import dotenv from 'dotenv'
import {generateText, Output} from 'ai'
import {openai} from '@ai-sdk/openai'
import {z} from 'zod'

dotenv.config()

const schema = z.object({
    "route": z.enum(['web', 'direct', 'knowledge_base' ]).describe(`
    Use 'web' when you need to search the internet for your answer.
    Use 'direct' when you can answer the user with your current knowledge.
    Use 'data_base' when you need to look through the database.
        `),
    "reason": z.string().describe('Provide a brief reason on why the selected route was chosen over the others')

})

type RoutingSchema = z.infer<typeof schema>

async function routeUserQuestion(question: string):Promise<RoutingSchema>{
const {output} = await generateText({
    model: openai('gpt-5.6-luna'),
    output: Output.object({schema}),
    prompt: `Categorize the users question into the most fitting route. Users Question:${question}`
})
return output
}