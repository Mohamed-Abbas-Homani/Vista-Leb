import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./ImageCarousel.css";

import image1 from "../assets/mimage1.jpg";
import image2 from "../assets/mimage2.jpg";
// import image3 from "../assets/mimage3.jpg"

const images = [image1, image2,  ];

const ImageCarousel: React.FC = () => {
  return (
    <div className="carousel-container">
      <Carousel
        autoPlay
        infiniteLoop
        interval={2800}
        transitionTime={800}
        showThumbs={true}
        showStatus={false}
        showIndicators={true}
        stopOnHover
        useKeyboardArrows
        swipeable
        emulateTouch
      >
        {images.map((src, index) => (
          <div key={index} className="carousel-slide">
            <img src={src} alt={`Slide ${index + 1}`} />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default ImageCarousel;
