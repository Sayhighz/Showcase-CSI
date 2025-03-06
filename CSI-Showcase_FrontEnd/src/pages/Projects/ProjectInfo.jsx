// src/pages/Projects/ProjectInfo.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

const ProjectInfo = () => {
  const { id } = useParams();
  return (
    <div>
      <h2 className="text-3xl font-bold">Project Info: {id}</h2>
      <p>This is the page showing information for project {id}.</p>
    </div>
  );
};

export default ProjectInfo;
