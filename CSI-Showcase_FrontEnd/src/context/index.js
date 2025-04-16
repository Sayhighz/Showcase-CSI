/**
 * Export context ทั้งหมดจากไฟล์ context
 * ไฟล์นี้รวบรวม context ทั้งหมดที่ใช้ในแอปพลิเคชัน
 * เพื่อให้การ import context ทำได้ที่จุดเดียว
 */

import { AuthContext, AuthProvider, useAuthContext } from './AuthContext';
import { ProjectContext, ProjectProvider, useProjectContext } from './ProjectContext';
import { UploadContext, UploadProvider, useUploadContext } from './UploadContext';
import { SearchContext, SearchProvider, useSearchContext } from './SearchContext';
import { ThemeContext, ThemeProvider, useThemeContext } from './ThemeContext';

// Export แต่ละ Context
export {
  // Auth Context
  AuthContext,
  AuthProvider,
  useAuthContext,
  
  // Project Context
  ProjectContext,
  ProjectProvider,
  useProjectContext,
  
  // Upload Context
  UploadContext,
  UploadProvider,
  useUploadContext,
  
  // Search Context
  SearchContext,
  SearchProvider,
  useSearchContext,
  
  // Theme Context
  ThemeContext,
  ThemeProvider,
  useThemeContext
};

/**
 * App Providers Component
 * Component ที่รวม Provider ทั้งหมดเข้าด้วยกัน
 * ใช้สำหรับครอบ component ทั้งหมดในแอปพลิเคชัน
 * @param {Object} props - Props ของ component
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} - App Providers component
 */
export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ProjectProvider>
          <UploadProvider>
            <SearchProvider>
              {children}
            </SearchProvider>
          </UploadProvider>
        </ProjectProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

// Default export
export default {
  AuthContext,
  AuthProvider,
  useAuthContext,
  ProjectContext,
  ProjectProvider,
  useProjectContext,
  UploadContext,
  UploadProvider,
  useUploadContext,
  SearchContext,
  SearchProvider,
  useSearchContext,
  ThemeContext,
  ThemeProvider,
  useThemeContext,
  AppProviders
};