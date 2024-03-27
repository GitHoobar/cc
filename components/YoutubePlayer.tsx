import React from 'react';

interface YouTubePlayerProps {
  url: string;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ url }) => {
  const videoId = extractVideoId(url);

  return (
    <div className='h-[100%] w-[100%] xl:h-[100%] xl:w-[100%] lg:w-[100%] lg:h-[100%] md:w-[100%] md:h-[100%] sm:w-[100%] sm:h-[100%]'>
      {videoId && (
        <iframe
        className="  h-[100%] w-[100%] xl:h-[100%] xl:w-[100%] lg:w-[100%] lg:h-[100%] md:w-[100%] md:h-[100%] sm:w-[100%] sm:h-[100%]"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
};

function extractVideoId(url: string) {
  const match = url.match(
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})$/
  );
  return match && match[1];
}

export default YouTubePlayer;