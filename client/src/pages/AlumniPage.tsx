import { useEffect, useState } from 'react';
import AlumniCard from '@/components/cards/AlumniCard';
import FounderCard from '@/components/cards/FoundersCard';

interface Alumni {
  id: number;
  name: string;
  phone: string;
  email: string;
  image: string;
  batch: string;
  currentPosition: string;
}

const AlumniPage = () => {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await fetch('/admin/api/data/alumni');
        
        if (!response.ok) {
            throw new Error('Failed to fetch alumni data');
        }
        
        const data = await response.json();
        
        // Safety check: ensure data is an array
        if (Array.isArray(data)) {
            setAlumni(data);
        } else {
            console.error("Alumni data is not an array:", data);
            setAlumni([]); 
        }
      } catch (error) {
        console.error("Error loading Alumni:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex justify-center items-center">
        <div className="text-xl text-white">Loading Alumni...</div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Our Alumni
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Proud graduates making their mark in the world of technology and innovation
          </p>
        </div>

        {/* Memorial Section */}
        <FounderCard/>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {alumni.length > 0 ? (
            alumni.map((person, index) => (
              <AlumniCard
                key={person.id || index} // Fallback to index if DB id is missing
                name={person.name}
                phone={person.phone}
                email={person.email}
                image={person.image}
                batch={person.batch}
                currentPosition={person.currentPosition}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-10">
              No alumni records found in the database.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniPage;