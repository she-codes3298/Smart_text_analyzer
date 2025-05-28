from fastapi import FastAPI, Request
from transformers import pipeline
from itertools import groupby
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI()

# Allow requests from your Chrome extension
app.add_middleware(
    CORSMiddleware,
    
    allow_origins=["chrome-extension:miaccgnogcdcjmklheldmaonldjkmebm"],
    
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define input schema
class AnalyzeRequest(BaseModel):
    text: str

class ProcessRequest(BaseModel):
    text: str
    entities: list
    action_type: str

# Load the NER model
model_path = "./model"  # ✅ Your model path
ner_pipeline = pipeline("ner", model=model_path, tokenizer=model_path, aggregation_strategy="simple")

# Entity merge and filter logic
def merge_entities(ner_results, score_threshold=0.76):
    merged = []
    for entity_type, group in groupby(ner_results, key=lambda x: x['entity_group']):
        tokens = list(group)
        word = ' '.join(t['word'].replace("##", "") for t in tokens)

        start = tokens[0]['start']
        end = tokens[-1]['end']
        score = sum(t['score'] for t in tokens) / len(tokens)

        if score >= score_threshold:
            merged.append({
                'entity': entity_type,
                'text': word,
                'start': start,
                'end': end,
                'score': round(score, 3)
            })
    return merged

# Analyze endpoint
@app.post("/analyze")
async def analyze_text(payload: AnalyzeRequest):
    text = payload.text

    # Run model and clean up entities
    raw_entities = ner_pipeline(text)
    clean_entities = merge_entities(raw_entities)

    # Return only entities (so extension's `data.forEach(...)` works)
    return {"entities": clean_entities}

# Note: We're not actually using this endpoint since we're doing the processing directly in the browser
# But I'm adding it for completeness in case you want to implement server-side processing in the future
