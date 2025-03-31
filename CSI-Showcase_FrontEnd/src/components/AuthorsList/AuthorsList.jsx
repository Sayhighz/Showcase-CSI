import React from 'react';

const AuthorsList = ({ authors }) => {
  console.log("authors data:", authors);

  if (!authors || !Array.isArray(authors)) {
    return <div>No authors available</div>;  // Show a fallback message if authors are not available or not an array
  }

  return (
    <div className="max-w-4xl w-full mt-6">
      <h3 className="text-lg font-bold mt-6 text-center">โดย</h3>
      <div className="flex justify-center gap-6 mt-4">
        {authors.length > 0 ? (
          authors.map((author, index) => (
            <div key={index} className="flex flex-col items-center">
              <img 
                src={author.image} 
                alt={author.fullName} 
                className="w-16 h-16 rounded-full object-cover" 
              />
              <p className="mt-2 text-sm font-semibold">{author.fullName}</p>
              <p className="text-sm text-gray-500">{author.userId}</p>
            </div>
          ))
        ) : (
          <div>No authors listed</div>  // Show a message if there are no authors
        )}
      </div>
    </div>
  );
};

export default AuthorsList;
