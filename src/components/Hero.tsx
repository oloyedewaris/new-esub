interface HeroProps {
  imageUrl: string;
  location: string;
  alt: string;
}

/** The estate photo at the top. Stays put while the sheet scrolls over it. */
export function Hero({ imageUrl, location, alt }: HeroProps) {
  return (
    <div className="hero" role="img" aria-label={alt} style={{ backgroundImage: `url("${imageUrl}")` }}>
      <span className="hero__location">{location.toUpperCase()}</span>
    </div>
  );
}
