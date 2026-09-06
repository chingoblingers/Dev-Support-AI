import dotenv from 'dotenv'
import {generateText, Output} from 'ai'
import {openai} from '@ai-sdk/openai'
import {z} from 'zod'
import { webSearch, webSearchPreview } from '@ai-sdk/openai/internal'

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
type AiResponse = {'answer': string, 'sources'?: string[]}

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

async function getAnswerWithoutContext(question:string):Promise<string>{
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


async function getUserAnswer(question:string):Promise<AiResponse>{
    try{
    const chosenUserRoute = await routeUserQuestion(question)
    console.log(chosenUserRoute)    
    switch (chosenUserRoute.route){
        case 'direct':
            const answer = await getAnswerWithoutContext(question)
            return {answer}            
        case 'knowledge_base':
            const knowledgeAnswer = await getKnowledgeBaseAnswer(question)
            return knowledgeAnswer
        case 'web':
            const webAnswer = await getWebAnswer(question)
            return webAnswer
}

    }catch(error){
        console.error(error)
        throw error
    }

}

async function getWebAnswer(question:string):Promise<AiResponse>{
    try{
        const {text, sources} = await generateText({
            model: openai.responses('gpt-5.6-luna'),
            tools: {webSearchPreview: openai.tools.webSearchPreview({})},
            prompt: `Answer the users question. Use the available web search tool when needed
            User Question:${question}. 
            `
        })
    const sourceStrings = sources.filter(source => source.sourceType === "url").map(source => source.url)

    if (sourceStrings.length === 0) {
    return { answer: text }
    }

    return {answer: text, sources: sourceStrings}

    }catch(error){
        console.error(error)
        throw error
    }
}

type PythonServerResponse = {results:string[]}

async function getKnowledgeBaseAnswer(question:string):Promise<AiResponse>{
    try{
    const response = await fetch('pythonServer/search', {'method': 'POST', 'headers': {'Content-Type':'application/json'}, "body": JSON.stringify({question})})
    const data: PythonServerResponse = await response.json()
    let context = ""
    for (let result of data.results){
        context += result + " "
    }
    const {text} = await generateText({
        model: openai('gpt-5.6-luna'),
        prompt: `Answer the users question. Use the provided context to construct your answer if it exisits. Question:${question}. Context:${context}`
    })

    return {answer:text}

    }catch(error){
        console.error(error)
        throw error
    }

}

const aiAnswer = await getUserAnswer("Was server.tool() depreciated in a recent update to the @modelContextProtocol sdk?")
console.log(aiAnswer)