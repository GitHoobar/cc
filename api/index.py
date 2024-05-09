from fastapi import FastAPI, HTTPException, Response
import subprocess
import whisperx
import pytube
from pytube import YouTube
import requests
import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.get("/uploadconvert")
def upload_convert_video(upUrl: str):
    try:
        
        download_response = requests.get(upUrl)
        download_response.raise_for_status()  # Raise HTTPError for bad response status
        video_content = download_response.content
        
        directory = '../downloads/'


        os.makedirs(directory, exist_ok=True)

        
        video_file_path = '../downloads/input_video.mp4'
        with open(video_file_path, 'wb') as video_file:
            video_file.write(video_content)
        
        print("Video download completed successfully!")

        
        input_file_path = video_file_path
        output_file_path = '../downloads/input_audio.mp3'
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

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to download video: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@app.get("/download")
def download_and_convert_video(video_link: str):
    try:
        yt = YouTube(video_link)
        video_stream = yt.streams.first()
        video_stream.download(output_path='../downloads', filename='input_video.mp4')
        print("Video download completed successfully!")

        audio_stream = yt.streams.get_audio_only()
        audio_file_path = '../downloads/input_audio.m4a'
        audio_stream.download(output_path='../downloads', filename='input_audio.m4a')
        print("Audio download completed successfully!")


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


@app.get("/convert")
def convert():
    return convert_video()

def convert_video():
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

    device = "cuda"
    audio_file = os.path.abspath("../downloads/input_audio.mp3")
    batch_size = 4
    compute_type = "float16"

    model = whisperx.load_model("medium", device, compute_type=compute_type)

    
    audio = whisperx.load_audio(audio_file)

    
    result = model.transcribe(audio, batch_size=batch_size)

    
    model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)

    
    result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)

    output_directory = "../conversions/"
    os.makedirs(output_directory, exist_ok=True)
    srt_output_file_path = os.path.join(output_directory, "output.srt")

    
    srt_output = ""
    segment_number = 1

    for segment in result['segments']:  
        word_number = 1
        for word_info in segment['words']:
            word = word_info['word']
            start_time = convert_seconds_to_srt_format(word_info['start'], always_include_hours=True, decimal_marker=',')
            end_time = convert_seconds_to_srt_format(word_info['end'], always_include_hours=True, decimal_marker=',')

            srt_output += f"{word_number}\n{start_time} --> {end_time}\n{word}\n\n"
            word_number += 1

        segment_number += 1

    
    with open(srt_output_file_path, 'w') as file:
        file.write(srt_output)

    print("SRT file has been created successfully.")
    return {"message": "SRT file has been created successfully."}




@app.post("/subtitle")
async def add_subtitle(subtitle_file: str = "../conversions/output.srt", video_file: str = "../downloads/input_video.mp4"):
    try:
        
        subtitle_path = "../conversions/output.srt"
        video_path = "../downloads/input_video.mp4"
        ass_output_dir = "../subtitles/"
        ass_output_path = os.path.join(ass_output_dir, "subtitles.ass")
        output_video_avi_path = os.path.join(ass_output_dir, "output_video_with_subtitles.avi")
        output_video_mp4_path = os.path.join(ass_output_dir, "output_video_with_subtitles.mp4")

        
        os.makedirs(ass_output_dir, exist_ok=True)

        
        ffmpeg_srt_to_ass_command = [
            "ffmpeg",
            "-i", subtitle_path,
            ass_output_path
        ]
        subprocess.run(ffmpeg_srt_to_ass_command)

        
        ffmpeg_burn_subtitles_command = [
            "ffmpeg",
            "-i", video_path,
            "-vf", f"ass={ass_output_path}",
            output_video_avi_path
        ]
        subprocess.run(ffmpeg_burn_subtitles_command)

        
        ffmpeg_convert_to_mp4_command = [
            "ffmpeg",
            "-i", output_video_avi_path,
            output_video_mp4_path
        ]
        subprocess.run(ffmpeg_convert_to_mp4_command)

       

        
        os.remove(output_video_avi_path)

        return {
            "message": "Subtitles added successfully",
            "output_video_path": output_video_mp4_path,
        }

        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/cloud")
async def upload_to_cloudinary(subtitle_file: str = "../subtitles/output_video_with_subtitles.mp4"):
    try:
        
        upload_result = cloudinary.uploader.upload(subtitle_file, resource_type="video",cloud_name="dso9pgxen")
        
        
        public_id = upload_result["public_id"]
        
        return {"public_id": public_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))