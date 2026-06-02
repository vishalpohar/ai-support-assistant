import chromadb
from sentence_transformers import SentenceTransformer

# Create Chroma client
client = chromadb.PersistentClient(path="./chroma_db")

# Collection
collection = client.get_or_create_collection(name="documents")

# Embedding model
embedding_model = None

def get_embedding_model():
    global embedding_model

    if embedding_model is None:
        embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    
    return embedding_model


def add_document(doc_id, text, session_id):
    if not text.strip():
        return
    
    embedding_model = get_embedding_model()

    chunks = chunk_text(text, chunk_size=500)

    ids = []
    embeddings = []
    documents = []
    metadatas = []

    for i, chunk in enumerate(chunks):
        chunk_id = f"{doc_id}_{i}"

        embedding = embedding_model.encode(chunk).tolist()

        ids.append(chunk_id)
        embeddings.append(embedding)
        documents.append(chunk)
        metadatas.append({"doc_id": doc_id, "session_id": session_id, "chunk_index": i})

    collection.add(
        ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas
    )

MAX_DISTANCE = 1.2

def search_document(query, session_id, doc_id=None):
    embedding_model = get_embedding_model()
    query_embedding = embedding_model.encode(query).tolist()

    if doc_id is not None:
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=5,
            where={"$and": [{"session_id": session_id}, {"doc_id": doc_id}]},
        )
    else:
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=5,
            where={"session_id": session_id},
        )

    if not results or "documents" not in results:
        return []

    docs = results["documents"][0]
    distances = results["distances"][0]

    formatted_docs = []

    for doc, dist in zip(docs, distances):
        if not doc:
            continue

        if dist > MAX_DISTANCE:
            continue

        formatted_docs.append(doc.strip())

    return formatted_docs


def chunk_text(text, chunk_size=200, overlap=50):
    """
    Splits text into word-based chunks.
    """
    words = text.split()
    chunks = []
    start = 0

    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks
