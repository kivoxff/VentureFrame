import { useState } from "react";

function ProductGallery({ images }) {
  const [mainImg, setMainImg] = useState(0);

  return (
    <div className="w-full md:min-w-sm md:w-2/5 border">
      <div className="w-full aspect-square border bg-gray-200 rounded-2xl overflow-hidden">
        <img
          src={images[mainImg].url}
          alt="mainImg"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full flex md:flex-wrap justify-between items-center overflow-x-auto scrollbar-thin">
        {images.map((img, idx) => (
          <button
            onClick={() => setMainImg(idx)}
            key={idx}
            className={`m-3 w-1/4 aspect-square ${mainImg === idx ? "border-4 border-red-500" : "border border-gray-400"} rounded-2xl shrink-0 overflow-hidden cursor-pointer`}
          >
            <img
              src={img.url}
              alt="subImg"
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProductGallery;
