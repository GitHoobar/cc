from fastapi import FastAPI, HTTPException, UploadFile, File
from pytube import YouTube
import subprocess
import whisperx
import os
import json
import tensorflow
import torch

app = FastAPI()

@app.get("/download")
def download_and_convert_video(video_link: str):
    try:
        yt = YouTube(video_link)

        # Download video
        video_stream = yt.streams.get_highest_resolution()
        video_file_path = '../downloads/input_video.mp4'
        video_stream.download(output_path='../downloads', filename='input_video.mp4')
        print("Video download completed successfully!")

        # Download audio
        audio_stream = yt.streams.get_audio_only()
        audio_file_path = '../downloads/input_audio.m4a'
        audio_stream.download(output_path='../downloads', filename='input_audio.m4a')
        print("Audio download completed successfully!")

        # Convert audio to MP3
        input_file_path = os.path.abspath("../downloads/input_audio.m4a")
        output_file_path = os.path.abspath("../downloads/input_audio.mp3")
        ffmpeg_command = [
            "ffmpeg",
            "-i", input_file_path,
            "-codec:a", "libmp3lame",
            "-qscale:a", "2",
            output_file_path
        ]
        result = subprocess.run(ffmpeg_command, capture_output=True, text=True)
        if result.returncode != 0:
            raise Exception(f"FFmpeg conversion failed: {result.stderr}")

        print("Conversion to MP3 completed successfully.")

        return {"message": "Download and conversion completed successfully!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
upload_directory = "./uploads"
download_directory = "./download"

@app.post("/upload")
async def download_and_convert_video(video_file: UploadFile = File(...)):
    try:
        # Check if the uploaded file is in MP4 format
        if video_file.filename.endswith(".mp4"):
            # Save the uploaded file to the server
            video_content = await video_file.read()
            video_path = os.path.join(upload_directory, video_file.filename)
            with open(video_path, "wb") as video_writer:
                video_writer.write(video_content)

            # Define output file paths for MP3 and M4A files
            mp3_path = os.path.join(download_directory, f"{os.path.splitext(video_file.filename)[0]}.mp3")
            m4a_path = os.path.join(download_directory, f"{os.path.splitext(video_file.filename)[0]}.m4a")

            # Convert video to MP3
            ffmpeg_command_mp3 = [
                "ffmpeg",
                "-i", video_path,
                "-vn", "-acodec", "libmp3lame", "-ar", "44100", "-ab", "320k", "-f", "mp3",
                mp3_path
            ]
            subprocess.run(ffmpeg_command_mp3)

            # Convert video to M4A
            ffmpeg_command_m4a = [
                "ffmpeg",
                "-i", video_path,
                "-vn", "-acodec", "aac", "-strict", "experimental", "-ac", "2",
                m4a_path
            ]
            subprocess.run(ffmpeg_command_m4a)

            return {
                "message": "MP4 uploaded successfully. MP3 and M4A files have been created.",
                "mp3_path": mp3_path,
                "m4a_path": m4a_path
            }

        else:
            raise HTTPException(status_code=400, detail="Uploaded file must be in MP4 format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

def convert_seconds_to_srt_format(
    seconds: float, always_include_hours: bool = False, decimal_marker: str = "."
):
    assert seconds >= 0, "non-negative timestamp expected"
    milliseconds = round(seconds * 1000.0)

    hours = milliseconds // 3_600_000
    milliseconds -= hours * 3_600_000

    minutes = milliseconds // 60_000
    milliseconds -= minutes * 60_000

    seconds = milliseconds // 1_000
    milliseconds -= seconds * 1_000

    hours_marker = f"{hours:02d}:" if always_include_hours or hours > 0 else "00:"
    return (
        f"{hours_marker}{minutes:02d}:{seconds:02d}{decimal_marker}{milliseconds:03d}"
    )

@app.get("/convert")
def convert_video():
    device = "cuda"
    audio_file = os.path.abspath("../downloads/input_audio.mp3")
    batch_size = 4
    compute_type = "float16"

    # Load model with specified parameters
    model = whisperx.load_model("medium", device, compute_type=compute_type)

    # Load audio file
    audio = whisperx.load_audio(audio_file)

    # Transcribe audio using the loaded model
    result = model.transcribe(audio, batch_size=batch_size)

    # Load align model
    model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)

    # Align segments
    result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)

    output_directory = "../conversions/"
    os.makedirs(output_directory, exist_ok=True)

    srt_output_file_path = os.path.join(output_directory, "output.srt")

    # Convert segments to SRT format
    srt = ""
    segment_number = 1

    for segment in result:
        print(type(segment))  # Add this line to check the type of segment

        # Check if 'start' and 'end' are strings, convert them to floats if necessary
        start_time_segment = float(segment['start']) if isinstance(segment['start'], str) else segment['start']
        end_time_segment = float(segment['end']) if isinstance(segment['end'], str) else segment['end']

        start_time_segment = convert_seconds_to_srt_format(start_time_segment)
        end_time_segment = convert_seconds_to_srt_format(end_time_segment)

        for word in segment['words']:
            start_time_word = convert_seconds_to_srt_format(word['start'])
            end_time_word = convert_seconds_to_srt_format(word['end'])

            srt += f"{segment_number}\n"
            srt += f"{start_time_word} --> {end_time_word}\n"
            srt += f"{word['word']}\n\n"

        segment_number += 1

    # Write SRT content to a file
    with open(srt_output_file_path, 'w') as file:
        file.write(srt)

    print("SRT file has been created successfully.")
    return {"message": "SRT file has been created successfully."}
@app.post("/subtitle")
async def add_subtitle(subtitle_file: UploadFile = File(...), video_file: UploadFile = File(...)):
    try:
        # Check if the uploaded files are in SRT and MP4 format
        if subtitle_file.filename.endswith(".srt") and video_file.filename.endswith(".mp4"):
            # Save the uploaded files to the server
            subtitle_content = await subtitle_file.read()
            video_content = await video_file.read()

            # Define file paths
            subtitle_path = "../conversions/output.srt"
            video_path = "../downloads/input_video.mp4"

            # Write the subtitle content to the subtitle file
            with open(subtitle_path, "wb") as subtitle_writer:
                subtitle_writer.write(subtitle_content)

            # Write the video content to the video file
            with open(video_path, "wb") as video_writer:
                video_writer.write(video_content)

            # Create a directory for subtitles if it doesn't exist
            subtitles_directory = "../subtitles"
            os.makedirs(subtitles_directory, exist_ok=True)

            # Run ffmpeg command to burn subtitles onto the video
            output_video_path = os.path.join(subtitles_directory, "output_video_with_subtitles.mp4")
            ffmpeg_command = [
                "ffmpeg",
                "-i", video_path,
                "-vf", f"subtitles={subtitle_path}",
                "-c:a", "copy",
                output_video_path
            ]
            subprocess.run(ffmpeg_command)

            return {"message": "Subtitles added successfully"}

        else:
            raise HTTPException(status_code=400, detail="Uploaded files must be in SRT and MP4 formats")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))