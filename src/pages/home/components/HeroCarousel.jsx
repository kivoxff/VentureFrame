import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import prevArrow from "../../../assets/icons/prevArrow.svg"
import nextArrow from "../../../assets/icons/nextArrow.svg"

function HeroCarousel() {

    const heroImages = [
        "https://fastly.picsum.photos/id/10/2500/1667.jpg?hmac=J04WWC_ebchx3WwzbM-Z4_KC_LeLBWr5LZMaAkWkF68",
        "https://fastly.picsum.photos/id/11/2500/1667.jpg?hmac=xxjFJtAPgshYkysU_aqx2sZir-kIOjNR9vx0te7GycQ",
    ];

    const [activeSlide, setActiveSlide] = useState(0);
    const [isAnimation, setIsAnimation] = useState(false);
    const slideChangeTime = 5000;

    const nextSlide = () => {
        setIsAnimation(false);
        setActiveSlide(prev => prev >= heroImages.length - 1 ? 0 : prev + 1);
    }

    const prevSlide = () => {
        setIsAnimation(false);
        setActiveSlide(prev => prev <= 0 ? heroImages.length - 1 : prev - 1);
    }

    useEffect(() => {
        const triggerAnimation = setTimeout(() => setIsAnimation(true), 50);
        const interval = setInterval(nextSlide, slideChangeTime);

        return () => {
            clearTimeout(triggerAnimation);
            clearInterval(interval);
        };
    }, [activeSlide, isAnimation])

    return (
        <section className="mt-2 w-full h-125 border relative">
            {/* Slides */}
            <div className="w-full h-full">
                {
                    heroImages.map((img, idx) => (
                        <Link key={idx}>
                            <img src={img} alt="heroImg" className={`w-full h-full object-cover absolute ${idx === activeSlide ? "opacity-100" : "opacity-0"}`} />
                        </Link>
                    ))
                }
            </div>

            {/* Navigation Indicators */}
            <div className="w-full h-12 absolute bottom-3 flex justify-center items-center gap-3 z-20">
                {heroImages.map((_, idx) => (
                    <div key={idx}
                        onClick={() => {
                            setIsAnimation(false);
                            setActiveSlide(idx);
                        }}
                        className={`relative h-1.5 bg-white/30 rounded-full overflow-hidden cursor-pointer transition-all duration-300 ${activeSlide === idx ? "w-10" : "w-5"}`}>
                        <div className="absolute top-0 left-0 h-full bg-white"
                            style={{
                                // Logic: Only fill if it's the current slide AND the trigger is active
                                width: activeSlide === idx && isAnimation ? "100%" : "0%",
                                transition: activeSlide === idx && isAnimation
                                    ? `width ${slideChangeTime}ms linear`
                                    : "none",
                            }} />
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            <button onClick={prevSlide} className="w-10 aspect-square absolute top-1/2 left-4 transform -translate-y-1/2">
                <img src={prevArrow} alt="prevSlide" className="w-full" />
            </button>

            <button onClick={nextSlide} className="w-10 aspect-square absolute top-1/2 right-4 transform -translate-y-1/2">
                <img src={nextArrow} alt="prevSlide" className="w-full" />
            </button>

        </section>
    )
}

export default HeroCarousel;