import { useState, type JSX, type JSXElementConstructor } from 'react'
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
    return <p className='user' key={index}>{message.message}</p>
  }
  if(message.sources){
  const sourceList  =  message.sources.map((source,index) => <a key={index} className='source' href={source}>{source}</a>)
  return <div className='sourcedMsg' key={index}> <p className='assistant'>{message.message}</p> {sourceList} </div>
  }
  return <p className='assistant' key={index}>{message.message}</p>
})

  return (
    <main>
    <header> Ken's Dev Support AI </header>
    <section className='messageArea'>
    {messageDisplay}  
    </section>
    <form onSubmit={handleSubmit} className='questionForm'>
    <label htmlFor='userInput'>Ask me for support!</label>  
    <input type='text' id='userInput' placeholder='how do i install windows 11?' name='userInput' value={userInput} onChange={(e)=> setUserInput(e.target.value)}/>
    <button>Submit</button>
    </form>
    </main>
  )
}

export default App
