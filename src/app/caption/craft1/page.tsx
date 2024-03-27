    "use client";

    import YouTubePlayer from "../../../../components/YoutubePlayer";

    import React, { ChangeEvent, useState, useEffect } from "react";
    import axios from "axios";
    import Spinner from "../../../../components/Spinner";
    

    export default function Craft() {
      const [file, setFile] = useState<File | null>(null);
      const [url, setUrl] = useState<string>("");
      const [Videourl, setVideoUrl] = useState<string>("");
      const [transcript, setTranscript] = useState<string>("");
      const [loading, setLoading] = useState<boolean>(false);


      const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(e.target.value);
      };

      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          setFile(files[0]);
        }
      };

      const buttonClick = async () => {
      try {
        setLoading(true);
        console.log("Attempting to download video...");
        const response = await axios.post("https://captioncraft.vercel.app/api/youtube", { youtubeLink: url }, { timeout:  1000 * 60 * 5 });
        console.log("Response received:", response);
        const data = response.data.transcription;
        const parsedData = JSON.parse(data);
        const transcriptValue = parsedData.text;
        setTranscript(transcriptValue);
        console.log("Video downloaded successfully");
     } catch (error) {
        console.error("Error downloading video:", error);
     
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
        } else if (error.request) {
          console.error("Request:", error.request);
        } else {
          console.error("Error message:", error.message);
        }
     } finally {
        setLoading(false);
     }
    };

    const handleUploadFromFile = async () => {
      try {
        const formData = new FormData();
        formData.append("file", file!);
        const response = await axios.post(
          "https://captioncraft.vercel.app/api/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const { videoUrl } = response.data;
        setVideoUrl(videoUrl);
      } catch (error) {
        console.error("Error uploading video:", error);
        
      } 
    };
      
      
     
      const previewButton = () => {
        if (Videourl) {
          setVideoUrl("");
        } else {
          if (url) {
            buttonClick()
          } else if (file) {
            handleUploadFromFile();
          }
        }
      };

      return (
        <>
          <div className='bg-[url("/images/dirtbgg.png")]'>
            <div className="flex flex-col gap-12 ]">
              <div className="flex justify-center items-center mt-16 gap-4">
                <div className="w-[80%]  flex justify-center items-center ">
                  <input
                    style={{fontFamily:'minecraft'}}
                    value={url}
                    onChange={handle}
                    placeholder="  Paste URL here "
                    type="text"
                    className=" h-12 w-[100%] font-minecraft bg-[#5E5E5E] border border-white text-white"
                  />
                </div>
                <div className="flex justify-center items-center">
                  <button
                    onClick={
                      previewButton
                    }
                    className="flex justify-center items-center minecraft-btn w-12 h-12 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200"
                  >
                    <img className="scale-[200%]" src="/images/go.png" alt="Go" />
                  </button>
                </div>
                
                
              </div>
              

              <div className="flex flex-col gap-6">
              <div className="text-white flex justify-center items-center" style={{fontFamily:'minecraft'}}><div>OR</div></div>
                <div className="flex justify-center items-center">
                <div className="flex justify-center items-center">
                <button
                  onClick={handleUploadFromFile}
                  style={{fontFamily:'minecraft'}}
                  className="minecraft-btn h-12 w-32 xl:text-[1rem] xl:w-64  text-center text-white text-[0.5rem] truncate p-2 border-2 border-b-4 hover:text-yellow-200"
                >
                  Upload
                </button>
              </div>
                <div className="flex justify-center items-center">
                  <button
                    onClick={
                      handleUploadFromFile
                    }
                    className="flex justify-center items-center minecraft-btn w-12 h-12 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200"
                  >
                    <img className="scale-[100%]" src="/images/upload.png" alt="Go" />
                  </button>
                </div>
                </div>

              </div>
              <div className="w-[83%] mx-auto flex justify-center items-center">
                <div className="relative w-[100%] h-72 xl:h-[80vh] xl:w-[100%] lg:h-[72vh] lg:w-[100%] md:h-[60vh] sm:h-[60vh] border border-white bg-[#5E5E5E]"></div>
                {Videourl && (
                  <div className="absolute left-1/2 top-[30%] transform -translate-x-1/2 -translate-y-1/2 h-[32%] w-[80%] top-[35%] xl:h-[70%] xl:w-[80%] xl:top-[55%] lg:h-[65%] lg:w-[80%] lg:top-[53%] md:h-[55%] md:w-[80%] md:top-[48%] sm:h-[57%] sm:w-[80%] sm:top-[48%]  z-5">
                    <div className="flex h-[100%] w-[100%] lg:h-[100%] md:h-[100%] md:w-[100%] sm:h-[100%] sm:w-[100%] justify-center items-center] ">
                      <YouTubePlayer url={Videourl} />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-center items-center">
                <button
                  onClick={buttonClick}
                  style={{fontFamily:'minecraft'}}
                  className="minecraft-btn h-8 w-32 xl:text-[1rem] xl:w-64  text-center text-white text-[0.5rem] truncate p-2 border-2 border-b-4 hover:text-yellow-200"
                >
                  Generate Transcript
                </button>
              </div>

              {loading && <Spinner />} {}
  
              <div className="flex z-1 justify-center h-[40vh] w-[100%] xl:h-[120vh] lg:h-[90vh] lg:w-[98%] md:h-[80vh] md:w-[100vw] sm:h-[50vh] sm:w-[80vh] items-center ">
                <img
                  src="/images/transcript.png"
                  alt="Transcript"
                  className="size-[80%] xl:size-[80%] lg:size-[70%] md:size-[70%] sm:size-[70%]"
                />
                
                <div className=" text-black absolute text-center align-center left-[20%] text-sm ">
                  
                  <div style={{fontFamily:'minecraft'}} className="w-[79%] h-48 text-[0.7rem] sm:text-sm lg:text-md xl:text-lg text-center">
                    {transcript}
                  </div>
                  
              </div>
                
              </div>
              
            </div>
          </div>

          

        </>
      );
    }
