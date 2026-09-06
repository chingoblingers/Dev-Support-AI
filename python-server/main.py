from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer


app = FastAPI()
model = SentenceTransformer("all-MiniLM-L6-v2") 

class QuestionValidator(BaseModel):
    question: str  

@app.post('/search')
def questionSimilarities(question: QuestionValidator):
    embeddings = embed_question(question.question)
    

def embed_question(question:str)-> list[float]:
    embedding = model.encode(question)
    return embedding.tolist()
