/**
 * Mandi ERP - Document Attachments Manager (دستاویزات اور بل منسلکات)
 * Handles:
 * - Weight Slip / Weighbridge Ticket (کانٹا پرچی)
 * - Expenses Bill / Labour & Karaya Receipts (اخراجات و مزدوری بل)
 * - Sales Bill / Gate Pass / Bilty (فروخت بل و گیٹ پاس)
 * 100% Offline storage (Base64 data URLs), mobile camera capture, full preview modal
 */

import React, { useState, useRef } from 'react';
import {
  Paperclip,
  Camera,
  Upload,
  Eye,
  Trash2,
  Download,
  FileText,
  Scale,
  Receipt,
  Truck,
  CheckCircle2,
  X,
  Printer,
  ZoomIn,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { DocumentAttachment, DocumentAttachmentType } from '../types';
import {
  createSampleWeightSlipSvg,
  createSampleExpenseBillSvg,
  createSampleSalesBillSvg
} from '../utils/sampleDocuments';

interface DocumentAttachmentsManagerProps {
  attachments: DocumentAttachment[];
  onChange: (attachments: DocumentAttachment[]) => void;
  voucherNo?: string;
  voucherType?: 'PURCHASE' | 'SALE' | 'TRANSFER' | 'EXPENSE';
  partyName?: string;
  grossWeight?: number;
  tareWeight?: number;
  totalAmount?: number;
  bags?: number;
  vehicleNo?: string;
  readOnly?: boolean;
}

export const DocumentAttachmentsManager: React.FC<DocumentAttachmentsManagerProps> = ({
  attachments,
  onChange,
  voucherNo = 'PUR-001',
  voucherType = 'PURCHASE',
  partyName = 'Farmer / Party',
  grossWeight = 14000,
  tareWeight = 4000,
  totalAmount = 250000,
  bags = 200,
  vehicleNo = 'MN-4421',
  readOnly = false
}) => {
  const [selectedDocType, setSelectedDocType] = useState<DocumentAttachmentType>(
    voucherType === 'PURCHASE' ? 'weight_slip' : voucherType === 'SALE' ? 'sales_bill' : 'expenses_bill'
  );
  const [docNotes, setDocNotes] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<DocumentAttachment | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      const newAttachment: DocumentAttachment = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        type: selectedDocType,
        fileType: file.type || 'image/jpeg',
        dataUrl,
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        notes: docNotes.trim() || undefined
      };
      onChange([...attachments, newAttachment]);
      setDocNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleAddSampleSlip = (type: DocumentAttachmentType) => {
    let dataUrl = '';
    let name = '';

    if (type === 'weight_slip') {
      dataUrl = createSampleWeightSlipSvg(voucherNo, vehicleNo, grossWeight, tareWeight, partyName);
      name = `Weight_Slip_${voucherNo}.svg`;
    } else if (type === 'expenses_bill') {
      dataUrl = createSampleExpenseBillSvg(voucherNo, 12500, partyName);
      name = `Expenses_Bill_${voucherNo}.svg`;
    } else if (type === 'sales_bill' || type === 'gate_pass') {
      dataUrl = createSampleSalesBillSvg(voucherNo, totalAmount, partyName, bags);
      name = `Sales_Bill_GatePass_${voucherNo}.svg`;
    } else {
      dataUrl = createSampleWeightSlipSvg(voucherNo, vehicleNo, grossWeight, tareWeight, partyName);
      name = `Document_${voucherNo}.svg`;
    }

    const newAttachment: DocumentAttachment = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      type,
      fileType: 'image/svg+xml',
      dataUrl,
      sizeBytes: 15400,
      uploadedAt: new Date().toISOString(),
      notes: `Verified Mandi Slip for ${partyName}`
    };

    onChange([...attachments, newAttachment]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this attached document? / کیا آپ یہ دستاویز ختم کرنا چاہتے ہیں؟')) {
      onChange(attachments.filter(a => a.id !== id));
      if (previewAttachment?.id === id) setPreviewAttachment(null);
    }
  };

  const getDocTypeBadge = (type: DocumentAttachmentType) => {
    switch (type) {
      case 'weight_slip':
        return {
          labelEn: 'Weight Slip',
          labelUrdu: 'کانٹا پرچی',
          color: 'bg-blue-100 text-blue-900 border-blue-200',
          icon: Scale
        };
      case 'expenses_bill':
        return {
          labelEn: 'Expenses Bill',
          labelUrdu: 'اخراجات بل',
          color: 'bg-amber-100 text-amber-900 border-amber-200',
          icon: Receipt
        };
      case 'sales_bill':
        return {
          labelEn: 'Sales Bill',
          labelUrdu: 'فروخت کا بل',
          color: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          icon: FileText
        };
      case 'gate_pass':
        return {
          labelEn: 'Gate Pass',
          labelUrdu: 'گیٹ پاس / بلٹی',
          color: 'bg-purple-100 text-purple-900 border-purple-200',
          icon: Truck
        };
      default:
        return {
          labelEn: 'Document',
          labelUrdu: 'دستاویز',
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: Paperclip
        };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Paperclip className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Attached Documents & Bills</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.2 rounded-full font-mono text-[10px]">
                {attachments.length} files
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-urdu leading-tight">
              کانٹا پرچی، اخراجات کے بل اور خریدار کی رسیدیں منسلک کریں
            </p>
          </div>
        </div>

        {/* QUICK SAMPLES BUTTONS */}
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleAddSampleSlip('weight_slip')}
              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
              title="Attach auto-generated verified weighbridge slip"
            >
              <Scale className="w-3 h-3 text-blue-600" />
              <span>+ Sample Weight Slip</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddSampleSlip('expenses_bill')}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
              title="Attach sample labour / karaya expense receipt"
            >
              <Receipt className="w-3 h-3 text-amber-600" />
              <span>+ Sample Expense Bill</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddSampleSlip('sales_bill')}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
              title="Attach sample sales bill or gate pass"
            >
              <Truck className="w-3 h-3 text-emerald-600" />
              <span>+ Sample Sales Bill</span>
            </button>
          </div>
        )}
      </div>

      {/* UPLOAD / CAMERA BAR (When not readOnly) */}
      {!readOnly && (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span>Document Type:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'weight_slip' as DocumentAttachmentType, labelEn: 'Weight Slip', labelUrdu: 'کانٹا پرچی', icon: Scale },
                { id: 'expenses_bill' as DocumentAttachmentType, labelEn: 'Expenses Bill', labelUrdu: 'اخراجات بل', icon: Receipt },
                { id: 'sales_bill' as DocumentAttachmentType, labelEn: 'Sales Bill', labelUrdu: 'فروخت بل', icon: FileText },
                { id: 'gate_pass' as DocumentAttachmentType, labelEn: 'Gate Pass', labelUrdu: 'گیٹ پاس', icon: Truck },
              ].map(t => {
                const isSelected = selectedDocType === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedDocType(t.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.labelEn}</span>
                    <span className="text-[10px] opacity-80 font-urdu">{t.labelUrdu}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={docNotes}
              onChange={e => setDocNotes(e.target.value)}
              placeholder="Optional notes (e.g. Weighbridge Slip # 4982, Mazdoori paid to Ramzan)..."
              className="flex-1 w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
            />

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              {/* File Picker */}
              <label className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition active:scale-95">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File (فائل منتخب کریں)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Mobile Phone Camera Snap */}
              <label className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition active:scale-95" title="Snap photo using mobile camera">
                <Camera className="w-3.5 h-3.5" />
                <span>Snap Photo (کیمرہ)</span>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ATTACHMENTS LIST & THUMBNAILS */}
      {attachments.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <Paperclip className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
          <div className="text-xs font-semibold text-slate-600">No documents attached yet</div>
          <div className="text-[11px] text-slate-400 font-urdu mt-0.5">
            کانٹا پرچی یا اخراجات کا بل منسلک کرنے کے لیے اوپر دیا گیا بٹن دبائیں
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {attachments.map(doc => {
            const badge = getDocTypeBadge(doc.type);
            const BadgeIcon = badge.icon;
            const isImage = doc.fileType.startsWith('image/') || doc.dataUrl.startsWith('data:image/');

            return (
              <div
                key={doc.id}
                className="group border border-slate-200 hover:border-emerald-300 rounded-xl p-3 bg-white hover:bg-emerald-50/20 transition shadow-2xs flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-start gap-2.5">
                  {/* Thumbnail */}
                  <div
                    onClick={() => setPreviewAttachment(doc)}
                    className="w-14 h-14 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer relative group/thumb"
                  >
                    {isImage ? (
                      <img
                        src={doc.dataUrl}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-6 h-6 text-slate-500" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border flex items-center gap-1 ${badge.color}`}>
                        <BadgeIcon className="w-2.5 h-2.5" />
                        <span>{badge.labelEn}</span>
                        <span className="font-urdu text-[9px]">({badge.labelUrdu})</span>
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-900 truncate" title={doc.name}>
                      {doc.name}
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono">
                      {(doc.sizeBytes / 1024).toFixed(1)} KB · {new Date(doc.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {doc.notes && (
                      <div className="text-[11px] text-slate-600 truncate italic mt-0.5" title={doc.notes}>
                        "{doc.notes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewAttachment(doc)}
                    className="text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1 text-[11px]"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>View Full (دیکھیں)</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={doc.dataUrl}
                      download={doc.name}
                      className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                        title="Delete attachment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL SCREEN DOCUMENT PREVIEW MODAL */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Top Bar */}
            <div className="bg-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-bold truncate max-w-md">
                    {previewAttachment.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Type: <span className="capitalize font-semibold text-emerald-300">{previewAttachment.type.replace('_', ' ')}</span> · {(previewAttachment.sizeBytes / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewAttachment.dataUrl}
                  download={previewAttachment.name}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const printWin = window.open('', '_blank');
                    if (printWin) {
                      printWin.document.write(`<html><head><title>${previewAttachment.name}</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;"><img src="${previewAttachment.dataUrl}" style="max-width:100%;max-height:100vh;"/></body></html>`);
                      printWin.document.close();
                      printWin.focus();
                      setTimeout(() => printWin.print(), 500);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Preview */}
            <div className="flex-1 overflow-auto bg-slate-950 p-4 flex items-center justify-center min-h-[300px]">
              {previewAttachment.fileType.startsWith('image/') || previewAttachment.dataUrl.startsWith('data:image/') ? (
                <img
                  src={previewAttachment.dataUrl}
                  alt={previewAttachment.name}
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s' }}
                  className="max-h-[70vh] max-w-full object-contain shadow-2xl rounded-lg border border-slate-800"
                />
              ) : (
                <div className="text-center text-white space-y-2 p-8">
                  <FileText className="w-16 h-16 text-slate-500 mx-auto" />
                  <p className="text-sm font-semibold">PDF Document Preview</p>
                  <p className="text-xs text-slate-400">Please download the file to view full PDF document content.</p>
                  <a
                    href={previewAttachment.dataUrl}
                    download={previewAttachment.name}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF File</span>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Zoom:</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-mono font-bold"
                >
                  -
                </button>
                <span className="font-mono text-slate-700 w-12 text-center">{(zoomLevel * 100).toFixed(0)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(Math.min(2.5, zoomLevel + 0.2))}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-mono font-bold"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] text-slate-600"
                >
                  Reset
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close (بند کریں)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
