import torch
from transformers import AutoTokenizer, AutoModelForTokenClassification
import numpy as np

model_path = "./model"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForTokenClassification.from_pretrained(model_path)

label_list = model.config.id2label
id_to_label = {int(k): v for k, v in label_list.items()}

def predict_entities(text, max_length=128):
    tokens = text.split()
    encoding = tokenizer(
        tokens,
        is_split_into_words=True,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
        max_length=max_length
    )

    with torch.no_grad():
        outputs = model(**encoding)

    predictions = torch.argmax(outputs.logits, dim=2)[0].tolist()
    word_ids = encoding.word_ids()

    entities = []
    current = None

    for idx, word_idx in enumerate(word_ids):
        if word_idx is None:
            continue
        label = id_to_label[predictions[idx]]
        word = tokens[word_idx]

        if label.startswith("B-"):
            if current:
                entities.append(current)
            current = {"entity": label[2:], "word": word, "start": word_idx, "end": word_idx}
        elif label.startswith("I-") and current and label[2:] == current["entity"]:
            current["word"] += f" {word}"
            current["end"] = word_idx
        else:
            if current:
                entities.append(current)
                current = None

    if current:
        entities.append(current)

    return entities

def calculate_score(entities):
    weights = {
        "AADHAR": 0.9,
        "PAN": 0.8,
        "PHONE": 0.6,
        "BANK_ACCOUNT": 1.0,
        "IFSC": 0.7,
        "EMAIL": 0.5
    }
    score = sum(weights.get(e["entity"].upper(), 0.3) for e in entities)
    return round(min(score / len(entities or [1]), 1.0), 2)

def summarize(entities):
    summary = {}
    for e in entities:
        summary.setdefault(e["entity"], []).append(e["word"])
    return summary

