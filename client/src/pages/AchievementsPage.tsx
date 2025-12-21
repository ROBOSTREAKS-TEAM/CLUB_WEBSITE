import { useState, useEffect } from 'react'; // Added useEffect
import AchievementCard from '@/components/cards/AchievementCard';
import { ImageModal } from '@/components/ui/ImageModal';
// DELETED: import achievementsData from '@/data/achievements.json'; 

interface Achievement {
  id: number;
  eventName: string;
  location?: string;
  position: string;
  year: string;
  description?: string;
  images?: string[];
}

const AchievementsPage = () => {
  // 1. Change initial state to empty array
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Add Fetch Logic
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // This 'achievement' must match the filename in your JSON folder (e.g. achievement.json -> achievement)
        const response = await fetch('/admin/api/data/achievements'); 
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        
        // Ensure data is an array before setting it
        if (Array.isArray(data)) {
            setAchievements(data);
        } else {
            console.error("Data received is not an array:", data);
            setAchievements([]); 
        }
      } catch (error) {
        console.error("Error loading achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAchievement(null);
  };

  // 3. Optional: Add a simple Loading Spinner/Text
  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex justify-center items-center">
        <div className="text-xl text-white">Loading Achievements...</div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5"></div>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              Our Achievements
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              A testament to our dedication, innovation, and excellence in competitive robotics across the nation
            </p>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="container mx-auto px-4 pb-16">
        {/* Check if we have data */}
        {achievements.length === 0 ? (
           <div className="text-center text-white/60">No achievements found in database.</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => (
                <div
                key={achievement.id || index} // Fallback to index if DB doesn't have id
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                >
                <AchievementCard
                    eventName={achievement.eventName}
                    location={achievement.location}
                    position={achievement.position}
                    year={achievement.year}
                    description={achievement.description}
                    images={achievement.images}
                    onCardClick={() => handleAchievementClick(achievement)}
                />
                </div>
            ))}
            </div>
        )}
      </div>

      {/* Modal rendered at page level */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        images={selectedAchievement?.images || []}
        title={selectedAchievement?.eventName || ''}
        description={selectedAchievement?.description}
      />
    </div>
  );
};

export default AchievementsPage;