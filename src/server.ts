import express from 'express'
import {getUserAnswer} from 'src/index.ts'

const PORT = 3000
const app = express()


app.use(express.json())

app.post('/' , async (req, res) => {
    const question = req.body.question
    if (!question){
        return res.status(400).json({'message': "Please submit question in correct format"})
    }

    const answer = await getUserAnswer(question)
    res.status(200).json({answer})
    
})

app.listen(PORT, ()=> console.log(`running on Port:${PORT}`))