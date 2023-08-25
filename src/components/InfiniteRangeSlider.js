import React, { useEffect, useRef } from 'react';

const InfiniteRangeSlider = () => {
  const sliderRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;

    const handleSliderAnimation = () => {
      slider.value = (parseFloat(slider.value) + 1) % parseFloat(slider.max);
    };

    const animationInterval = setInterval(handleSliderAnimation, 10);

    return () => {
      clearInterval(animationInterval);
    };
  }, []);

  return (
    <input
      ref={sliderRef}
      type="range"
      min="0"
      max="100"
      step="1"
      className="w-full h-4 appearance-none rounded-full bg-blue-500/50 text-white text-center place-content-center placeholder-white"
    />
  );
};

export default InfiniteRangeSlider;
