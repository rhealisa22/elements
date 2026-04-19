import { useState, useRef, useCallback } from 'react';
import { useFlightStore } from '../store/flightStore';
import { parseEml } from '../services/emlParser';
import { recognizeImage } from '../services/ocrParser';
import { extractFlights, extractFlightsFromText } from '../services/flightParser';
import { mapParsedFlight } from '../services/flightMapper';
import type { ParsedFlight } from '../types';
import './ImportModal.css';

interface ImportModalProps {
  onClose: () => void;
}

type ModalState = 'upload' | 'processing' | 'results' | 'no-results' | 'error';

interface ProcessingStatus {
  fileName: string;
  type: 'eml' | 'image';
  progress: number;
}

export function ImportModal({ onClose }: ImportModalProps) {
  const { flights, addFlightsBatch } = useFlightStore();
  const [state, setState] = useState<ModalState>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState<ProcessingStatus | null>(null);
  const [results, setResults] = useState<ParsedFlight[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [labels, setLabels] = useState<Record<number, string>>({});
  const [labelError, setLabelError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingLabels = flights.map((f) => f.label?.toLowerCase()).filter(Boolean) as string[];

  const slotsRemaining = 8 - flights.length;

  const isAlreadyTracked = useCallback((parsed: ParsedFlight) => {
    return flights.some(
      (f) => f.flightNumber.replace(/\s/g, '') === parsed.flightNumber.replace(/\s/g, '') && f.date === parsed.date
    );
  }, [flights]);

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const allFlights: ParsedFlight[] = [];

    setState('processing');

    for (const file of fileArray) {
      const ext = file.name.toLowerCase().split('.').pop();
      const isImage = ['png', 'jpg', 'jpeg'].includes(ext || '') || file.type.startsWith('image/');
      const isEml = ext === 'eml';

      if (!isImage && !isEml) {
        continue;
      }

      try {
        if (isEml) {
          setProcessing({ fileName: file.name, type: 'eml', progress: 100 });
          const text = await file.text();
          const parsed = parseEml(text);
          const extracted = extractFlights(parsed.htmlBody, parsed.textBody, 'email');
          allFlights.push(...extracted);
        } else {
          setProcessing({ fileName: file.name, type: 'image', progress: 0 });
          const ocrText = await recognizeImage(file, (progress) => {
            setProcessing((prev) => prev ? { ...prev, progress } : null);
          });
          console.log('[Import] OCR text:', ocrText);
          const extracted = extractFlightsFromText(ocrText, 'screenshot');
          console.log('[Import] Extracted flights:', extracted);
          allFlights.push(...extracted);
        }
      } catch (err) {
        console.error('[Import] Error processing file:', file.name, err);
        continue;
      }
    }

    setProcessing(null);

    if (fileArray.length > 0 && fileArray.every((f) => {
      const ext = f.name.toLowerCase().split('.').pop();
      return !['png', 'jpg', 'jpeg', 'eml'].includes(ext || '') && !f.type.startsWith('image/');
    })) {
      setErrorMsg('Unsupported file type. Please use .eml, .png, or .jpg files.');
      setState('error');
      return;
    }

    if (allFlights.length === 0) {
      setState('no-results');
      return;
    }

    // Deduplicate by flight number + date
    const unique = allFlights.filter((f, i, arr) =>
      arr.findIndex((x) => x.flightNumber === f.flightNumber && x.date === f.date) === i
    );

    setResults(unique);
    // Auto-select non-tracked flights up to slots remaining
    const autoSelect = new Set<number>();
    let count = 0;
    unique.forEach((f, i) => {
      if (!isAlreadyTracked(f) && count < slotsRemaining) {
        autoSelect.add(i);
        count++;
      }
    });
    setSelected(autoSelect);
    setState('results');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const toggleSelect = (idx: number) => {
    const next = new Set(selected);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      // Check slot limit
      if (next.size >= slotsRemaining) return;
      next.add(idx);
    }
    setSelected(next);
  };

  const checkLabelDuplicate = (label: string, currentIdx: number): string | null => {
    if (!label.trim()) return null;
    const lower = label.trim().toLowerCase();
    if (existingLabels.includes(lower)) {
      return 'Label already exists!';
    }
    // Check against other labels in this import batch
    for (const [idxStr, other] of Object.entries(labels)) {
      if (Number(idxStr) !== currentIdx && other.trim().toLowerCase() === lower) {
        return 'Duplicate label in import!';
      }
    }
    return null;
  };

  const handleImport = () => {
    // Validate labels before importing
    for (const idx of selected) {
      const label = labels[idx];
      if (label) {
        const err = checkLabelDuplicate(label, idx);
        if (err) {
          setLabelError(err);
          return;
        }
      }
    }

    const toImport = results
      .map((parsed, i) => ({ parsed, i }))
      .filter(({ i }) => selected.has(i))
      .map(({ parsed, i }) => ({
        data: mapParsedFlight(parsed),
        label: labels[i]?.trim() || undefined,
      }));

    addFlightsBatch(toImport);
    onClose();
  };

  const reset = () => {
    setResults([]);
    setSelected(new Set());
    setLabels({});
    setLabelError(null);
    setErrorMsg('');
    setState('upload');
  };

  return (
    <div className="import-overlay" onClick={onClose}>
      <div className="import-modal pixel-border" onClick={(e) => e.stopPropagation()}>
        <div className="import-header">
          <span className="import-title">IMPORT FLIGHTS</span>
          <button type="button" className="remove-btn" onClick={onClose} aria-label="Close">
            x
          </button>
        </div>

        {state === 'upload' && (
          <div
            className={`import-dropzone${dragOver ? ' drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="dropzone-icons">
              <span className="dropzone-icon">✉</span>
              <span className="dropzone-icon">📷</span>
            </div>
            <p className="dropzone-text">
              Drop flight emails (.eml)<br />or screenshots here
            </p>
            <button
              className="pixel-btn primary"
              onClick={() => fileInputRef.current?.click()}
            >
              BROWSE FILES
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".eml,.png,.jpg,.jpeg,image/png,image/jpeg"
              multiple
              onChange={handleFileChange}
              className="file-input-hidden"
            />
            <p className="dropzone-hint">
              .eml, .png, .jpg supported
            </p>
          </div>
        )}

        {state === 'processing' && processing && (
          <div className="import-processing">
            <div className="processing-icon">
              {processing.type === 'eml' ? '✉' : '📷'}
            </div>
            <p className="processing-text">
              {processing.type === 'eml' ? 'PARSING EMAIL...' : 'READING IMAGE...'}
            </p>
            {processing.type === 'image' && (
              <div className="ocr-progress">
                <div className="ocr-progress-bar">
                  <div
                    className="ocr-progress-fill"
                    style={{ width: `${processing.progress}%` }}
                  />
                </div>
                <span className="ocr-progress-text">{processing.progress}%</span>
              </div>
            )}
            <p className="processing-file">{processing.fileName}</p>
          </div>
        )}

        {state === 'results' && (
          <div className="import-results">
            <div className="results-header">
              <span className="results-count">
                {results.length} FLIGHT{results.length !== 1 ? 'S' : ''} FOUND
              </span>
              <span className="slots-remaining">
                {slotsRemaining} SLOT{slotsRemaining !== 1 ? 'S' : ''} FREE
              </span>
            </div>

            <div className="results-list">
              {results.map((flight, idx) => {
                const tracked = isAlreadyTracked(flight);
                const isSelected = selected.has(idx);
                const disabled = tracked || (!isSelected && selected.size >= slotsRemaining);

                return (
                  <label
                    key={idx}
                    className={`result-item pixel-border${tracked ? ' already-tracked' : ''}${disabled && !tracked ? ' disabled' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={disabled}
                      onChange={() => toggleSelect(idx)}
                      className="result-checkbox"
                    />
                    <div className="result-info">
                      <div className="result-top">
                        <span className="result-flight">{flight.flightNumber}</span>
                        <span className={`result-confidence ${flight.confidence}`}>
                          {flight.confidence === 'high' ? 'HIGH' : 'MED'}
                        </span>
                        <span className="result-source">
                          {flight.source === 'email' ? '✉' : '📷'}
                        </span>
                      </div>
                      <div className="result-route">
                        {flight.origin}{flight.destination ? ` → ${flight.destination}` : ''}
                      </div>
                      {!flight.dateDetected ? (
                        <div className="result-date-edit">
                          <label className="result-date-label">DATE:</label>
                          <input
                            type="date"
                            className="pixel-input result-date-input"
                            value={flight.date}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const updated = [...results];
                              updated[idx] = { ...flight, date: e.target.value };
                              setResults(updated);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="result-route">{flight.date}</div>
                      )}
                      {!tracked && (
                        <div className="result-label-edit">
                          <input
                            type="text"
                            className="pixel-input result-label-input"
                            placeholder="Label (optional)"
                            value={labels[idx] || ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              setLabels((prev) => ({ ...prev, [idx]: e.target.value }));
                              setLabelError(null);
                            }}
                            autoComplete="off"
                          />
                        </div>
                      )}
                      {tracked && (
                        <span className="result-tracked">ALREADY TRACKED</span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {labelError && <div className="import-label-error">{labelError}</div>}

            <div className="import-actions">
              <button className="pixel-btn" onClick={reset}>
                BACK
              </button>
              <button
                className="pixel-btn primary"
                onClick={handleImport}
                disabled={selected.size === 0}
              >
                IMPORT {selected.size > 0 ? `(${selected.size})` : 'SELECTED'}
              </button>
            </div>
          </div>
        )}

        {state === 'no-results' && (
          <div className="import-empty">
            <div className="empty-icon">?</div>
            <p className="empty-msg">NO FLIGHTS FOUND</p>
            <p className="empty-tips">
              Make sure the screenshot clearly<br />
              shows the flight number and airports.
            </p>
            <button className="pixel-btn" onClick={reset}>
              TRY AGAIN
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="import-empty">
            <div className="empty-icon">!</div>
            <p className="empty-msg">COULD NOT READ FILE</p>
            <p className="empty-tips">{errorMsg}</p>
            <button className="pixel-btn" onClick={reset}>
              TRY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
