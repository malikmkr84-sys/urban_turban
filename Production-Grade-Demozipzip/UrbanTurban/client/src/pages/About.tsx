export default function About() {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="font-display text-5xl md:text-7xl mb-12">The Philosophy</h1>
        
        <div className="aspect-[2/1] bg-secondary/30 mb-12 overflow-hidden">
           {/* abstract minimalist texture no people */}
          <img 
            src="/abstract_minimalist__f331de90.jpg" 
            alt="Urban Minimal"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="prose prose-lg prose-stone mx-auto text-left">
          <p className="lead text-2xl font-display italic">
            "Simplicity is the ultimate sophistication."
          </p>
          <p>
            UrbanTurban was founded on the idea that headwear shouldn't define you, it should complement you. 
            We saw a market saturated with loud logos, bright neons, and fast fashion quality. 
            We wanted to create the antithesis: a cap that feels like a classic from day one.
          </p>
          <p>
            Our palette is inspired by nature and urban architecture—concrete greys, sandstone beiges, and park olives. 
            Every stitch is considered. The materials are chosen for their texture and longevity.
          </p>
          <h3>Materials & Craft</h3>
          <p>
            We use 100% organic cotton twill for structure and breathability. Our buckles are matte-finished metal, 
            never plastic. We believe in slow fashion—creating products that you don't need to replace every season.
          </p>
        </div>
      </div>
    </div>
  );
}
