import React from 'react';

const AuthorsList = ({ authors }) => {
  return (
    <div className="max-w-4xl w-full mt-6">
      <h3 className="text-lg font-bold mt-6 text-center">โดย</h3>
      <div className="flex justify-center gap-6 mt-4">
        {authors.map((author, index) => (
          <div key={index} className="flex flex-col items-center">
            <img src={author.image} alt={author.name} className="w-16 h-16 rounded-full object-cover" />
            <p className="mt-2 text-sm font-semibold">{author.name}</p>
            <p className="text-sm text-gray-500">{author.id}</p>
            <p className="text-sm text-gray-500">ชั้นปีที่ {author.year}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthorsList;
