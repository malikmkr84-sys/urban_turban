import { Link } from "wouter";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: products, isLoading } = useProducts();

  // Featured products (take first 3)
  const featured = products?.slice(0, 3) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden pt-20 md:pt-0">
        {/* Background Image - Editorial Style */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/20 z-10" /> {/* Subtle overlay */}
          {/* abstract geometric pattern */}
          <img 
            src="/abstract_geometric_p_5f4bc3ae.jpg" 
            alt="Urban Turban Editorial"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 text-center text-white space-y-6 max-w-4xl px-4 py-12 md:py-0">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight"
          >
            Essential Headwear <br />
            <span className="italic font-light">For the Modern Mind.</span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-medium tracking-wide hover:bg-white/90 transition-colors text-sm sm:text-base"
            >
              SHOP COLLECTION <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl">Latest Drops</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Meticulously crafted from premium cotton blends. Designed for comfort, durability, and understated style.
            </p>
          </div>
          <Link href="/shop" className="hidden md:flex items-center gap-2 text-sm font-bold border-b border-black pb-0.5 hover:opacity-60 transition-opacity">
            VIEW ALL
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-8">
            {/* Displaying Black, Beige, and Olive variants as separate cards */}
            {featured.length > 0 && (
              <>
                <ProductCard 
                  product={{
                    ...featured[0],
                    name: "The Urban Essential (Black)",
                    images: [featured[0].images[0]]
                  }} 
                />
                <ProductCard 
                  product={{
                    ...featured[0],
                    name: "The Urban Essential (Beige)",
                    images: [featured[0].images[1] || featured[0].images[0]]
                  }} 
                />
                <ProductCard 
                  product={{
                    ...featured[0],
                    name: "The Urban Essential (Olive)",
                    images: [featured[0].images[2] || featured[0].images[0]]
                  }} 
                />
              </>
            )}
          </div>
        )}
        
        <div className="mt-12 text-center md:hidden">
          <Link href="/shop" className="inline-block border border-black px-8 py-3 text-sm font-bold">
            VIEW ALL PRODUCTS
          </Link>
        </div>
      </section>

      {/* Brand Story Teaser */}
      <section className="bg-secondary/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative aspect-square lg:aspect-[4/5] overflow-hidden">
               {/* minimal urban concrete texture */}
              <img 
                src="https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&q=80&w=2070" 
                alt="Urban Texture"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="font-display text-4xl md:text-5xl">Not Just a Cap.<br/>A Statement of Simplicity.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe in the power of restraint. In a world of loud logos and fleeting trends, 
                UrbanTurban stands for timeless design and quiet confidence. Each piece is constructed 
                to age beautifully with you.
              </p>
              <Link href="/about" className="inline-block text-primary font-medium hover:underline underline-offset-4">
                READ OUR PHILOSOPHY
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
