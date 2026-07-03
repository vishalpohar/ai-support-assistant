import re

from core.constants import GENERAL_QUERY_PATTERNS


def is_general_conversational_query(message: str) -> bool:
    lowered = message.lower().strip()
    return any(re.search(pattern, lowered) for pattern in GENERAL_QUERY_PATTERNS)
