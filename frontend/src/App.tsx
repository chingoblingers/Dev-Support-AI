import { useState } from 'react'
import './App.css'

type ChatMessage = {"role": 'user' | 'assistant', 'message': string, 'sources'?: string[]}

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

function App() {

  return ('Hello')
}

export default App
