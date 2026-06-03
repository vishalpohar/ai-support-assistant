import chromadb
from sentence_transformers import SentenceTransformer

# Create Chroma client
client = chromadb.PersistentClient(path="./chroma_db")

# Collection
collection = client.get_or_create_collection(name="documents")

# Embedding model
embedding_model = None

MAX_DISTANCE = 1.2

CHUNK_SIZE = 500  # words per chunk
CHUNK_OVERLAP = 50  # words shared between consecutive chunks


def get_embedding_model():
    global embedding_model

    if embedding_model is None:
        embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

    return embedding_model


def add_document(doc_id: str, text: str, session_id: str) -> None:
    if not text.strip():
        return

    embedding_model = get_embedding_model()

    chunks = chunk_text(text)

    ids, embeddings, documents, metadatas = [], [], [], []

    for i, chunk in enumerate(chunks):
        ids.append(f"{doc_id}_{i}")
        embeddings.append(embedding_model.encode(chunk).tolist())
        documents.append(chunk)
        metadatas.append({"doc_id": doc_id, "session_id": session_id, "chunk_index": i})

    collection.add(
        ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas
    )


def search_document(
    query: str, session_id: str, doc_id: str = None, n_results: int = 5
) -> list[str]:
    try:
        embedding_model = get_embedding_model()
        query_embedding = embedding_model.encode(query).tolist()

        where_filter = (
            {"$and": [{"session_id": session_id}, {"doc_id": doc_id}]}
            if doc_id
            else {"session_id": session_id}
        )

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where_filter,
        )

        if not results or "documents" not in results:
            return []

        return [
            doc.strip()
            for doc, dist in zip(results["documents"][0], results["distances"][0])
            if doc and dist <= MAX_DISTANCE
        ]
    except Exception:
        return []


def chunk_text(text: str, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP) -> list[str]:
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
