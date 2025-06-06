// components/Lightbox.tsx
import { useEffect, useState } from "react";
import styled from "styled-components";

const LightboxOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LightboxContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
`;

const LightboxImage = styled.img`
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
`;

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  font-size: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
  }
`;

const PrevButton = styled(NavigationButton)`
  left: 20px;
`;

const NextButton = styled(NavigationButton)`
  right: 20px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const Counter = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
`;

interface LightboxProps {
  photos: string[];
  initialIndex: number;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ photos, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev:any) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev:any) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <LightboxOverlay onClick={onClose}>
      <LightboxContent onClick={(e) => e.stopPropagation()}>
        <LightboxImage 
          src={`http://localhost:8000${photos[currentIndex]}`}
          alt={`Business photo ${currentIndex + 1}`}
        />
        
        <PrevButton onClick={handlePrev}>&lt;</PrevButton>
        <NextButton onClick={handleNext}>&gt;</NextButton>
        
        <CloseButton onClick={onClose}>&times;</CloseButton>
        
        <Counter>
          {currentIndex + 1} / {photos.length}
        </Counter>
      </LightboxContent>
    </LightboxOverlay>
  );
};

export default Lightbox;