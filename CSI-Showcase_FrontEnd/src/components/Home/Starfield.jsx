import React from 'react';
import './Starfield.css';

const Starfield = () => {
  const generateStars = (className, count, size) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
     const style = {
      position: 'absolute',
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 2000}px`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: 'white',
      borderRadius: '50%',
      opacity: Math.random() * 0.5 + 0.5,
      boxShadow: `0 0 ${size * 2}px rgba(255, 255, 255, 0.5)`,
     };
     stars.push(<div key={i} style={style} />);
    }
    return <div className={className}>{stars}</div>;
   };

  return (
    <div className="stars">
      {generateStars('stars-sm', 150, 1)}
      {generateStars('stars-md', 70, 2)}
      {generateStars('stars-lg', 30, 3)}
    </div>
  );
};
export default Starfield;