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

knowledge_chunks = [
    "Openai with Vercel AI Sdk is the default AI model and documentation used in Kenton's Projects",
    "If Typescript is showing an error for the return code. Try Hovering over function to see the returned result for more information",
    "If there is a line between a piece of code. Hover over to view VScode's notes on the matter. A function or method could be depreciated and needs to be updated."
                    ]

stored_chunks = [{'content': chunk , 'embedding': embed_question(chunk)} for chunk in knowledge_chunks]
