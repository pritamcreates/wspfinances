import React, { useState, useEffect } from 'react';
import { X, Search, FileText, Trash2, DownloadCloud } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { db, collection, getDocs, query, orderBy, deleteDoc, doc, setDoc } from '../lib/firebase';
import { fmt, fmtDate } from '../lib/utils';
import '../styles/records.css';

export default function RecordsModal({ user }) {
  const { 
    isRecordsOpen, setIsRecordsOpen,
    setDocType, setDocNum, setClient, setProject, setDate,
    setValidDays, setDueDate, setNotes, setAdvance,
    setCategories, setDynamicServices
  } = useAppContext();

  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isRecordsOpen && user) {
      loadRecords();
    }
  }, [isRecordsOpen, user]);

  const loadRecords = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'users', user.uid, 'records'), orderBy('savedAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setRecords(data);
    } catch (e) {
      console.error('Error loading records:', e);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this record permanently?')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'records', String(id)));
        setRecords(records.filter(r => r.id !== id));
      } catch (e) {
        console.error('Delete error', e);
      }
    }
  };

  const handleLoad = (r) => {
    setDocType(r.type);
    setDocNum(r.docnum === '—' ? '' : r.docnum);
    setClient(r.client === 'Unnamed Client' ? '' : r.client);
    setProject(r.project === '—' ? '' : r.project);
    setDate(r.date);
    setNotes(r.notes);
    if (r.type === 'invoice') {
      setDueDate(r.dueDate);
      setAdvance(r.advance || 0);
    }
    if (r.type === 'quotation') setValidDays(r.validDays);
    setCategories([...r.cats]);

    if (r.dynamicServices) {
      // New format
      setDynamicServices(r.dynamicServices);
    } else if (r.rawServices) {
      // Legacy format migration
      const migrated = [];
      const defaultStyle = { fontWeight: 'normal', fontStyle: 'normal', fontSize: '13px' };
      
      if (r.rawServices.photo) {
        migrated.push({
          id: Date.now() + 1,
          name: 'Photography',
          rate: r.rates?.photo || 15000,
          days: r.days?.photo || 1,
          gear: r.gearItems?.photo || [],
          descText: r.descs?.photo || '',
          descStyle: r.svcDescStyle?.photo || defaultStyle
        });
      }
      
      if (r.rawServices.video) {
        migrated.push({
          id: Date.now() + 2,
          name: 'Videography',
          rate: r.rates?.video || 15000,
          days: r.days?.video || 1,
          gear: r.gearItems?.video || [],
          descText: r.descs?.video || '',
          descStyle: r.svcDescStyle?.video || defaultStyle
        });
      }
      
      if (r.rawServices.express) {
        migrated.push({
          id: Date.now() + 3,
          name: 'Express Delivery',
          rate: 5000,
          days: 1,
          gear: [],
          descText: '',
          descStyle: defaultStyle
        });
      }

      if (r.additionalItems && r.additionalItems.length > 0) {
        r.additionalItems.forEach((a, idx) => {
          migrated.push({
            id: Date.now() + 4 + idx,
            name: a.desc || '',
            rate: a.amount || 0,
            days: 1,
            gear: [],
            descText: a.descText || '',
            descStyle: a.descStyle || defaultStyle
          });
        });
      }
      
      setDynamicServices(migrated);
    } else {
      setDynamicServices([]);
    }
    setIsRecordsOpen(false);
  };

  if (!isRecordsOpen) return null;

  const filteredRecords = filter === 'all' ? records : records.filter(r => r.type === filter);

  return (
    <div className="modal-overlay" onClick={() => setIsRecordsOpen(false)}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title"><FileText size={20} /> Saved Records</h2>
          <button className="btn-close" onClick={() => setIsRecordsOpen(false)}><X size={20} /></button>
        </div>

        <div className="modal-filters">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-btn ${filter === 'quotation' ? 'active' : ''}`} onClick={() => setFilter('quotation')}>Quotations</button>
          <button className={`filter-btn ${filter === 'invoice' ? 'active' : ''}`} onClick={() => setFilter('invoice')}>Invoices</button>
          <span className="filter-count">{filteredRecords.length} records</span>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">Loading records...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="empty-state">No records found.</div>
          ) : (
            <div className="records-list">
              {filteredRecords.map(r => (
                <div key={r.id} className="record-item">
                  <div className="record-info">
                    <span className={`badge ${r.type}`}>{r.type}</span>
                    <span className="ref">{r.docnum}</span>
                    <span className="client">{r.client}</span>
                    <span className="date">{fmtDate(r.date)}</span>
                    <span className="total">{fmt(r.total)}</span>
                  </div>
                  <div className="record-actions">
                    <button className="btn-action-small" onClick={() => handleLoad(r)}>
                      <DownloadCloud size={14} /> Load
                    </button>
                    <button className="btn-action-small danger" onClick={() => handleDelete(r.id)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
