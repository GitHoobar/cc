    "use client";

    import { CldVideoPlayer,CldUploadWidget } from "next-cloudinary";
    import 'next-cloudinary/dist/cld-video-player.css';
    import React, { ChangeEvent, useState, useEffect } from "react";
    
    import Spinner from "../../../../components/Spinner";
    

    export default function Craft() {
      const [url, setUrl] = useState<string>("");
      const [Videourl, setVideoUrl] = useState<string>("");
      const [loading, setLoading] = useState<boolean>(false);

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
                  />
                </div>
                <div className="flex justify-center items-center">
                  <button
                    
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
  <div className="minecraft-btn h-12 w-32 xl:text-[1rem] xl:w-64 text-center text-white text-[0.5rem] truncate p-2 border-2 border-b-4 hover:text-yellow-200 cursor-pointer">
    
  <CldUploadWidget uploadPreset="<Your Upload Preset>">
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
                <div className="flex justify-center items-center">
                  <button
                    
                    className="flex justify-center items-center minecraft-btn w-12 h-12 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200"
                  >
                    <img className="scale-[100%]" src="/images/upload.png" alt="Go" />
                  </button>
                </div>
                </div>

              </div>
              <div className="w-[83%] mx-auto flex justify-center items-center">
                <div className="relative w-[100%] h-[80%] xl:h-[93vh] xl:w-[100%] lg:h-[62vh] lg:w-[100%] md:h-[52vh] sm:h-[38vh] h-[22vh] border border-white bg-[#5E5E5E]"></div>
                
                  <div className="absolute left-1/2 lg:top-[68%] md:top-[62%] sm:top-[64%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 h-[32%] w-[80%] top-[35%] xl:h-[80%] xl:w-[80%] xl:top-[75%] lg:h-[65%] lg:w-[80%] lg:top-[53%] md:h-[55%] md:w-[80%] md:top-[48%] sm:h-[57%] sm:w-[80%] sm:top-[48%]  z-5">
                    
                      
                      <CldVideoPlayer
                      id='samples/sea-turtle.mp4'
                      width='1920'
                      height='1080'
                      src="https://res.cloudinary.com/dso9pgxen/video/upload/v1715089608/samples/sea-turtle.mp4"
                      />
                      
                    
                  </div>
                
              </div>
              <div className="flex justify-center items-center pb-24">
                <button
                  style={{fontFamily:'minecraft'}}
                  className="minecraft-btn h-8 w-32 xl:text-[1rem] xl:w-64  text-center text-white text-[0.5rem] truncate p-2 border-2 border-b-4 hover:text-yellow-200"
                >
                  Get Subtitles
                </button>
              </div>

              {loading && <Spinner />} {}
  
              
              
            </div>
          </div>

          

        </>
      );
    }
