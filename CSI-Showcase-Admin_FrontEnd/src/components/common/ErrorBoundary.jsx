// src/components/common/ErrorBoundary.jsx
import React from 'react';
import { Button, Result } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // อัพเดตสถานะเพื่อแสดงหน้า fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // คุณสามารถบันทึกข้อผิดพลาดไปยังบริการบันทึกข้อผิดพลาดได้ที่นี่
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    // รีเซ็ตสถานะเพื่อพยายามโหลดคอมโพเนนต์อีกครั้ง
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      // คุณสามารถแสดง UI แบบกำหนดเองเมื่อเกิดข้อผิดพลาด
      return (
        <div className="p-8 flex justify-center items-center">
          <Result
            status="error"
            title="เกิดข้อผิดพลาดในแอปพลิเคชัน"
            subTitle="ขออภัย มีบางอย่างผิดพลาดเกิดขึ้น โปรดลองใหม่อีกครั้ง"
            extra={[
              <Button 
                type="primary" 
                key="retry" 
                icon={<ReloadOutlined />}
                onClick={this.handleReset}
              >
                ลองใหม่อีกครั้ง
              </Button>,
              <Button 
                key="reload" 
                onClick={() => window.location.reload()}
              >
                รีเฟรชหน้า
              </Button>
            ]}
          >
            <div className="mt-4 p-4 bg-gray-100 rounded text-sm font-mono overflow-auto max-h-48">
              {this.state.error && (
                <div className="mb-2 text-red-500">
                  <strong>Error:</strong> {this.state.error.toString()}
                </div>
              )}
            </div>
          </Result>
        </div>
      );
    }

    // ถ้าไม่มีข้อผิดพลาด แสดงคอมโพเนนต์ตามปกติ
    return this.props.children;
  }
}

export default ErrorBoundary;