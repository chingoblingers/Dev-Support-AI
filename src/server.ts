import express from 'express'
import { getUserAnswer } from './index.js'
import cors from 'cors'

const PORT = 3000
const app = express()

app.use(cors())
app.use(express.json())

app.post('/api/chat' , async (req, res) => {
    const question = req.body.question
    if (!question){
        return res.status(400).json({'message': "Please submit question in correct format"})
    }

    const answer = await getUserAnswer(question)
    res.status(200).json(answer)
    
})

app.listen(PORT, ()=> console.log(`running on Port:${PORT}`))