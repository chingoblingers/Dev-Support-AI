import {generateText, Output} from 'ai'
import {openai} from '@ai-sdk/openai'
import {z} from 'zod'

const schema = z.object({
    "route": z.enum(['web', 'direct', 'knowledge_base' ]).describe(`
    Use 'web' when you need to search the internet for your answer.
    Use 'direct' when you can answer the user with your current knowledge.
    Use 'data_base' when you need to look through the database.
        `),
    "reason": z.string().describe('Provide a brief reason on why the selected route was chosen over the others')

})

type RoutingSchema = z.infer<typeof schema>