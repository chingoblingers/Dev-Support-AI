import dotenv from 'dotenv'
import {generateText, Output} from 'ai'
import {openai} from '@ai-sdk/openai'
import {z} from 'zod'
import { Client } from "@modelcontextprotocol/client"
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio"

dotenv.config()
const mcpClient = new Client({
    name: "dev-support-ai-client",
    version: "1.0.0"
})

const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "src/mcpServer.ts"]
})

await mcpClient.connect(transport)

const mcpSchema = z.object({
    "toolName": z.literal("checkRuntimeCompatibility"),
    "packageName": z.string().describe('name of the package the results are needed for.'),
    "packageVersion": z.string().describe('version of the package.'),
    "runtimeVersion": z.string().describe('runtime version being used for comparison')
})

const schema = z.object({
    "route": z.enum(['web', 'direct', 'knowledge_base', 'diagnostics', 'tool']).describe(`
    Use 'web' when you need to search the internet for your answer.
    Use 'direct' when you can answer the user with your current knowledge.
    Use 'knowledge_base' when you need information on the creator of this project, their business, buissness rules, or anything with a focus on the creator.
    Use 'diagnostics' when the user is having issues with executing their code (run time errors, connection failures, startup issues for example).
    Use 'tool' when the user is asking for a supported structured developer utility, such as checking runtime, package, or version compatibility.    
        `),
    "reason": z.string().describe('Provide a brief reason on why the selected route was chosen over the others')

})

type RoutingSchema = z.infer<typeof schema>
type AiResponse = {'answer': string, 'sources'?: string[]}
type DiagnosticResponse = {diagnostic: string}

async function runMcpTool(question: string):Promise<AiResponse>{
try{
    const {output} = await generateText({
        model: openai("gpt-5.6-luna"),
        output: Output.object({schema: mcpSchema}),
        prompt: `Use the best tool for answering the users question ${question}`
    })

    const toolResult = await mcpClient.callTool({
        name: output.toolName,
        arguments: {
        packageName: output.packageName,
        packageVersion: output.packageVersion,
        runtimeVersion: output.runtimeVersion
  }
})
const firstContent = toolResult.content[0]

if (firstContent?.type === "text") {
  return { answer: firstContent.text }
}
throw new Error("MCP tool did not return text content")
}catch(error){
console.error(error)
throw error

}

}

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


export async function getUserAnswer(question:string):Promise<AiResponse>{
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
        case 'diagnostics':
            const diagnosticAnswer = await runDiagnostics(question)
            return diagnosticAnswer
        case 'tool':
            return await runMcpTool(question)
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
    const response = await fetch('http://127.0.0.1:8000/search', {'method': 'POST', 'headers': {'Content-Type':'application/json'}, "body": JSON.stringify({question})})
    const data: PythonServerResponse = await response.json()
    const context = data.results.join("\n\n")
    const {text} = await generateText({
        model: openai('gpt-5.6-luna'),
        prompt: `Answer the user's question using only the provided context.
        If the context does not contain enough information to answer confidently, say that the knowledge base does not contain enough information.
        Question: ${question}   Context:${context}`
    })

    return {answer:text}

    }catch(error){
        console.error(error)
        throw error
    }

}

async function runDiagnostics(question:string):Promise<AiResponse>{
    try{
        const response = await fetch('http://127.0.0.1:8000/diagnostics', {'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'body': JSON.stringify({question})})
        const data:DiagnosticResponse = await response.json()
        const diagnosticData = data.diagnostic
        return {'answer': diagnosticData}
    }catch(error){
        console.error(error)
        throw error
    }
}



const aiAnswer = await getUserAnswer("Can you check the runtime compatibility of express 5.1.0, if I'm using Node 20?")
console.log(aiAnswer)