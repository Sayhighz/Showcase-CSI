import React from 'react';
import SearchBar from '../../components/SearchBar/SearchBar';
import ProjectDetails from '../../components/ProjectDetails/ProjectDetails';
import AuthorsList from '../../components/AuthorsList/AuthorsList';
import RelatedProjects from '../../components/RelatedProjects/RelatedProjects';

const sampleProject = {
  title: 'ระบบดับเพลิง',
  type: 'ประเภทที่สอง', // Updated to trigger the PDF download button
  description: 'ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง',
  date: 'Jan 1 2025',
  images: [
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGhvdG9ncmFwaHl8ZW58MHx8MHx8fDA%3D',
    'https://via.placeholder.com/600x300/aaaaaa',
    'https://via.placeholder.com/600x300/cccccc'
  ],
  video: 'https://www.tiktok.com/@nick_kratka/video/7474237560135486751?is_from_webapp=1&sender_device=pc',
  
  // ✅ Multiple PDF Files
  pdfFiles: [
    {
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      name: 'คู่มือระบบดับเพลิง.pdf'
    },
    {
      url: 'https://www.africau.edu/images/default/sample.pdf',
      name: 'รายงานผลการทดสอบ.pdf'
    },
    {
      url: 'https://gahp.net/wp-content/uploads/2017/09/sample.pdf',
      name: 'แผนการป้องกันภัย.pdf'
    }
  ],

  authors: [
    { name: 'นาย กอ ขอ', id: '66031242', year: '1', image: 'https://via.placeholder.com/64' },
    { name: 'นาย ข ขวด', id: '66031243', year: '2', image: 'https://via.placeholder.com/64' },
    { name: 'นาย ค ควาย', id: '66031244', year: '3', image: 'https://via.placeholder.com/64' },
    { name: 'นาย ง งู', id: '66031245', year: '4', image: 'https://via.placeholder.com/64' },
  ]
};

const relatedProjects = [
  {
    title: 'ระบบดับเพลิง',
    description: 'ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง',
    image: 'https://via.placeholder.com/150',
    date: '2 Feb 2025',
    projectLink: '/project/1'
  },
  {
    title: 'ระบบดับเพลิง',
    description: 'ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง',
    image: 'https://via.placeholder.com/150',
    date: '2 Feb 2025',
    projectLink: '/project/2'
  },
  {
    title: 'ระบบดับเพลิง',
    description: 'ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง',
    image: 'https://via.placeholder.com/150',
    date: '2 Feb 2025',
    projectLink: '/project/3'
  }
];

const ProjectInfo = () => {
  return (
    <div className="flex flex-col items-center w-full py-10 px-4 mt-20">
      <SearchBar />
      <ProjectDetails project={sampleProject} /> {/* ✅ Now handles multiple PDFs */}
      <AuthorsList authors={sampleProject.authors} />
      <RelatedProjects projects={relatedProjects} />
    </div>
  );
};

export default ProjectInfo;
