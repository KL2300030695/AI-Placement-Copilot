import numpy as np
import logging
import re
import os

logger = logging.getLogger("PlacementCopilot.nlp")

class NLPEngine:
    def __init__(self):
        self.model = None
        self.tfidf_vectorizer = None
        
        # Check if transformer model is explicitly requested in env
        # By default, use local TF-IDF vectorizer (instant startup, offline friendly)
        self.use_transformers = os.getenv("USE_TRANSFORMERS", "false").lower() == "true"
        
        self._setup_tfidf()
        
        if self.use_transformers:
            self._load_transformers()

    def _setup_tfidf(self):
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            self.tfidf_vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
            logger.info("TF-IDF Vectorizer initialized successfully (Offline Match Engine).")
        except Exception as e:
            logger.critical(f"Failed to load sklearn TfidfVectorizer: {e}. Similarities will default to keyword overlap.")

    def _load_transformers(self):
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading SentenceTransformer ('all-MiniLM-L6-v2') in background...")
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("SentenceTransformer loaded successfully.")
        except Exception as e:
            logger.warning(
                f"Failed to load SentenceTransformer ({e}). Using TF-IDF engine."
            )
            self.model = None

    def calculate_similarity(self, text1: str, text2: str) -> float:
        """
        Calculates semantic similarity between two texts.
        Returns a score between 0.0 (completely different) and 1.0 (identical/highly relevant).
        """
        if not text1 or not text2:
            return 0.0

        # Try SentenceTransformer embedding cosine similarity if loaded
        if self.model:
            try:
                embeddings = self.model.encode([text1, text2])
                vec1 = embeddings[0] / np.linalg.norm(embeddings[0])
                vec2 = embeddings[1] / np.linalg.norm(embeddings[1])
                similarity = float(np.dot(vec1, vec2))
                # Normalize cosine similarity [-1, 1] to [0, 1]
                return max(0.0, min(1.0, (similarity + 1) / 2))
            except Exception as e:
                logger.error(f"Error during SentenceTransformer match: {e}. Falling back to TF-IDF.")
        
        # Try TF-IDF cosine similarity
        if self.tfidf_vectorizer:
            try:
                from sklearn.metrics.pairwise import cosine_similarity
                # Fit transform both texts
                tfidf_matrix = self.tfidf_vectorizer.fit_transform([text1, text2])
                similarity = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
                return similarity
            except Exception as e:
                logger.error(f"Error during TF-IDF match: {e}. Falling back to keyword overlap.")

        # Final fallback: Simple keyword overlap Jaccard similarity
        words1 = set(re.findall(r'\w+', text1.lower()))
        words2 = set(re.findall(r'\w+', text2.lower()))
        if not words1 or not words2:
            return 0.0
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        return len(intersection) / len(union)

# Single instance
nlp_engine = NLPEngine()
