import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams hook
import SearchBar from '../../components/SearchBar/SearchBar';
import ProjectDetails from '../../components/ProjectDetails/ProjectDetails';
import AuthorsList from '../../components/AuthorsList/AuthorsList';
import RelatedProjects from '../../components/RelatedProjects/RelatedProjects';
import { axiosGet } from '../../lib/axios'; // Assuming axiosGet is available to fetch data

const ProjectInfo = () => {
  const { projectId } = useParams(); // Extract projectId from URL params
  const [projectinfo, setProjectinfo] = useState(null); // State to store project data
  const [relatedProjects, setRelatedProjects] = useState([]); // State to store related projects
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch project data and related projects when component mounts
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectData = await axiosGet(`/projects/project/${projectId}`);
        setProjectinfo(projectData);
        console.log(projectData)
        // Assuming you have a route for related projects
        const relatedData = await axiosGet(`/projects/latest`);
        setRelatedProjects(relatedData);
      } catch (err) {
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  if (error) {
    return <div>{error}</div>; // Show error message
  }

  return (
    <div className="flex flex-col items-center w-full py-10 px-4 mt-20">
      <SearchBar />
      {projectinfo ? (
        <>
          <ProjectDetails project={projectinfo} /> {/* Show project details */}
          <AuthorsList authors={projectinfo.authors} /> {/* Show authors */}
          <RelatedProjects projects={relatedProjects} /> {/* Show related projects */}
        </>
      ) : (
        <div>Project not found</div>
      )}
    </div>
  );
};

export default ProjectInfo;
