import React, { useEffect, useState } from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProjectDetails } from '../services/projectService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { ROLES } from '../constants/userRoles';

const PrivateProjectRoute = ({ children }) => {
  const params = useParams();
  const { user, isAuthenticated, hasRole } = useAuth();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessChecked, setAccessChecked] = useState(false);

  // ดึง project id จาก params
  const projectId = params.id;

  // เพิ่มตัวแปร state เพื่อป้องกันการทำงานซ้ำซ้อน
  const [fetchAttempted, setFetchAttempted] = useState(false);

  useEffect(() => {
    // ถ้าเคย fetch แล้ว ไม่ทำซ้ำ
    if (fetchAttempted) return;

    const fetchProject = async () => {
      if (!projectId) {
        console.log("No project ID found in URL params");
        setIsLoading(false);
        setError("ไม่พบ Project ID");
        return;
      }

      try {
        console.log("Fetching project details for ID:", projectId);
        setFetchAttempted(true); // ทำเครื่องหมายว่าได้พยายาม fetch แล้ว
        
        const projectData = await getProjectDetails(projectId);
        
        console.log("Project data received:", projectData);
        if (!projectData) {
          throw new Error('ไม่พบข้อมูลโปรเจค');
        }
        
        setProject(projectData);
        setAccessChecked(true);
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError(err.message || 'ไม่สามารถดึงข้อมูลโปรเจคได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, fetchAttempted]);

  // แสดงสถานะ loading เฉพาะเมื่อยังไม่ได้ข้อมูล
  if (isLoading) {
    return <LoadingSpinner fullPage tip="กำลังตรวจสอบสิทธิ์การเข้าถึง..." />;
  }

  // ถ้ามีข้อผิดพลาดหรือไม่พบโครงการ
  if (error || !project) {
    return (
      <ErrorMessage 
        title="ไม่สามารถเข้าถึงโปรเจคได้" 
        message={error || "ไม่พบโปรเจคที่ต้องการ หรือคุณไม่มีสิทธิ์เข้าถึง"}
        status={403}
      />
    );
  }

  // ตรวจสอบการเข้าถึง (เมื่อมีข้อมูลโครงการแล้ว)
  // ถ้าโปรเจคเป็นสาธารณะ อนุญาตให้เข้าถึงได้ทันที
  if (project.visibility === 1) {
    console.log("Project is public - granting access");
    return children;
  }

  // ถ้าไม่ได้เข้าสู่ระบบ ไม่อนุญาตให้เข้าถึง
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ตรวจสอบว่าเป็นเจ้าของโปรเจคหรือไม่
  const creatorId = project.creator?.id || project.user_id;
  const isProjectOwner = creatorId && user?.id && creatorId.toString() === user.id.toString();
  
  // ตรวจสอบว่าเป็นผู้ดูแลระบบหรืออาจารย์หรือไม่
  const isAdminOrTeacher = hasRole([ROLES.ADMIN, ROLES.TEACHER]);

  // อนุญาตให้เข้าถึงหากเป็นเจ้าของโปรเจค หรือเป็นผู้ดูแลระบบหรืออาจารย์
  if (isProjectOwner || isAdminOrTeacher) {
    return children;
  }

  // ไม่อนุญาตให้เข้าถึงในกรณีอื่นๆ
  return (
    <ErrorMessage 
      title="ไม่มีสิทธิ์เข้าถึง" 
      message="คุณไม่มีสิทธิ์เข้าถึงโปรเจคนี้ เนื่องจากเป็นโปรเจคส่วนตัว"
      status={403}
    />
  );
};

export default PrivateProjectRoute;