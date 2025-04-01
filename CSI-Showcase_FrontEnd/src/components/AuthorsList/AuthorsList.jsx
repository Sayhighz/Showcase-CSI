import React from 'react';

const AuthorsList = ({ authors }) => {
  console.log("authors data:", authors);

  if (!authors || !Array.isArray(authors)) {
    return <div>No authors available</div>;
  }

  return (
    <div className="max-w-4xl w-full mt-16 relative">
      {/* Space-themed decorative background elements */}
      <div className="absolute -z-10 inset-0 overflow-hidden opacity-10">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white"></div>
        <div className="absolute top-3/4 left-1/2 w-1 h-1 rounded-full bg-white"></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-white"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 rounded-full bg-white"></div>
        <div className="absolute top-1/2 right-1/2 w-2 h-2 rounded-full bg-white"></div>
      </div>
      
      {/* Authors section with space theme */}
      <div className="relative">
        <h3 className="text-xl font-bold text-center relative inline-block left-1/2 transform -translate-x-1/2">
          <span className="relative z-10 text-white px-6 py-1">
            โดย
          </span>
          <span className="absolute inset-0 bg-[#90278E] rounded-full transform -skew-x-6"></span>
        </h3>
        
        <div className="flex justify-center gap-8 mt-8">
          {authors.length > 0 ? (
            authors.map((author, index) => (
              <div key={index} className="flex flex-col items-center group">
                {/* Author image with space-themed frame */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#90278E] to-[#FF5E8C] rounded-full transform scale-110 opacity-0 group-hover:opacity-60 group-hover:scale-125 transition-all duration-300"></div>
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#90278E] relative z-10 group-hover:border-white transition-colors duration-300">
                    <img 
                      src={author.image} 
                      alt={author.fullName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Space-themed glow effect */}
                  <div className="absolute inset-0 bg-[#90278E] rounded-full blur-md opacity-20 group-hover:opacity-50 group-hover:blur-xl transition-all duration-300"></div>
                </div>
                
                {/* Author name with hover effect */}
                <p className="mt-3 text-base font-semibold relative">
                  <span className="relative z-10 group-hover:text-[#90278E] transition-colors duration-300">
                    {author.fullName}
                  </span>
                </p>
                
                {/* Author ID with space theme */}
                <p className="text-sm text-[#90278E]/80 group-hover:text-[#FF5E8C] transition-colors duration-300">
                  {author.userId}
                </p>
                
                {/* Decorative element below author */}
                <div className="h-0.5 w-0 bg-gradient-to-r from-transparent via-[#90278E] to-transparent mt-2 group-hover:w-full transition-all duration-500"></div>
              </div>
            ))
          ) : (
            <div className="py-4 px-6 bg-[#0D0221]/10 rounded-lg text-[#90278E]">
              No authors listed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorsList;