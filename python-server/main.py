from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class QuestionValidator(BaseModel):
    question: str

@app.post('/search')
def questionSimilarities(question: QuestionValidator):
    return question
