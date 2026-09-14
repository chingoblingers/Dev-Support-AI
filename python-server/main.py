from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


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


@app.post('/search', response_model=SearchResponse)
def question_similarities(question: QuestionValidator):
    question_words = set(question.question.lower().split())

    ranked_matches = []

    for chunk in knowledge_chunks:
        chunk_words = set(chunk.lower().split())
        score = len(question_words.intersection(chunk_words))

        if score > 0:
            ranked_matches.append((score, chunk))

    ranked_matches.sort(reverse=True)

    results = [chunk for score, chunk in ranked_matches[:2]]

    return {'results': results}
    

@app.post('/diagnostics', response_model=DiagnosticResponse)
def question_diagnostics(question: QuestionValidator):
    lowered_question = question.question.lower()
    if 'econnrefused' in lowered_question:
        return {'diagnostic': 'Try checking if the server is currently running or if the host and port are correct.'}
    elif 'timeout' in lowered_question:
        return {'diagnostic': "Check whether the server is responding slowly, hanging during a request, or is unreachable."}
    else:
        return {'diagnostic': 'No solution found for current queston.'}


