import React, { useState } from 'react';
import { Plus, Trash2, RefreshCcw, Bold, Italic, Type } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import '../styles/formbuilder.css';

export default function FormBuilder() {
  const {
    docType, docNum, setDocNum, client, setClient, project, setProject,
    date, setDate, validDays, setValidDays, dueDate, setDueDate,
    notes, setNotes, advance, setAdvance, categories, setCategories,
    dynamicServices, setDynamicServices
  } = useAppContext();

  const [catInput, setCatInput] = useState('');

  const generateRef = () => {
    const prefix = docType === 'quotation' ? 'WSP-Q' : 'WSP-INV';
    const rand = Math.floor(Math.random() * 900 + 100);
    setDocNum(`${prefix}-${new Date().getFullYear()}-${rand}`);
  };

  const addCategory = () => {
    if (catInput.trim()) {
      setCategories([...categories, catInput.trim()]);
      setCatInput('');
    }
  };

  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  // Dynamic Service Helpers
  const addService = () => {
    setDynamicServices([
      ...dynamicServices,
      {
        id: Date.now(),
        name: '',
        rate: '',
        days: 1,
        gear: [],
        descText: '',
        descStyle: { fontWeight: 'normal', fontStyle: 'normal', fontSize: '13px' }
      }
    ]);
  };

  const removeService = (id) => {
    setDynamicServices(dynamicServices.filter(s => s.id !== id));
  };

  const updateService = (id, field, value) => {
    setDynamicServices(dynamicServices.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const updateServiceStyle = (id, property, value) => {
    setDynamicServices(dynamicServices.map(s => {
      if (s.id === id) {
        return { ...s, descStyle: { ...s.descStyle, [property]: value } };
      }
      return s;
    }));
  };

  const adjustDays = (id, delta) => {
    setDynamicServices(dynamicServices.map(s => {
      if (s.id === id) {
        return { ...s, days: Math.max(0, (Number(s.days) || 0) + delta) };
      }
      return s;
    }));
  };

  // Gear within Service
  const addGear = (svcId) => {
    setDynamicServices(dynamicServices.map(s => {
      if (s.id === svcId) {
        return { ...s, gear: [...(s.gear || []), { id: Date.now(), desc: '', amount: '' }] };
      }
      return s;
    }));
  };

  const updateGear = (svcId, gearId, field, value) => {
    setDynamicServices(dynamicServices.map(s => {
      if (s.id === svcId) {
        return {
          ...s,
          gear: s.gear.map(g => g.id === gearId ? { ...g, [field]: value } : g)
        };
      }
      return s;
    }));
  };

  const removeGear = (svcId, gearId) => {
    setDynamicServices(dynamicServices.map(s => {
      if (s.id === svcId) {
        return { ...s, gear: s.gear.filter(g => g.id !== gearId) };
      }
      return s;
    }));
  };

  return (
    <div className="form-builder">
      {/* Document Info */}
      <div className="form-section glass-panel">
        <h3 className="section-title">Document Info</h3>
        <div className="field">
          <label>{docType === 'quotation' ? 'Quotation Number' : 'Invoice Number'}</label>
          <div className="input-group">
            <input type="text" value={docNum} onChange={e => setDocNum(e.target.value)} />
            <button className="btn-icon" onClick={generateRef} title="Regenerate"><RefreshCcw size={16} /></button>
          </div>
        </div>
        <div className="field">
          <label>Client Name</label>
          <input type="text" placeholder="e.g. Himalayan Foods Pvt. Ltd." value={client} onChange={e => setClient(e.target.value)} />
        </div>
        <div className="field">
          <label>Project Name</label>
          <input type="text" placeholder="e.g. Product Catalogue Shoot" value={project} onChange={e => setProject(e.target.value)} />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          {docType === 'quotation' ? (
            <div className="field">
              <label>Valid For (days)</label>
              <input type="number" value={validDays} onChange={e => setValidDays(Number(e.target.value))} />
            </div>
          ) : (
            <div className="field">
              <label>Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="form-section glass-panel">
        <h3 className="section-title">Project Category</h3>
        <div className="cat-list">
          {categories.map((c, i) => (
            <div key={i} className="cat-tag">
              {c}
              <button onClick={() => removeCategory(i)}>&times;</button>
            </div>
          ))}
        </div>
        <div className="input-group mt-2">
          <input 
            type="text" 
            placeholder="Add category..." 
            value={catInput} 
            onChange={e => setCatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
          />
          <button className="btn-primary-small" onClick={addCategory}>Add</button>
        </div>
      </div>

      {/* Services */}
      <div className="form-section glass-panel">
        <h3 className="section-title">Services</h3>
        {dynamicServices.map((svc) => (
          <div key={svc.id} className="service-card active">
            <div className="service-header" style={{ paddingBottom: '8px' }}>
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Service Name (e.g., Photography, Videography)" 
                  value={svc.name}
                  onChange={e => updateService(svc.id, 'name', e.target.value)}
                  style={{ fontSize: '15px', fontWeight: 600 }}
                />
                <button className="btn-icon danger" onClick={() => removeService(svc.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="service-body">
              <div className="field-row">
                <div className="field">
                  <label>Rate per Day/Unit (Rs)</label>
                  <input 
                    type="number" 
                    value={svc.rate} 
                    onChange={e => updateService(svc.id, 'rate', e.target.value)} 
                    placeholder="e.g. 15000"
                  />
                </div>
                <div className="field">
                  <label>Days / Units</label>
                  <div className="days-control">
                    <button onClick={() => adjustDays(svc.id, -1)}>−</button>
                    <input 
                      type="number" 
                      value={svc.days} 
                      onChange={e => updateService(svc.id, 'days', e.target.value)} 
                    />
                    <button onClick={() => adjustDays(svc.id, 1)}>+</button>
                  </div>
                </div>
              </div>

              {/* Gear / Additional Items for this Service */}
              <div className="field gear-section">
                <label>Add-ons / Gear</label>
                {(svc.gear || []).map(g => (
                  <div key={g.id} className="gear-item">
                    <input 
                      type="text" 
                      placeholder="Gear description" 
                      value={g.desc} 
                      onChange={e => updateGear(svc.id, g.id, 'desc', e.target.value)} 
                    />
                    <input 
                      type="number" 
                      placeholder="Amount" 
                      value={g.amount} 
                      onChange={e => updateGear(svc.id, g.id, 'amount', e.target.value)} 
                    />
                    <button className="btn-icon danger" onClick={() => removeGear(svc.id, g.id)}><Trash2 size={14}/></button>
                  </div>
                ))}
                <button className="btn-add-outline" onClick={() => addGear(svc.id)}>
                  <Plus size={14} /> Add Gear / Item
                </button>
              </div>

              {/* Rich Text Description */}
              <div className="field mt-2">
                <label>Detailed Description</label>
                <div className="rich-toolbar">
                  <button 
                    className={`rich-btn ${svc.descStyle.fontWeight === 'bold' ? 'active' : ''}`}
                    onClick={() => updateServiceStyle(svc.id, 'fontWeight', svc.descStyle.fontWeight === 'bold' ? 'normal' : 'bold')}
                    title="Bold"
                  >
                    <Bold size={14} />
                  </button>
                  <button 
                    className={`rich-btn ${svc.descStyle.fontStyle === 'italic' ? 'active' : ''}`}
                    onClick={() => updateServiceStyle(svc.id, 'fontStyle', svc.descStyle.fontStyle === 'italic' ? 'normal' : 'italic')}
                    title="Italic"
                  >
                    <Italic size={14} />
                  </button>
                  <select 
                    className="rich-select" 
                    value={svc.descStyle.fontSize || '13px'}
                    onChange={(e) => updateServiceStyle(svc.id, 'fontSize', e.target.value)}
                    title="Font Size"
                  >
                    <option value="11px">Small</option>
                    <option value="13px">Normal</option>
                    <option value="15px">Large</option>
                  </select>
                </div>
                <textarea 
                  placeholder="Describe what is included..."
                  value={svc.descText}
                  onChange={e => updateService(svc.id, 'descText', e.target.value)}
                  rows={3}
                  style={svc.descStyle}
                />
              </div>
            </div>
          </div>
        ))}

        <button className="btn-add-outline mt-2" onClick={addService}>
          <Plus size={16} /> Add Service
        </button>
      </div>

      {/* Notes & Terms */}
      <div className="form-section glass-panel">
        <h3 className="section-title">Notes & Terms</h3>
        {docType === 'invoice' && (
          <div className="field mb-3">
            <label>Advance Received (Rs)</label>
            <input type="number" value={advance} onChange={e => setAdvance(Number(e.target.value))} />
          </div>
        )}
        <div className="field">
          <label>Internal Note / Message to Client</label>
          <textarea 
            rows={4} 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder="Payment terms, special instructions..." 
          />
        </div>
      </div>
    </div>
  );
}
