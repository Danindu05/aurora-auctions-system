import { Gem, Globe, Heart, Star } from "lucide-react";

const aboutFeatures = [
  {
    icon: Gem,
    title: "Curated Rarity",
    description: "Every gem undergoes rigorous evaluation by GIA-certified experts before it reaches our catalogue.",
  },
  {
    icon: Star,
    title: "Signature Presentation",
    description: "Live-streamed showcases and immersive digital experiences bring each stone to life.",
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Aurora Auctions connects collectors across 40+ countries with secure, concierge logistics.",
  },
  {
    icon: Heart,
    title: "Responsible Sourcing",
    description: "We partner with mines and ateliers committed to ethical practices and community upliftment.",
  },
];

const About = () => (
  <div className="bg-white">
    <section className="container-lux space-y-12 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Our Story</p>
        <h1 className="heading-lux mt-4 text-4xl">Crafted for Connoisseurs of Brilliance</h1>
        <p className="mt-6 text-base text-gray-500">
          Founded in 2012, Aurora Auctions emerged from a passion for extraordinary gemstones and uncompromising service. Our team of gemologists, art historians, and luxury strategists curate auctions that celebrate rarity and radiance.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        {aboutFeatures.map((feature) => (
          <div key={feature.title} className="card-lux space-y-4 p-8">
            <feature.icon className="h-8 w-8 text-emerald-600" />
            <h2 className="font-playfair text-2xl text-gray-900">{feature.title}</h2>
            <p className="text-sm text-gray-500">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="card-lux space-y-6 p-10 text-center">
        <h3 className="font-playfair text-3xl text-gray-900">Aurora Values</h3>
        <p className="text-sm text-gray-500">
          Transparency, integrity, and artistry define every step of our process. From consignment to delivery, we orchestrate a seamless white-glove experience.
        </p>
      </div>
    </section>
  </div>
);

export default About;
