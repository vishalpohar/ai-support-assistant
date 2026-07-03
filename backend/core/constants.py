ALLOWED_EXTENSIONS = [".pdf"]

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

MAX_PAGES = 100

SUMMARY_N_RESULTS = 10

CONVERSATION_HISTORY_LIMIT = 6

SUMMARY_KEYWORDS = [
    "summary",
    "summarize",
    "what is this document",
    "what does this document",
    "explain this document",
    "overview",
]

GENERAL_QUERY_PATTERNS = [
    r"^hi\b",
    r"^hello\b",
    r"^hey\b",
    r"^howdy\b",
    r"^what can you do",
    r"^what are you capable",
    r"^what are you\b",
    r"^who are you\b",
    r"^help$",
    r"^help me$",
    r"^good (morning|afternoon|evening|night)",
    r"^how are you",
    r"^how's it going",
    r"^thanks?\b",
    r"^thank you",
    r"^bye\b",
    r"^goodbye\b",
]
