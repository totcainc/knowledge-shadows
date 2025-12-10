"""
AI analysis service using Google Gemini for content analysis
"""
import json
import logging
from typing import List, Dict, Any
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)


CHAPTER_EXTRACTION_PROMPT = """You are analyzing a transcript of an expert walkthrough or demonstration.
Your task is to identify logical chapters/sections in the content.

Transcript:
{transcript}

Please identify 3-8 logical chapters from this transcript. For each chapter, provide:
1. A concise title
2. The approximate start time in seconds
3. The approximate end time in seconds
4. A brief summary (1-2 sentences)

Return your response as JSON in exactly this format (no markdown, just raw JSON):
{{
  "chapters": [
    {{
      "title": "Chapter title",
      "start_seconds": 0,
      "end_seconds": 120,
      "summary": "Brief description of what's covered"
    }}
  ]
}}

Important: Make sure timestamps don't overlap and chapters cover the entire content.
"""

DECISION_POINT_PROMPT = """You are analyzing a transcript of an expert walkthrough or demonstration.
Your task is to identify key decision points - moments where the expert makes choices, explains reasoning, or considers alternatives.

Transcript:
{transcript}

Please identify 2-5 key decision points from this transcript. For each decision point, provide:
1. The timestamp in seconds (approximate based on position in text)
2. A description of the decision being made
3. The reasoning behind the decision
4. Any alternatives that were considered or mentioned
5. Context about what was happening before this decision
6. A confidence score from 0.0 to 1.0 indicating how clearly this is a decision point

Return your response as JSON in exactly this format (no markdown, just raw JSON):
{{
  "decision_points": [
    {{
      "timestamp_seconds": 120,
      "decision_description": "What decision was made",
      "reasoning": "Why this decision was made",
      "alternatives_considered": ["Alternative 1", "Alternative 2"],
      "context_before": "What was happening before",
      "confidence_score": 0.85
    }}
  ]
}}

Focus on decisions that teach valuable lessons or demonstrate expert reasoning.
"""

SUMMARY_PROMPT = """You are analyzing a transcript of an expert walkthrough or demonstration.
Your task is to create a concise executive summary and key takeaways.

Transcript:
{transcript}

Please provide:
1. An executive summary (2-3 paragraphs) explaining what this walkthrough covers
2. 4-6 key takeaways that viewers should remember
3. A quality score from 0-100 based on:
   - Clarity of explanations
   - Depth of content
   - Educational value
   - Practical applicability

Return your response as JSON in exactly this format (no markdown, just raw JSON):
{{
  "executive_summary": "Multi-paragraph summary here...",
  "key_takeaways": [
    "First key insight",
    "Second key insight"
  ],
  "quality_score": 85
}}
"""


class GeminiAnalysisError(Exception):
    """Custom exception for Gemini analysis errors"""
    pass


class AnalysisService:
    def __init__(self):
        if not settings.gemini_api_key:
            raise ValueError("Gemini API key not configured. Set GEMINI_API_KEY in .env")

        genai.configure(api_key=settings.gemini_api_key)

        # Use Gemini 2.0 Flash for fast processing
        self.model = genai.GenerativeModel('gemini-2.0-flash')

        # Configure generation settings
        self.generation_config = genai.GenerationConfig(
            temperature=0.3,  # Lower temperature for more consistent outputs
            max_output_tokens=4096,
            response_mime_type="application/json",  # Request JSON output
        )

    def _call_gemini(self, prompt: str) -> dict:
        """Call Gemini API and parse JSON response."""
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=self.generation_config
            )

            response_text = response.text
            logger.debug(f"Gemini response: {response_text[:200]}...")

            # Handle potential markdown code blocks
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()

            return json.loads(response_text)

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response as JSON: {e}")
            logger.error(f"Response text: {response_text[:500]}")
            raise GeminiAnalysisError(f"Invalid JSON response from Gemini: {e}")
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise GeminiAnalysisError(f"Gemini API error: {e}")

    def extract_chapters(self, transcript: str, duration_seconds: int) -> List[Dict[str, Any]]:
        """
        Extract logical chapters from transcript.

        Args:
            transcript: Full transcript text
            duration_seconds: Total duration of the video

        Returns:
            List of chapter dictionaries
        """
        # Truncate very long transcripts to avoid token limits
        max_chars = 30000
        if len(transcript) > max_chars:
            transcript = transcript[:max_chars] + "\n... [transcript truncated]"

        prompt = CHAPTER_EXTRACTION_PROMPT.format(transcript=transcript)
        result = self._call_gemini(prompt)

        chapters = result.get("chapters", [])

        # Ensure chapters cover full duration
        if chapters and chapters[-1]["end_seconds"] < duration_seconds:
            chapters[-1]["end_seconds"] = duration_seconds

        return chapters

    def extract_decision_points(self, transcript: str) -> List[Dict[str, Any]]:
        """
        Extract decision points from transcript.

        Args:
            transcript: Full transcript text

        Returns:
            List of decision point dictionaries
        """
        max_chars = 30000
        if len(transcript) > max_chars:
            transcript = transcript[:max_chars] + "\n... [transcript truncated]"

        prompt = DECISION_POINT_PROMPT.format(transcript=transcript)
        result = self._call_gemini(prompt)

        return result.get("decision_points", [])

    def generate_summary(self, transcript: str) -> Dict[str, Any]:
        """
        Generate executive summary and key takeaways.

        Args:
            transcript: Full transcript text

        Returns:
            Dict with executive_summary, key_takeaways, and quality_score
        """
        max_chars = 30000
        if len(transcript) > max_chars:
            transcript = transcript[:max_chars] + "\n... [transcript truncated]"

        prompt = SUMMARY_PROMPT.format(transcript=transcript)
        result = self._call_gemini(prompt)

        return {
            "executive_summary": result.get("executive_summary", ""),
            "key_takeaways": result.get("key_takeaways", []),
            "quality_score": result.get("quality_score", 0)
        }

    def analyze_shadow(self, transcript: str, duration_seconds: int) -> Dict[str, Any]:
        """
        Perform full analysis of a shadow transcript.

        Args:
            transcript: Full transcript text
            duration_seconds: Total duration of the video

        Returns:
            Dict containing chapters, decision_points, and summary data
        """
        logger.info("Starting shadow analysis with Gemini...")

        # Extract chapters
        logger.info("Extracting chapters...")
        chapters = self.extract_chapters(transcript, duration_seconds)
        logger.info(f"Found {len(chapters)} chapters")

        # Extract decision points
        logger.info("Extracting decision points...")
        decision_points = self.extract_decision_points(transcript)
        logger.info(f"Found {len(decision_points)} decision points")

        # Generate summary
        logger.info("Generating summary...")
        summary = self.generate_summary(transcript)
        logger.info(f"Quality score: {summary.get('quality_score', 'N/A')}")

        return {
            "chapters": chapters,
            "decision_points": decision_points,
            **summary
        }


# Factory function to allow easy switching between services
def get_analysis_service() -> AnalysisService:
    """Get the configured analysis service."""
    return AnalysisService()
