import { useEffect, useState } from 'react';

interface AboutData {
  title: string;
  history: string[] | string; 
  images: Array<{
    url: string;
    caption?: string;
  }>;
}

const AboutPage = () => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('/admin/api/data/about');
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data = await response.json();
        const content = Array.isArray(data) ? data[0] : data;
        setAboutData(content);
      } catch (error) {
        console.error("Error loading About data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  // SAFE PARAGRAPH PARSER
  const getHistoryParagraphs = () => {
    if (!aboutData?.history) return [];

    // 1. If it's an Array (The Correct Format) -> Use it directly
    if (Array.isArray(aboutData.history)) {
      return aboutData.history;
    }

    // 2. If it's a String (Legacy/Single Block) -> Only split by NEW LINE, never comma
    if (typeof aboutData.history === 'string') {
       // Split by "Enter" key (\n), filter out empty lines
       return aboutData.history.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    }

    return [];
  };

  if (loading) return <div className="pt-24 text-center text-white">Loading...</div>;
  if (!aboutData) return null;

  const historyParagraphs = getHistoryParagraphs();

  return (
    <div className="pt-24 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            {aboutData.title || "About Us"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto tracking-widest">
            LEARN  |  INNOVATE  |  EXCEL
          </p>
        </div>

        {/* HISTORY SECTION */}
        <div className="mb-20">
          <div className="max-w-4xl mx-auto space-y-6">
            {historyParagraphs.length > 0 ? (
                historyParagraphs.map((paragraph, index) => (
                <p key={index} className="text-lg leading-relaxed text-foreground/90 text-justify">
                    {paragraph}
                </p>
                ))
            ) : (
                <p className="text-center text-gray-500">No history content available yet.</p>
            )}
          </div>
        </div>

        {/* IMAGE GALLERY */}
        {aboutData.images && aboutData.images.length > 0 && (
          <div className="mb-16">
             <h2 className="text-3xl font-bold text-center mb-10 text-foreground">Glimpses</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {aboutData.images.map((img, idx) => (
                 <div key={idx} className="group relative aspect-video bg-card rounded-xl overflow-hidden shadow-lg border border-border">
                   <img 
                     src={img.url} 
                     alt={img.caption || "About Us"} 
                     className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                     onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image'; }}
                   />
                   {img.caption && (
                     <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 backdrop-blur-sm transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                       <p className="text-center text-sm text-white font-medium">{img.caption}</p>
                     </div>
                   )}
                 </div>
               ))}
             </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default AboutPage;