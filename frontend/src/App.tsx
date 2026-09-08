import { useState } from 'react'
import './App.css'

type ChatMessage = {"role": 'user' | 'assistant', 'message': string, 'sources'?: string[]}

const [userInput, setUserInput] = useState<string>('')
const [loading, setLoading] = useState<boolean>(false)
const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
const [error, setError] = useState<string>("")

function App() {

  return ('Hello')
}

export default App
