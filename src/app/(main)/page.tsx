import { getImageProps } from "next/image";
import Link from "next/link";

function getBackgroundImage(srcSet = "") {
  const imageSet = srcSet
    .split(", ")
    .map((str) => {
      const [url, dpi] = str.split(" ");
      return `url("${url}") ${dpi}`;
    })
    .join(", ");
  return `image-set(${imageSet})`;
}

export default function Home() {
  const cards = [
    {
      title: "Raid Calculator",
      href: "/calculator",
      image: "/images/walls.jpg",
    },
    {
      title: "Recoil Patterns",
      href: "/recoil",
      image: "/images/guns.jpg",
    },
    {
      title: "Base Designs",
      href: "/community",
      image: "/images/jacky.jpg",
    },
    {
      title: "Resources",
      href: "/resources",
      image: "/images/tools.jpg",
    },
  ];
  const common = { width: 434, height: 222 };

  // Create a mapping of image paths to their srcSets
  const imageSrcSets: Record<string, string> = {};

  // Generate srcSets for all card images
  cards.forEach((card) => {
    const {
      props: { srcSet },
    } = getImageProps({ ...common, alt: "", src: card.image });
    imageSrcSets[card.image] = srcSet ?? "";
  });

  return (
    <div className="mt-10 flex flex-col items-center justify-center">
      <h1 className="mb-1 text-center font-editorial text-5xl font-light italic">
        Rust Directory
      </h1>
      <p className="mb-8 text-center text-balance text-muted-foreground">
        Everything you need to get better at Rust
      </p>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {cards.map((card, index) => (
          <Link
            key={index}
            href={card.href}
            className="group relative h-36 overflow-hidden border shadow-sm transition-shadow duration-150 hover:shadow-md md:h-56 dark:shadow-none"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-[scale] duration-150 group-hover:scale-105"
              style={{
                backgroundImage: getBackgroundImage(imageSrcSets[card.image]),
              }}
            />
            <div className="absolute inset-0 bg-black opacity-70 transition-opacity duration-150 group-hover:opacity-50" />
            <div className="absolute bottom-4 left-4 z-10">
              <h3 className="text-2xl font-semibold text-white">
                {card.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
