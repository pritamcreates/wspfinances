import React from 'react';
import { LogOut, FileText, FileSpreadsheet, ClipboardList } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { signOut, auth } from '../lib/firebase';
import '../styles/topbar.css';

export default function TopBar({ user }) {
  const { docType, setDocType, docNum, setIsRecordsOpen } = useAppContext();

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-brand">
          <img src="whitelogo.png" alt="White Screen" className="topbar-logo" />
        </div>
        
        <div className="doc-toggles">
          <button 
            className={`toggle-btn ${docType === 'quotation' ? 'active' : ''}`}
            onClick={() => setDocType('quotation')}
          >
            <FileText size={16} />
            <span>Quotation</span>
          </button>
          <button 
            className={`toggle-btn ${docType === 'invoice' ? 'active' : ''}`}
            onClick={() => setDocType('invoice')}
          >
            <FileSpreadsheet size={16} />
            <span>Invoice</span>
          </button>
        </div>
      </div>

      <div className="topbar-right">
        <button className="btn-records glass-panel" onClick={() => setIsRecordsOpen(true)}>
          <ClipboardList size={16} />
          <span>Records</span>
        </button>
        
        <div className="topbar-ref glass-panel">
          {docNum || '—'}
        </div>

        <div className="user-profile">
          {user?.photoURL && <img src={user.photoURL} alt="User" className="user-avatar" />}
          <span className="user-name">{user?.displayName || user?.email}</span>
        </div>

        <button className="btn-signout glass-panel" onClick={handleSignOut} title="Sign Out">
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
