import * as React from "react";

interface RollingLoaderProps {
  entrants: string[];
  size?: number;
}

interface SlideProps {
  children: React.ReactNode;
  fadeDuration: number;
  fadeIn: boolean;
  fadeOut: boolean;
  size: number;
  staging: boolean;
}

const Slide = ({
  children,
  fadeDuration,
  fadeIn,
  fadeOut,
  size,
  staging
}: SlideProps) => (
  <>
    <div
      className={`slide ${
        staging
          ? `staging ${fadeIn ? "fadeIn" : ""}`
          : `${fadeOut ? "fadeOut" : ""}`
      }`}
    >
      {children}
    </div>
    <style jsx>{`
      div.slide {
        font-size: ${size}px;
        line-height: ${size * 2.5}px;
        position: absolute;
        width: 100%;
      }

      div.staging {
        top: ${size * 2.5}px;
      }

      .fadeIn {
        animation-name: fadeIn;
        animation-duration: ${fadeDuration}ms;
      }

      .fadeOut {
        animation-name: fadeOut;
        animation-duration: ${fadeDuration}ms;
      }

      @keyframes fadeIn {
        0% {
          opacity: 0;
          transform: translateY(0);
        }
        100% {
          opacity: 1;
          transform: translateY(-${size * 2.5}px);
        }
      }

      @keyframes fadeOut {
        0% {
          opacity: 1;
          transform: translateY(0);
        }
        100% {
          opacity: 0;
          transform: translateY(-${size * 2.5}px);
        }
      }
    `}</style>
  </>
);

const RollingLoader = ({ entrants, size = 24 }: RollingLoaderProps) => {
  const [alternateFlag, setAlternateFlag] = React.useState(false);
  const [fadeOutFlag, setFadeOutFlag] = React.useState(false);
  const [fadeInFlag, setFadeInFlag] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(Math.floor(Math.random() * entrants.length));
  const fadeDuration = 250;

  const getNextIndex = (currentIndex: number) => {
    let nextIndex = currentIndex + 1;
    if (currentIndex + 1 === entrants.length){
      nextIndex = 0;
    }
    return nextIndex;
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      setFadeOutFlag(true);
      setFadeInFlag(true);
      setTimeout(() => {
        setFadeOutFlag(false);
        setFadeInFlag(false);
        setAlternateFlag(prevFlag => !prevFlag);
        setCurrentIndex(prevIndex => getNextIndex(prevIndex));
      }, fadeDuration);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const currentEmoji = entrants[currentIndex];
  const nextEmoji = entrants[getNextIndex(currentIndex)];
  return (
    <>
      <div className="viewport">
        <Slide
          fadeDuration={fadeDuration}
          fadeIn={fadeInFlag}
          fadeOut={fadeOutFlag}
          size={size}
          staging={alternateFlag}
        >
          {alternateFlag ? nextEmoji : currentEmoji}
        </Slide>
        <Slide
          fadeDuration={fadeDuration}
          fadeIn={fadeInFlag}
          fadeOut={fadeOutFlag}
          size={size}
          staging={!alternateFlag}
        >
          {!alternateFlag ? nextEmoji : currentEmoji}
        </Slide>
      </div>
      <style jsx>{`
        div.viewport {
          height: ${size * 2.5}px;
          overflow: hidden;
          position: relative;
          text-align: center;
          width: 100%;
        }
      `}</style>
    </>
  );
};

export default RollingLoader;
