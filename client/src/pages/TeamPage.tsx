// src/pages/TeamPage.tsx

import { useEffect, useState } from 'react';
import MemberCard from '../components/cards/MemberCard';

// Interface for a single team member
interface Member {
  id: number;
  name: string;
  role?: string;
  photo: string;
  year?: string;
  department?: string;
  status?: string;
}

// Updated props for the component
interface TeamPageProps {
  maxMembers?: number;
  title?: string;
  className?: string;
  showHeading?: boolean;       // To toggle the main title block
  filterStatus?: 'current';    // To show only one section
}

const TeamPage = ({
  maxMembers,
  title = "Our Team",
  showHeading = true, 
  filterStatus,
}: TeamPageProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA FROM MONGODB
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/admin/api/data/members');
        
        if (!response.ok) {
            throw new Error('Failed to fetch members');
        }
        
        const data = await response.json();
        
        // Ensure data is an array
        if (Array.isArray(data)) {
            setMembers(data);
        } else {
            console.error("Members data is not an array:", data);
            setMembers([]);
        }
      } catch (error) {
        console.error("Error loading team members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const currentMembers = members.filter(member => member.status === 'current');
  const pastMembers = members.filter(member => member.status === 'alumni');

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex justify-center items-center">
        <div className="text-xl text-white">Loading Team...</div>
      </div>
    );
  }

  return (
    <div className="bg-background"> {/* Simplified wrapper */}
      <div className="container mx-auto px-4 py-12">
        {/* The main heading is now conditional */}
        {showHeading && (
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              {title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Meet the amazing team behind ROBOSTREAKS!
            </p>
          </div>
        )}

        {/* Current Members: Renders if no filter is set, or if the filter is 'current' */}
        {(!filterStatus || filterStatus === 'current') && currentMembers.length > 0 && (
          <div className="mb-16">
            {/* Only show the "Current Members" subheading if it's the full page view */}
            {showHeading && <h2 className="text-3xl font-bold text-foreground mb-8">Current Members</h2>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {/* Slice the array to respect the maxMembers prop */}
              {currentMembers.slice(0, maxMembers).map((member, index) => (
                <MemberCard
                  key={member.id || index} // Fallback to index if DB id is missing
                  name={member.name}
                  role={member.role}
                  photo={member.photo}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past Members: Renders only on the full page (when no filter is active) */}
        {!filterStatus && pastMembers.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-8">Past Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {pastMembers.map((member, index) => (
                <MemberCard
                  key={member.id || `past-${index}`}
                  name={member.name}
                  role={member.role}
                  photo={member.photo}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;