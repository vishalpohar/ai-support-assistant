import chromadb
from sentence_transformers import SentenceTransformer

# Create Chroma client
client = chromadb.PersistentClient(path="./chroma_db")

# Collection
collection = client.get_or_create_collection(name="documents")

# Embedding model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


def add_document(doc_id, text, session_id):
    if not text.strip():
        return

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


def search_document(query):
    query_embedding = embedding_model.encode(query).tolist()

    results = collection.query(query_embeddings=[query_embedding], n_results=5)

    if not results or "documents" not in results:
        return []

    docs = results["documents"][0]
    distances = results["distances"][0]
    metadatas = results.get("metadatas", [[]])[0]

    formatted_docs = []

    for i, (doc, dist) in enumerate(zip(docs, distances)):
        if not doc:
            continue

        source = "Unknown"

        if i < len(metadatas) and metadatas[i]:
            source = metadatas[i].get("doc_id", "Unknown")

        formatted_docs.append(
            f"Source: {source} | Score: {round(dist, 3)}\n{doc.strip()}"
        )

    return formatted_docs


def chunk_text(text, chunk_size=500):
    """
    Splits text into word-based chunks.
    """
    words = text.split()
    return [
        " ".join(words[i : i + chunk_size]) for i in range(0, len(words), chunk_size)
    ]
