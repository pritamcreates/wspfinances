import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);
  const [docType, setDocType] = useState('quotation'); // 'quotation' | 'invoice'
  const [docNum, setDocNum] = useState('');
  const [client, setClient] = useState('');
  const [project, setProject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validDays, setValidDays] = useState(14);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [advance, setAdvance] = useState(0);
  
  const [categories, setCategories] = useState(['Food Shoot']);
  const [dynamicServices, setDynamicServices] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [tdsEnabled, setTdsEnabled] = useState(false);

  // Calculate totals
  const totals = useMemo(() => {
    let subtotal = 0;
    const lines = [];

    dynamicServices.forEach(svc => {
      // Base service
      const rate = Number(svc.rate) || 0;
      const days = Number(svc.days) || 0;
      const baseAmount = rate * days;
      
      if (svc.name || baseAmount > 0) {
        subtotal += baseAmount;
        lines.push({
          desc: svc.name || 'Unnamed Service',
          sub: '',
          rate: rate,
          days: days,
          amount: baseAmount,
          note: svc.descText,
          style: svc.descStyle
        });
      }

      // Gear items for this service
      if (svc.gear && svc.gear.length > 0) {
        svc.gear.forEach(g => {
          const gearAmt = Number(g.amount) || 0;
          if (g.desc || gearAmt > 0) {
            subtotal += gearAmt;
            lines.push({ desc: g.desc || 'Gear', amount: gearAmt });
          }
        });
      }
    });

    const discountAmt = Number(discount) || 0;
    const taxableAmount = Math.max(0, subtotal - discountAmt);
    const vatAmount = taxableAmount * 0.13;
    const grandTotal = taxableAmount + vatAmount;
    const tdsAmount = tdsEnabled ? (taxableAmount * 0.015) : 0;
    const balance = Math.max(0, grandTotal - tdsAmount - (Number(advance) || 0));

    return { 
      subtotal, 
      discountAmt,
      taxableAmount,
      vatAmount, 
      grandTotal, 
      tdsAmount,
      balance, 
      advance: Number(advance) || 0, 
      lines 
    };
  }, [dynamicServices, advance, discount, tdsEnabled]);

  // Generate Reference
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!docNum || docNum.startsWith('WSP-Q-') || docNum.startsWith('WSP-INV-')) {
      const prefix = docType === 'quotation' ? 'WSP-Q' : 'WSP-INV';
      const rand = Math.floor(Math.random() * 900 + 100);
      setDocNum(`${prefix}-${new Date().getFullYear()}-${rand}`);
    }
  }, [docType]);

  const value = {
    isRecordsOpen, setIsRecordsOpen,
    docType, setDocType,
    docNum, setDocNum,
    client, setClient,
    project, setProject,
    date, setDate,
    validDays, setValidDays,
    dueDate, setDueDate,
    notes, setNotes,
    advance, setAdvance,
    categories, setCategories,
    dynamicServices, setDynamicServices,
    discount, setDiscount,
    tdsEnabled, setTdsEnabled,
    totals
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => useContext(AppContext);
