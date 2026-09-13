import { useState } from 'react'
import './App.css'

type ChatMessage = {"role": 'user' | 'assistant', 'message': string, 'sources'?: string[]}

function App() {

const [userInput, setUserInput] = useState<string>('')
const [loading, setLoading] = useState<boolean>(false)
const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
const [error, setError] = useState<string>("")

async function handleSubmit(e:React.SubmitEvent<HTMLFormElement>){
  try{
  e.preventDefault()
  setError('')
  const trimmedInput = userInput.trim()
  if (!trimmedInput){
    return 
  }
  setChatHistory(prevHistory => [...prevHistory,{'role': 'user', 'message': trimmedInput} ])
  setLoading(true)
  setUserInput('')    
  const response = await fetch('http://localhost:3000/api/chat', {'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'body': JSON.stringify({question: trimmedInput})})
  if (!response.ok){
    throw new Error('Request failed')
  }
  const data = await response.json()
  setChatHistory(prevHistory => [...prevHistory, {'role': 'assistant', 'message': data.answer, 'sources': data.sources}])
  }catch(error){
    console.error(error)
    if (error instanceof Error){
    setError(error.message)
    }else{
      setError('Something went wrong')
    }
  }finally{
    setLoading(false)
  }

}

const messageDisplay = chatHistory.map((message, index) => {
  if (message.role ==='user'){
    return  <div className='user' key={index}>
              <p>{message.message}</p>
            </div>
  }
  if(message.sources){
  const sourceList  =  message.sources.map((source,index) => {
  const cutName = new URL(source).hostname.replace('www.', "")  
  return  <li> <a key={index} className='source' href={source}>{cutName}</a> </li>
})
  return  <div className='assistant sourcedMsg' key={index}> 
            <p>{message.message}</p> 
            <ul className='sourceList'>{sourceList}</ul>
          </div>
  }
  return  <div className='assistant' key={index}>
            <p>{message.message}</p>
          </div>
})

  return (
    <main className='app'>
      <header> 
          <div className='contentContainer'>
            <h1>Kenton's Dev Support AI </h1> 
            <p>Fast answers for your troubleshooting, debugging or dev needs!</p>
          </div>  
      </header>
      <section className='messageArea'>
        <div className='contentContainer messageContainer'> {messageDisplay} {error && <p className="error">{error}</p>}</div>
      </section>
      <section>
          <div className='contentContainer'>
            <form onSubmit={handleSubmit} className='questionForm'>
              <input type='text' id='userInput' placeholder='how do i install windows 11?' 
              name='userInput' value={userInput} onChange={(e)=> setUserInput(e.target.value)} aria-label='Enter your questions here'/>
              <button disabled={loading}>{loading ? "Thinking..." : "Submit"}</button>
            </form>
          </div>
      </section>
    </main>
  )
}

export default App
