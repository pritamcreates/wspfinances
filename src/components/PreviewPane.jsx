import React from 'react';
import { useAppContext } from '../context/AppContext';
import { db, doc, setDoc } from '../lib/firebase';
import { fmtDate, fmt, amountInWords } from '../lib/utils';
import html2pdf from 'html2pdf.js';
const qrImg = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Whitescreen';
const blackLogo = '/wspfinances/logoblack.png';
const signImg = 'https://placehold.co/150x50/FFFFFF/000000?text=Signature';
import '../styles/preview.css';

export default function PreviewPane({ user }) {
  const {
    docType, docNum, client, project, date, validDays, dueDate,
    notes, advance, categories, dynamicServices, totals
  } = useAppContext();

  const handlePrint = () => {
    document.title = `WSP-${docType === 'quotation' ? 'Quotation' : 'Invoice'}-${client || 'Client'}${docNum ? '-'+docNum : ''}`;
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('pdf-content');
    
    // Temporarily remove gap to prevent height miscalculations during export
    const originalGap = element.style.gap;
    element.style.gap = '0px';

    const filename = `WSP-${docType === 'quotation' ? 'Quotation' : 'Invoice'}-${client || 'Client'}${docNum ? '-'+docNum : ''}.pdf`;
    
    const opt = {
      margin:       0,
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: 'css', after: '.page-break' }
    };
    
    await html2pdf().set(opt).from(element).save();
    
    // Restore gap for web preview
    element.style.gap = originalGap;
  };

  const handleSaveRecord = async () => {
    if (!user) return;
    if (!client && !docNum) {
      alert('Please enter at least a client name or document number before saving.');
      return;
    }

    const svcList = dynamicServices.map(s => s.name || 'Unnamed Service');

    const record = {
      id: Date.now(),
      type: docType,
      docnum: docNum || '—',
      client: client || 'Unnamed Client',
      project: project || '—',
      date: date || '',
      dueDate: dueDate || '',
      validDays,
      notes,
      total: totals.grandTotal, // Updated to save the grand total with VAT
      advance,
      services: svcList,
      cats: [...categories],
      savedAt: new Date().toISOString(),
      dynamicServices: JSON.parse(JSON.stringify(dynamicServices)) // Deep copy
    };

    try {
      await setDoc(doc(db, 'users', user.uid, 'records', String(record.id)), record);
      alert('Record saved to cloud successfully.');
    } catch (e) {
      console.error('Error saving record', e);
      alert('Error saving to cloud. Check your connection.');
    }
  };

  const chunkLines = (lines) => {
    const pages = [];
    let remaining = [...lines];
    let pageNum = 1;

    if (remaining.length === 0) {
      return [{ lines: [], isFirst: true, isLast: true, pageNum: 1 }];
    }

    while (remaining.length > 0) {
      const isFirst = pageNum === 1;
      let maxItems = isFirst ? (remaining.length <= 4 ? 4 : 5) : (remaining.length <= 6 ? 6 : 8);
      
      const chunk = remaining.slice(0, maxItems);
      remaining = remaining.slice(maxItems);
      
      pages.push({
        lines: chunk,
        isFirst,
        isLast: remaining.length === 0,
        pageNum
      });
      
      pageNum++;
    }
    
    return pages;
  };

  const pages = chunkLines(totals.lines);

  return (
    <div className="preview-container">
      <div id="pdf-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', alignItems: 'center' }}>
        {pages.map((page, pageIdx) => (
          <div className={`doc-sheet ${!page.isLast ? 'page-break' : ''}`} key={pageIdx}>
            {page.isFirst && (
              <>
                <div className="sheet-top">
                  <div className="sheet-brand">
                    <img src={blackLogo} alt="White Screen Production" style={{ height: '75px', objectFit: 'contain' }} />
                  </div>
                  <div className="sheet-doc-type">
                    <div className="sheet-doc-label">{docType === 'quotation' ? 'QUOTATION' : 'INVOICE'}</div>
                    <div className="sheet-ref">REF {docNum || '—'}</div>
                  </div>
                </div>

                <div className="sheet-meta">
                  <div className="sheet-meta-cell">
                    <div className="meta-label">Client</div>
                    <div className="meta-value">{client || '—'}</div>
                  </div>
                  <div className="sheet-meta-cell">
                    <div className="meta-label">Project</div>
                    <div className="meta-value">{project || '—'}</div>
                  </div>
                  <div className="sheet-meta-cell">
                    <div className="meta-label">{docType === 'quotation' ? 'Date' : 'Invoice Date'}</div>
                    <div className="meta-value">{fmtDate(date)}</div>
                  </div>
                  <div className="sheet-meta-cell">
                    <div className="meta-label">{docType === 'quotation' ? 'Valid For' : 'Payment Due'}</div>
                    <div className="meta-value">
                      {docType === 'quotation' ? `${validDays} days` : fmtDate(dueDate)}
                    </div>
                  </div>
                </div>

                <div className="sheet-cat-row">
                  {categories.length === 0 ? (
                    <span className="sheet-cat-badge" style={{ color: 'var(--mid)', borderStyle: 'dashed' }}>
                      No category selected
                    </span>
                  ) : (
                    categories.map(c => <span key={c} className="sheet-cat-badge">{c}</span>)
                  )}
                </div>
              </>
            )}

            {!page.isFirst && (
              <div className="sheet-top" style={{ marginBottom: '20px' }}>
                <div className="sheet-brand">
                  <img src={blackLogo} alt="White Screen Production" style={{ height: '50px', objectFit: 'contain' }} />
                </div>
                <div className="sheet-doc-type">
                  <div className="sheet-doc-label" style={{ fontSize: '24px' }}>{docType === 'quotation' ? 'QUOTATION' : 'INVOICE'}</div>
                  <div className="sheet-ref">REF {docNum || '—'} (Page {page.pageNum})</div>
                </div>
              </div>
            )}

            <div className="sheet-items">
              <div className="items-header">
                <span>Description</span>
                <span>Rate</span>
                <span>Days/Units</span>
                <span>Amount</span>
              </div>
              <div className="line-items">
                {page.lines.length === 0 && page.isFirst ? (
                  <div className="line-empty">Add services to preview</div>
                ) : (
                  page.lines.map((l, i) => (
                    <div key={i} className="line-item">
                      <div>
                        <div className="line-desc">{l.desc}</div>
                        {l.sub && <div className="line-sub">{l.sub}</div>}
                        {l.note && (
                          <div className="line-desc-note" style={{ whiteSpace: 'pre-wrap', ...l.style }}>
                            {l.note}
                          </div>
                        )}
                      </div>
                      <div className="line-num">{l.rate ? fmt(l.rate) : ''}</div>
                      <div className="line-num">{l.days || ''}</div>
                      <div className="line-num">{fmt(l.amount)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {page.isLast && (
              <>
                <div className="sheet-totals-block">
                  <div className="totals-row">
                    <span className="totals-row-label">Sub Total</span>
                    <span className="totals-row-value">{fmt(totals.subtotal)}</span>
                  </div>
                  {totals.discountAmt > 0 && (
                    <div className="totals-row">
                      <span className="totals-row-label">Discount</span>
                      <span className="totals-row-value">-{fmt(totals.discountAmt)}</span>
                    </div>
                  )}
                  {totals.discountAmt > 0 && (
                    <div className="totals-row">
                      <span className="totals-row-label">Taxable Amount</span>
                      <span className="totals-row-value">{fmt(totals.taxableAmount)}</span>
                    </div>
                  )}
                  <div className="totals-row">
                    <span className="totals-row-label">13% VAT</span>
                    <span className="totals-row-value">{fmt(totals.vatAmount)}</span>
                  </div>
                  
                  {docType === 'quotation' ? (
                    <div className="totals-row grand">
                      <span className="totals-row-label">Grand Total</span>
                      <span className="totals-row-value">{fmt(totals.grandTotal)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="totals-row">
                        <span className="totals-row-label">Grand Total</span>
                        <span className="totals-row-value">{fmt(totals.grandTotal)}</span>
                      </div>
                      {totals.tdsAmount > 0 && (
                        <div className="totals-row advance">
                          <span className="totals-row-label">Less: TDS (1.5%)</span>
                          <span className="totals-row-value">-{fmt(totals.tdsAmount)}</span>
                        </div>
                      )}
                      <div className="totals-row advance">
                        <span className="totals-row-label">Advance Received</span>
                        <span className="totals-row-value">{fmt(totals.advance)}</span>
                      </div>
                      <div className="totals-row balance grand">
                        <span className="totals-row-label">Balance Due</span>
                        <span className="totals-row-value">{fmt(totals.balance)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="sheet-amount-words">
                  <span className="amount-words-label">In Words:</span>
                  <span className="amount-words-value">
                    {amountInWords(docType === 'quotation' ? totals.grandTotal : (totals.balance > 0 ? totals.balance : totals.grandTotal))}
                  </span>
                </div>

                {docType === 'invoice' && (
                  <div className="bank-details-block">
                    <div className="bank-info">
                      <h4>Bank Details</h4>
                      <p><strong>Account Name:</strong> White Screen Production</p>
                      <p><strong>Account Number:</strong> 1501017501226</p>
                      <p><strong>Bank:</strong> Nabil Bank</p>
                      <p><strong>Branch:</strong> Maharajgunj</p>
                    </div>
                    <img src={qrImg} alt="Bank QR" className="qr-img" />
                  </div>
                )}

                {docType === 'invoice' && (
                  <div className="payment-due-row">
                    <span>Payment Due</span>
                    <span>{fmtDate(dueDate)}</span>
                  </div>
                )}

                {docType === 'quotation' && (
                  <div className="valid-row">
                    Valid for <strong>{validDays}</strong> days from date of issue.
                  </div>
                )}

                {notes && <div className="sheet-notes">{notes}</div>}

                {docType !== 'quotation' && (
                  <div className="sheet-signature">
                    <div className="signature-wrapper">
                      <img src={signImg} alt="Authorized Signature" className="signature-img" />
                      <div className="signature-line">Authorized Signature</div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="sheet-footer">
              <div className="footer-contact">
                +977 9768570000<br/>
                info@whitescreen.com.np<br/>
                www.whitescreen.com.np<br/>
                {docType === 'invoice' && (
                  <span style={{ fontSize: '10px', color: '#999', marginTop: '8px', display: 'block' }}>
                    * This is a proforma invoice. The official tax invoice will be provided separately upon settlement.
                  </span>
                )}
              </div>
              <div className="footer-brand">
                <img src={blackLogo} alt="White Screen" style={{ height: '32px', objectFit: 'contain', opacity: 0.3 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="action-row">
        <button className="btn-action btn-secondary" onClick={handlePrint}>Print</button>
        <button className="btn-action btn-primary" onClick={handleDownloadPDF}>Download PDF</button>
        <button className="btn-save-record" onClick={handleSaveRecord}>Save Record</button>
      </div>
    </div>
  );
}
