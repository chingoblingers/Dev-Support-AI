from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util

app = FastAPI()

model = SentenceTransformer("all-MiniLM-L6-v2")

class QuestionValidator(BaseModel):
    question: str

class SearchResponse(BaseModel):
    results: list[str]

class DiagnosticResponse(BaseModel):
    diagnostic: str

knowledge_chunks = [
    "Openai with Vercel AI Sdk is the default AI model and documentation used in Kenton's Projects",
    "If Typescript is showing an error for the return code. Try Hovering over function to see the returned result for more information",
    "If there is a line between a piece of code. Hover over to view VScode's notes on the matter. A function or method could be depreciated and needs to be updated."
]

stored_vectors = model.encode(knowledge_chunks, convert_to_tensor=True)

@app.post('/search', response_model=SearchResponse)
def question_similarities(question: QuestionValidator):
    question_embedding = model.encode(question.question, convert_to_tensor=True)
    two_best_matches = util.semantic_search(question_embedding, stored_vectors, top_k=2)
    ranked_strings:list[str] = []
    match_threshold = 0.5
    for match in two_best_matches[0]:
        if match['score'] >= match_threshold:
            match_index = match['corpus_id']
            ranked_strings.append(knowledge_chunks[match_index])
        
    return {'results': ranked_strings}
    

@app.post('/diagnostics', response_model=DiagnosticResponse)
def question_diagnostics(question: QuestionValidator):
    lowered_question = question.question.lower()
    if 'econnrefused' in lowered_question:
        return {'diagnostic': 'Try checking if the server is currently running or if the host and port are correct.'}
    elif 'timeout' in lowered_question:
        return {'diagnostic': "Check whether the server is responding slowly, hanging during a request, or is unreachable."}
    else:
        return {'diagnostic': 'No solution found for current queston.'}


