import React, { useState } from 'react';
import { Check, FileSpreadsheet, UploadCloud } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import postApi from '../../services/postApi';

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadErrors, setUploadErrors] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Vui lòng chọn file Excel trước!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setMessage('');
    setUploadErrors([]);

    try {
      const res = await postApi.bulkUpload(formData);
      const errors = res.data.errors || [];
      setUploadErrors(errors);
      setMessage(`${res.data.success ? '✅' : '⚠️'} ${res.data.message || 'Upload hoàn tất.'}`);
    } catch (err) {
      setMessage(`❌ Lỗi upload: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Tải bài đăng hàng loạt">
      <div className="upload-layout">
        <section className="panel">
          <div className="panel-heading"><h2>Nhập lịch đăng từ Excel</h2><span className="muted">XLSX · XLS</span></div>
          <div className="panel-body">
            <div className="file-drop">
              <div>
                <span className="file-icon"><UploadCloud size={23} /></span>
                <strong>{file ? file.name : 'Chọn tệp lịch đăng của bạn'}</strong>
                <p className="muted">Kéo thả tệp vào đây hoặc <label htmlFor="excel-upload">duyệt trên máy tính</label></p>
                <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} id="excel-upload" hidden />
              </div>
            </div>
            <div className="compose-footer">
              <span className="muted">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Tối đa 20 MB'}</span>
              <button className="button button-primary" onClick={handleUpload} disabled={loading || !file} type="button">
                <FileSpreadsheet size={16} /> {loading ? 'Đang tải lên...' : 'Tải và lên lịch'}
              </button>
            </div>
            {message && (
              <div className="upload-result">
                <strong>{message}</strong>
                {uploadErrors.length > 0 && <ul>{uploadErrors.map((error) => <li key={`${error.row}-${error.message}`}>Dòng {error.row}: {error.message}</li>)}</ul>}
              </div>
            )}
          </div>
        </section>
        <aside className="panel">
          <div className="panel-heading"><h2>Trước khi tải lên</h2></div>
          <div className="panel-body upload-tips">
            <div className="tip-line"><Check size={16} className="tip-check" /> Sheet phải tên <strong>MAIN SHEET</strong>.</div>
            <div className="tip-line"><Check size={16} className="tip-check" /> Dùng đúng tên cột trong mẫu Excel của hệ thống.</div>
            <div className="tip-line"><Check size={16} className="tip-check" /> Lịch đăng dùng định dạng ngày giờ được hỗ trợ.</div>
            <a className="button button-secondary" href={postApi.templateUrl}>Mẫu Excel</a>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}