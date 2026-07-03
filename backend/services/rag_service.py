from core.constants import SUMMARY_KEYWORDS, SUMMARY_N_RESULTS
from utils.validators import is_general_conversational_query
from vector_store import search_document

def retrieve_context(user_message: str, conversation: str, session_id: str, file_text: str = "", doc_id: str | None = None) -> str:
    """
    Retrieve relevant context from the vector store based on the message and session ID.
    """

    new_file_uploaded = bool(file_text.strip())

    skip_retrieval = (
        is_general_conversational_query(user_message) and not new_file_uploaded
    )

    if skip_retrieval:
        return ""
    
    retrieval_query = f"""
    Conversation:
    {conversation}

    Current Question:
    {user_message}
    """
    is_summary_request = any(
        keyword in user_message.lower() for keyword in SUMMARY_KEYWORDS
    )

    if is_summary_request and new_file_uploaded:
        return file_text[:6000]
    
    if new_file_uploaded:
        relevant_docs = search_document(retrieval_query, session_id, doc_id)
        return "\n\n".join(relevant_docs[:3])
    
    if is_summary_request:
        relevant_docs = search_document(
            retrieval_query, session_id, n_results=SUMMARY_N_RESULTS
        )
        return "\n\n".join(relevant_docs)
    
    relevant_docs = search_document(retrieval_query, session_id)
    return "\n\n".join(relevant_docs[:3])