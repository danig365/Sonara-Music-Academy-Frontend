import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import LoadingSpinner from '../LoadingSpinner';
import AuditSummary from './AuditSummary';
import UploadLogsTable from './UploadLogsTable';
import PaymentLogsTable from './PaymentLogsTable';
import AccessLogsTable from './AccessLogsTable';
import './AuditLogsDashboard.css';

const AuditLogsDashboard = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch summary data on mount and when tab changes
  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/audit/summary/`);
      if (response.data.bool) {
        setSummaryData(response.data.summary);
      }
    } catch (err) {
      console.error('Error fetching audit summary:', err);
      setError('Failed to load audit summary data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchSummary();
  };

  const handleExport = async (logType) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/audit/export/${logType}/`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${logType}_logs.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
    } catch (err) {
      console.error('Error exporting logs:', err);
      setError('Failed to export logs');
    }
  };

  return (
    <div className="audit-logs-dashboard py-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="dashboard-header mb-4">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h2 className="mb-2">
              <i className="bi bi-shield-check"></i> Audit Logs Dashboard
            </h2>
            <p className="text-muted">
              Track all user access, file uploads, and payment transactions
            </p>
          </div>
          <div className="col-md-4 text-end">
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="btn btn-primary me-2"
            >
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </button>
            <div className="btn-group" role="group">
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => handleExport('uploads')}
                title="Download upload logs as CSV"
              >
                <i className="bi bi-download"></i> Uploads
              </button>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => handleExport('payments')}
                title="Download payment logs as CSV"
              >
                <i className="bi bi-download"></i> Payments
              </button>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => handleExport('access')}
                title="Download access logs as CSV"
              >
                <i className="bi bi-download"></i> Access
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-circle"></i> {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <LoadingSpinner size="md" text="Loading audit logs data..." />
        </div>
      )}

      {/* Tabs */}
      {!loading && (
        <div>
          <ul className="nav nav-tabs border-bottom mb-4" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'summary' ? 'active' : ''}`}
                onClick={() => setActiveTab('summary')}
                type="button"
                role="tab"
              >
                <i className="bi bi-graph-up"></i> Summary & Analytics
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'uploads' ? 'active' : ''}`}
                onClick={() => setActiveTab('uploads')}
                type="button"
                role="tab"
              >
                <i className="bi bi-cloud-upload"></i> Upload Logs
                {summaryData && (
                  <span className="badge bg-info ms-2">
                    {summaryData.uploads?.total || 0}
                  </span>
                )}
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={() => setActiveTab('payments')}
                type="button"
                role="tab"
              >
                <i className="bi bi-credit-card"></i> Payment Logs
                {summaryData && (
                  <span className="badge bg-success ms-2">
                    {summaryData.payments?.total || 0}
                  </span>
                )}
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'access' ? 'active' : ''}`}
                onClick={() => setActiveTab('access')}
                type="button"
                role="tab"
              >
                <i className="bi bi-door-open"></i> Access Logs
                {summaryData && (
                  <span className="badge bg-warning ms-2">
                    {summaryData.access?.total || 0}
                  </span>
                )}
              </button>
            </li>
          </ul>

          <div className="tab-content">
            {/* Summary Tab */}
            {activeTab === 'summary' && summaryData && (
              <AuditSummary data={summaryData} />
            )}

            {/* Upload Logs Tab */}
            {activeTab === 'uploads' && (
              <UploadLogsTable key={refreshKey} />
            )}

            {/* Payment Logs Tab */}
            {activeTab === 'payments' && (
              <PaymentLogsTable key={refreshKey} />
            )}

            {/* Access Logs Tab */}
            {activeTab === 'access' && (
              <AccessLogsTable key={refreshKey} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsDashboard;
