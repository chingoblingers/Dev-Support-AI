import dotenv from 'dotenv'
import {generateText, Output} from 'ai'
import {openai} from '@ai-sdk/openai'
import {z} from 'zod'

dotenv.config()

const schema = z.object({
    "route": z.enum(['web', 'direct', 'knowledge_base' ]).describe(`
    Use 'web' when you need to search the internet for your answer.
    Use 'direct' when you can answer the user with your current knowledge.
    Use 'knowledge_base' when you need to look through the database.
        `),
    "reason": z.string().describe('Provide a brief reason on why the selected route was chosen over the others')

})

type RoutingSchema = z.infer<typeof schema>

async function routeUserQuestion(question: string):Promise<RoutingSchema>{
    try{
    const {output} = await generateText({
    model: openai('gpt-5.6-luna'),
    output: Output.object({schema}),
    prompt: `Categorize the users question into the most fitting route. Users Question:${question}`
    })
    return output

    }catch(error){
    console.error(error)
    throw error    
    }

}

async function getAnswerWithoutContext(question:string){
try{
    const {text} = await generateText({
        model: openai('gpt-5.6-luna'),
        prompt: `Answer the users question cleary. User Question: ${question}`
    })
    return text

}catch(error){
    console.error(error)
    throw error
}
}


async function getUserAnswer(question:string){
    try{
    const chosenUserRoute = await routeUserQuestion(question)    
    switch (chosenUserRoute.route){
        case 'direct':
            const answer = await getAnswerWithoutContext(question)
            return answer            
        case 'knowledge_base':
            console.log('searching knowledge Base')
            break
        case 'web':
            console.log('searching the web')
            break
}

    }catch(error){
        console.error(error)
        throw error
    }

}

const aiAnswer = await getUserAnswer("what is two plus two")
console.log(aiAnswer)