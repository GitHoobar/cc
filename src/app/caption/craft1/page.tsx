    "use client";

    import { CldVideoPlayer,CldUploadWidget,CldUploadWidgetProps } from "next-cloudinary";
    import 'next-cloudinary/dist/cld-video-player.css';
    import React, { ChangeEvent, useState, useEffect } from "react";
    import axios from "axios";
    import Spinner from "../../../../components/Spinner";
    interface CustomCldUploadWidgetProps extends CldUploadWidgetProps {
      cloudName: string;
    }

    export default function Craft() {
      const [url, setUrl] = useState<string>("");
      const [loading, setLoading] = useState<boolean>(false);
      const [showVideoPlayer, setShowVideoPlayer] = useState(false);
      const [public_id, setPublicId] = useState("");
      const [upurl,setUpUrl] = useState("");
      


      const handleUploadSuccess = (response:any) => {
        console.log("Upload successful");
        console.log("url:", response.info.url);
        const upUrl = response.info.url; // Storing response.info.url in a variable
    handleDownload(upUrl);
      }
       

      
      const handleDownload = async (upUrl:any) => {
        try {
          setLoading(true); 
      
          
          axios.get(`http://localhost:8000/uploadconvert?upUrl=${upUrl}`)
            .then(async (response) => {
              console.log("Download request sent successfully!");
              
              await axios.get("http://localhost:8000/convert");
              console.log("Convert request sent successfully!");
      
              
              await axios.post("http://localhost:8000/subtitle");
              console.log("Subtitles request sent successfully!");

              const cloudResponse = await axios.post("http://localhost:8000/cloud?cloud_name=dso9pgxen");
              console.log("Public ID:", cloudResponse.data.public_id);
              setPublicId(cloudResponse.data.public_id);
            })
            .catch(error => {
              console.error("Error", error);
            })
            .finally(() => {
              setLoading(false);
            });
      
        } catch (error) {
          console.error("Error", error);
          setLoading(false);
        }
      };
      

const handleGoButtonClick = () => {
  console.log("go");
  setLoading(true);
  axios.get(`http://localhost:8000/download?video_link=${url}`)
    .then(response => {
      console.log("Download request sent successfully!");
      return axios.get("http://localhost:8000/convert");
    })
    .then(() => {
      console.log("Convert request sent successfully!");
      return axios.post("http://localhost:8000/subtitle");
    })
    .then(() => {
      console.log("Subtitles request sent successfully!");
      return axios.post("http://localhost:8000/cloud?cloud_name=dso9pgxen");
    })
    .then(response => {
      console.log("Public ID:", response.data.public_id);
      setPublicId(response.data.public_id);
    })
    .catch(error => {
      console.error("Error", error);

    })
    .finally(() => {
      setLoading(false);
    });
};






      const handleGetSubtitlesClick = () => {
       
        setShowVideoPlayer(true);
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
                    placeholder="  Paste URL here "
                    type="text"
                    className=" h-12 w-[100%] font-minecraft bg-[#5E5E5E] border border-white text-white"
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div className="flex justify-center items-center">
                  <button
                     onClick={handleGoButtonClick}
                    className="flex justify-center items-center minecraft-btn w-12 h-12 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200"
                  >
                    <img className="scale-[200%]" src="/images/go.png" alt="Go" />
                  </button>
                </div>
                
                
                
              </div>
              
              {loading && <Spinner />} 
              <div className="flex flex-col gap-6">
              <div className="text-white flex justify-center items-center" style={{fontFamily:'minecraft'}}><div>OR</div></div>
                <div className="flex justify-center items-center">
                <div className="flex justify-center items-center">
  <div className="minecraft-btn h-12 w-32 xl:text-[1rem] xl:w-64 text-center text-white text-[0.5rem] truncate p-2 border-2 border-b-4 hover:text-yellow-200 cursor-pointer">
    
  <CldUploadWidget uploadPreset="captioncraft"
  onSuccess={handleUploadSuccess}
  >
  {({ open }) => {
    return (
      <button style={{fontFamily:'minecraft'}} onClick={() => open()}>
        Upload Video
      </button>
    );
  }}
</CldUploadWidget>
  </div>
</div>           
{upurl && (
                <div className="flex justify-center items-center">
                  <button onClick={handleDownload}
                    
                    className="flex justify-center items-center minecraft-btn w-12 h-12 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200"
                  >
                    <img className="scale-[100%]" src="/images/upload.png" alt="Go" />
                  </button>
                </div>)}
                </div>

              </div>
              <div className="w-[83%] mx-auto flex justify-center items-center">
                <div className="relative w-[100%] h-[80%] xl:h-[93vh] xl:w-[100%] lg:h-[62vh] lg:w-[100%] md:h-[52vh] sm:h-[38vh] h-[22vh] border border-white bg-[#5E5E5E]"></div>
                
                  <div className="absolute left-1/2 lg:top-[68%] md:top-[62%] sm:top-[64%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 h-[32%] w-[80%] top-[35%] xl:h-[80%] xl:w-[80%] xl:top-[75%] lg:h-[65%] lg:w-[80%] lg:top-[53%] md:h-[55%] md:w-[80%] md:top-[48%] sm:h-[57%] sm:w-[80%] sm:top-[48%]  z-5">
                    
                      
                  {showVideoPlayer && (
        <CldVideoPlayer
          id={public_id}
          width="1920"
          height="1080"
          src={`https://res.cloudinary.com/dso9pgxen/video/upload/${public_id}.mp4`}
        />
      )}
                      
                    
                  </div>
                
              </div>
              <div className="flex justify-center items-center pb-24">
                <button
                  style={{fontFamily:'minecraft'}}
                  onClick={handleGetSubtitlesClick}
                  className="minecraft-btn h-8 w-32 xl:text-[1rem] xl:w-64  text-center text-white text-[0.5rem] truncate p-2 border-2 border-b-4 hover:text-yellow-200"
                >
                  Get Subtitles
                </button>
              </div>

              
  
              
              
            </div>
          </div>

          

        </>
      );
    }
  