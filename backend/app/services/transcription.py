"""
Transcription service using AssemblyAI API
"""
import os
import time
import logging
from typing import Optional, List, Dict, Any
import requests
from app.core.config import settings

logger = logging.getLogger(__name__)

ASSEMBLYAI_BASE_URL = "https://api.assemblyai.com/v2"


class AssemblyAIError(Exception):
    """Custom exception for AssemblyAI errors"""
    pass


def _get_headers() -> dict:
    """Get headers for AssemblyAI API requests"""
    if not settings.assemblyai_api_key:
        raise ValueError("AssemblyAI API key not configured. Set ASSEMBLYAI_API_KEY in .env")
    return {"authorization": settings.assemblyai_api_key}


def _upload_file(file_path: str) -> str:
    """
    Upload a local file to AssemblyAI for transcription.

    Args:
        file_path: Path to the audio/video file

    Returns:
        Upload URL to use for transcription
    """
    headers = _get_headers()

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    logger.info(f"Uploading file to AssemblyAI: {file_path}")

    with open(file_path, "rb") as f:
        response = requests.post(
            f"{ASSEMBLYAI_BASE_URL}/upload",
            headers=headers,
            data=f
        )

    if response.status_code != 200:
        raise AssemblyAIError(f"Upload failed: {response.text}")

    upload_url = response.json()["upload_url"]
    logger.info(f"File uploaded successfully: {upload_url[:50]}...")
    return upload_url


def _create_transcript(audio_url: str, speaker_labels: bool = True) -> str:
    """
    Create a transcription job.

    Args:
        audio_url: URL of the audio file (can be upload URL or public URL)
        speaker_labels: Enable speaker diarization

    Returns:
        Transcript ID
    """
    headers = _get_headers()
    headers["content-type"] = "application/json"

    payload = {
        "audio_url": audio_url,
        "speaker_labels": speaker_labels,  # Enable speaker diarization
        "auto_chapters": True,  # Auto-generate chapters
        "entity_detection": True,  # Detect entities
        "sentiment_analysis": True,  # Analyze sentiment
    }

    response = requests.post(
        f"{ASSEMBLYAI_BASE_URL}/transcript",
        headers=headers,
        json=payload
    )

    if response.status_code != 200:
        raise AssemblyAIError(f"Failed to create transcript: {response.text}")

    transcript_id = response.json()["id"]
    logger.info(f"Transcript job created: {transcript_id}")
    return transcript_id


def _poll_transcript(transcript_id: str, timeout: int = 600) -> dict:
    """
    Poll for transcript completion.

    Args:
        transcript_id: The transcript job ID
        timeout: Maximum time to wait in seconds

    Returns:
        Completed transcript data
    """
    headers = _get_headers()
    endpoint = f"{ASSEMBLYAI_BASE_URL}/transcript/{transcript_id}"

    start_time = time.time()

    while True:
        response = requests.get(endpoint, headers=headers)

        if response.status_code != 200:
            raise AssemblyAIError(f"Failed to get transcript status: {response.text}")

        data = response.json()
        status = data["status"]

        if status == "completed":
            logger.info(f"Transcript completed: {transcript_id}")
            return data
        elif status == "error":
            error_msg = data.get("error", "Unknown error")
            raise AssemblyAIError(f"Transcription failed: {error_msg}")

        # Check timeout
        if time.time() - start_time > timeout:
            raise AssemblyAIError(f"Transcription timed out after {timeout} seconds")

        logger.debug(f"Transcript status: {status}, waiting...")
        time.sleep(5)  # Poll every 5 seconds


def transcribe_audio(audio_file_path: str) -> Optional[str]:
    """
    Transcribe audio/video file using AssemblyAI.

    Args:
        audio_file_path: Path to the audio/video file

    Returns:
        Transcribed text or None if transcription fails
    """
    try:
        upload_url = _upload_file(audio_file_path)
        transcript_id = _create_transcript(upload_url, speaker_labels=False)
        result = _poll_transcript(transcript_id)
        return result.get("text")
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        raise


def transcribe_audio_with_timestamps(audio_file_path: str) -> dict:
    """
    Transcribe audio/video file with segment timestamps and speaker diarization.

    Args:
        audio_file_path: Path to the audio/video file

    Returns:
        Dict containing:
        - text: Full transcript text
        - segments: List of segments with timestamps
        - utterances: Speaker-labeled utterances (if diarization enabled)
        - chapters: Auto-generated chapters
        - duration: Audio duration in seconds
    """
    upload_url = _upload_file(audio_file_path)
    transcript_id = _create_transcript(upload_url, speaker_labels=True)
    result = _poll_transcript(transcript_id)

    # Extract segments (words grouped into sentences)
    segments = []
    if result.get("words"):
        current_segment = {"start": 0, "end": 0, "text": "", "speaker": None}

        for word in result["words"]:
            # Start new segment on speaker change or long pause
            if (current_segment["speaker"] and
                word.get("speaker") != current_segment["speaker"]):
                if current_segment["text"].strip():
                    segments.append(current_segment)
                current_segment = {
                    "start": word["start"] / 1000,  # Convert ms to seconds
                    "end": word["end"] / 1000,
                    "text": word["text"],
                    "speaker": word.get("speaker")
                }
            else:
                if not current_segment["text"]:
                    current_segment["start"] = word["start"] / 1000
                current_segment["end"] = word["end"] / 1000
                current_segment["text"] += " " + word["text"]
                current_segment["speaker"] = word.get("speaker")

        # Don't forget the last segment
        if current_segment["text"].strip():
            segments.append(current_segment)

    # Extract utterances (speaker-labeled blocks)
    utterances = []
    if result.get("utterances"):
        utterances = [
            {
                "start": utt["start"] / 1000,
                "end": utt["end"] / 1000,
                "text": utt["text"],
                "speaker": utt["speaker"],
                "confidence": utt.get("confidence", 0)
            }
            for utt in result["utterances"]
        ]

    # Extract auto-generated chapters
    chapters = []
    if result.get("chapters"):
        chapters = [
            {
                "start": ch["start"] / 1000,
                "end": ch["end"] / 1000,
                "headline": ch["headline"],
                "summary": ch["summary"],
                "gist": ch.get("gist", "")
            }
            for ch in result["chapters"]
        ]

    return {
        "text": result.get("text", ""),
        "segments": segments,
        "utterances": utterances,
        "chapters": chapters,
        "duration": result.get("audio_duration", 0),
        "confidence": result.get("confidence", 0),
        "word_count": len(result.get("words", [])),
    }


def get_speakers(transcript_data: dict) -> List[str]:
    """
    Extract unique speakers from transcript data.

    Args:
        transcript_data: Result from transcribe_audio_with_timestamps

    Returns:
        List of unique speaker identifiers
    """
    speakers = set()
    for utterance in transcript_data.get("utterances", []):
        if utterance.get("speaker"):
            speakers.add(utterance["speaker"])
    return sorted(list(speakers))
