import { McpServer } from "@modelcontextprotocol/server"
import { serveStdio } from "@modelcontextprotocol/server/stdio"
import * as z from "zod/v4"

serveStdio(() => {
    const server = new McpServer({
        name: "dev support tools",
        version: "1.0"
    })

server.registerTool(
    'checkRuntimeCompatibility',
    {
        description: 'A function for checking if a runtime is compatible with other packages/runtimes',
        inputSchema: z.object({
            'packageName' : z.string().describe('name of the package the user would like the results for'),
            'packageVersion' : z.string().describe('version of the packageName variable'),
            'runtimeVersion': z.string().describe('name and version of the package being compared against.')
        })
        
    },
    async({ packageName, packageVersion, runtimeVersion })=> {

        const response = await fetch(`https://registry.npmjs.org/${packageName}/${packageVersion}`)
        const data = await response.json()
        if (!data.engines?.node ){ 
            return { content: [ { type: "text", text: "This package does not declare a required Node version." } ] } 
        }

        return {"content":[{'type': 'text', 'text': `Package ${packageName}@${packageVersion} declares Node requirement: ${data.engines.node}. Requested runtime: ${runtimeVersion}`}]}
    }
)
return server
})