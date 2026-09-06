from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util

app = FastAPI()

model = SentenceTransformer("all-MiniLM-L6-v2")

class QuestionValidator(BaseModel):
    question: str  

knowledge_chunks = [
    "Openai with Vercel AI Sdk is the default AI model and documentation used in Kenton's Projects",
    "If Typescript is showing an error for the return code. Try Hovering over function to see the returned result for more information",
    "If there is a line between a piece of code. Hover over to view VScode's notes on the matter. A function or method could be depreciated and needs to be updated."
]

stored_vectors = model.encode(knowledge_chunks, convert_to_tensor=True)

@app.post('/search')
def question_Similarities(question: QuestionValidator):
    question_embedding = model.encode(question.question, convert_to_tensor=True)
    two_best_matches = util.semantic_search(question_embedding, stored_vectors, top_k=2)
