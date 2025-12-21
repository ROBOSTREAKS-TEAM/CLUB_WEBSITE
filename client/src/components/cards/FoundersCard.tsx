import React from 'react';

// --- 1. The Reusable Founder Card Component ---
// (Previously MemorialCard)

interface FounderCardProps {
    name: string;
    image: string;
    batch: string;
    position: string;
    message: string;
}

const FounderCard = ({ name, image, batch, position, message }: FounderCardProps) => {
    return (
        <div className="col-span-full mb-12">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-gray-600/30 shadow-2xl active:scale-[0.98] transition-all duration-300">
                <div className="p-6 sm:p-8">
                    <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
                        {/* Image Section */}
                        <div className="flex-shrink-0 mx-auto md:mx-0">
                            <div className="relative">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-amber-400/50 shadow-xl">
                                    <img
                                        src={image}
                                        alt={name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {/* Halo effect */}
                                <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-400/20 via-yellow-300/20 to-amber-400/20 blur-md -z-10"></div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                            <div className="mb-4 sm:mb-6">
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
                                    {name}
                                </h2>
                                <div className="flex items-center justify-center md:justify-start space-x-3 sm:space-x-4 text-amber-200 mb-4 sm:mb-6">
                                    <span className="text-base sm:text-lg font-medium">{batch}</span>
                                    <span className="w-1 h-1 bg-amber-200 rounded-full"></span>
                                    <span className="text-sm font-medium">{position}</span>
                                </div>
                            </div>

                            {/* Founder's Message/Description */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 mb-4 sm:mb-6">
                                <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
                                    {message}
                                </p>
                            </div>

                            {/* Legacy Quote (Updated Text) */}
                            <div>
                                <p className="text-amber-200/80 italic text-base sm:text-lg font-medium mb-2">
                                    "The visionaries who started it all."
                                </p>
                                <p className="text-gray-400 text-xs sm:text-sm">
                                    A legacy of innovation and inspiration.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- 2. The Founders Section Component ---
// This component displays the cards for both founders.

const FoundersSection = () => {
    const foundersData = [
        
        {
            name: "Sumit Kumar Satapathy",
            image: "/assets/alumni/founders/sumit.jpg", // Replace with actual image URL
            batch: "Founding Batch",
            position: "Founder",
            message: "Sumit Kumar Satapathy's strategic vision and passion for community building were key to the club's early growth. He fostered an environment of collaboration and learning that continues to this day."
        },
        {
            name: "Sai Pavan",
            image: "/assets/alumni/founders/saipavan.jpg", // Replace with actual image URL
            batch: "Founding Batch",
            position: "Founder",
            message: "Sai Pavan's leadership and technical acumen were instrumental in establishing the club's foundation. His drive to push the boundaries of robotics set a high standard for all future members."
        }
    ];

    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">Meet Our Founders</h1>
                    <p className="text-lg text-gray-400 mt-4">The pioneers who laid the groundwork for our success.</p>
                </div>
                <div className="grid grid-cols-1">
                    {foundersData.map((founder) => (
                        <FounderCard
                            key={founder.name}
                            name={founder.name}
                            image={founder.image}
                            batch={founder.batch}
                            position={founder.position}
                            message={founder.message}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FoundersSection;