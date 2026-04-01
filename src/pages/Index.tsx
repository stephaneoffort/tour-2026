import { useState, useRef, useCallback } from 'react';
import headerBanner from '@/assets/header-banner.jpg';
import { COUNTRY_CODES, COUNTRIES, type TourFormData } from '@/lib/formData';
import { downloadPDF, generatePDF } from '@/lib/generatePdf';
import { supabase } from '@/integrations/supabase/client';

const INITIAL: TourFormData = {
  center_name: '', city: '', country: '',
  p1_firstname: '', p1_lastname: '', p1_code: '', p1_phone: '', p1_email: '',
  p2_firstname: '', p2_lastname: '', p2_code: '', p2_phone: '', p2_email: '',
  start_day: '', start_month: '', end_day: '', end_month: '',
  start_day_alt: '', start_month_alt: '', end_day_alt: '', end_month_alt: '',
  start_day2: '', start_month2: '', end_day2: '', end_month2: '',
  start_day2_alt: '', start_month2_alt: '', end_day2_alt: '', end_month2_alt: '',
  topics: '', empowerments: '', comments: '',
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-body font-semibold text-[0.85rem] tracking-[0.18em] uppercase text-gold py-3 px-[18px] bg-secondary/10 border-l-[3px] border-gold mb-7">
      {children}
    </h2>
  );
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-[0.82rem] font-semibold tracking-[0.1em] uppercase text-bgray">
      {children}
    </label>
  );
}

const inputClass =
  "bg-foreground/5 border border-foreground/10 border-b-2 border-b-secondary text-foreground font-body text-base font-light px-3.5 py-3 outline-none transition-all duration-250 w-full rounded-sm focus:border-b-gold focus:bg-primary/[0.07] focus:shadow-[0_4px_18px_hsl(var(--primary)/0.08)] placeholder:text-foreground/25 placeholder:italic appearance-none";

const selectClass = inputClass + " bg-no-repeat bg-[right_12px_center] pr-[34px] cursor-pointer";

const selectBgStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23C9963A' stroke-width='1.8' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
};

function PersonBlock({
  num, data, onChange
}: {
  num: 1 | 2;
  data: TourFormData;
  onChange: (field: keyof TourFormData, value: string) => void;
}) {
  const prefix = `p${num}_` as const;
  const required = num === 1;

  return (
    <div className="border border-secondary/25 border-t-2 border-t-secondary px-5 pt-5 pb-3.5 mb-5 bg-navy/[0.07]">
      <h3 className="font-display font-semibold text-[1.15rem] text-gold-light mb-[18px] tracking-[0.04em]">
        Person responsible {num}{num === 2 && <span className="ml-2 text-[0.85rem] text-bgray/60 font-normal tracking-normal normal-case">(optional)</span>}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div className="flex flex-col gap-[7px]">
          <FieldLabel htmlFor={`${prefix}firstname`}>First name</FieldLabel>
          <input id={`${prefix}firstname`} className={inputClass} value={data[`${prefix}firstname`]} onChange={e => onChange(`${prefix}firstname`, e.target.value)} required={required} />
        </div>
        <div className="flex flex-col gap-[7px]">
          <FieldLabel htmlFor={`${prefix}lastname`}>Last name</FieldLabel>
          <input id={`${prefix}lastname`} className={inputClass} value={data[`${prefix}lastname`]} onChange={e => onChange(`${prefix}lastname`, e.target.value)} required={required} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div className="flex flex-col gap-[7px]">
          <FieldLabel htmlFor={`${prefix}phone`}>Phone</FieldLabel>
          <div className="grid grid-cols-[120px_1fr] gap-2 sm:grid-cols-[180px_1fr] sm:gap-5">
            <select id={`${prefix}code`} className={selectClass} style={selectBgStyle} value={data[`${prefix}code`]} onChange={e => onChange(`${prefix}code`, e.target.value)}>
              <option value="">Code</option>
              {COUNTRY_CODES.map(([code, country]) => (
                <option key={code} value={code} className="bg-navy text-foreground">{code}  {country}</option>
              ))}
            </select>
            <input id={`${prefix}phone`} className={inputClass} value={data[`${prefix}phone`]} onChange={e => onChange(`${prefix}phone`, e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-[7px]">
          <FieldLabel htmlFor={`${prefix}email`}>Email</FieldLabel>
          <input id={`${prefix}email`} type="email" className={inputClass} placeholder="@example.com" value={data[`${prefix}email`]} onChange={e => onChange(`${prefix}email`, e.target.value)} required={required} />
        </div>
      </div>
    </div>
  );
}


function isEndBeforeStart(sd: string, sm: string, ed: string, em: string): boolean {
  if (!sd || !sm || !ed || !em) return false;
  const start = parseInt(sm, 10) * 100 + parseInt(sd, 10);
  const end = parseInt(em, 10) * 100 + parseInt(ed, 10);
  return end < start;
}

function DateRow({
  startDayField, startMonthField, endDayField, endMonthField,
  data, onChange, required = false,
}: {
  startDayField: keyof TourFormData; startMonthField: keyof TourFormData;
  endDayField: keyof TourFormData; endMonthField: keyof TourFormData;
  data: TourFormData; onChange: (f: keyof TourFormData, v: string) => void;
  required?: boolean;
}) {
  const startDay   = data[startDayField]   as string;
  const startMonth = data[startMonthField] as string;
  const endDay     = data[endDayField]     as string;
  const endMonth   = data[endMonthField]   as string;

  const startValue = startMonth && startDay ? `2026-${startMonth}-${startDay}` : '';
  const endValue   = endMonth && endDay     ? `2026-${endMonth}-${endDay}`     : '';

  const handleDateChange = (value: string, dayField: keyof TourFormData, monthField: keyof TourFormData) => {
    if (!value) {
      onChange(dayField, '');
      onChange(monthField, '');
      return;
    }
    const [, month, day] = value.split('-');
    onChange(monthField, month);
    onChange(dayField, day);
  };

  const invalid = isEndBeforeStart(startDay, startMonth, endDay, endMonth);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <h4 className="text-[0.82rem] font-semibold tracking-[0.1em] uppercase text-gold mb-3">Start date — 2026</h4>
          <div className="flex flex-col gap-[7px]">
            <FieldLabel htmlFor={`date_${startDayField}`}>Date</FieldLabel>
            <input
              id={`date_${startDayField}`}
              type="date"
              min="2026-01-01"
              max="2026-12-31"
              value={startValue}
              onChange={e => handleDateChange(e.target.value, startDayField, startMonthField)}
              required={required}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <h4 className="text-[0.82rem] font-semibold tracking-[0.1em] uppercase text-gold mb-3">End date — 2026</h4>
          <div className="flex flex-col gap-[7px]">
            <FieldLabel htmlFor={`date_${endDayField}`}>Date</FieldLabel>
            <input
              id={`date_${endDayField}`}
              type="date"
              min="2026-01-01"
              max="2026-12-31"
              value={endValue}
              onChange={e => handleDateChange(e.target.value, endDayField, endMonthField)}
              required={required}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {invalid && (
        <p className="mt-3 text-[0.78rem] text-red-400 flex items-center gap-1.5">
          <span>⚠</span> End date must be after the start date.
        </p>
      )}
    </div>
  );
}

export default function Index() {
  const [data, setData] = useState<TourFormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [wantsCopy, setWantsCopy] = useState(false);
  const [showAltA, setShowAltA] = useState(false);
  const [showAltB, setShowAltB] = useState(false);
  const [copyEmail, setCopyEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastData = useRef<TourFormData | null>(null);

  const onChange = useCallback((field: keyof TourFormData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity();
      return;
    }

    const datePairs: [keyof TourFormData, keyof TourFormData, keyof TourFormData, keyof TourFormData][] = [
      ['start_day', 'start_month', 'end_day', 'end_month'],
      ['start_day_alt', 'start_month_alt', 'end_day_alt', 'end_month_alt'],
      ['start_day2', 'start_month2', 'end_day2', 'end_month2'],
      ['start_day2_alt', 'start_month2_alt', 'end_day2_alt', 'end_month2_alt'],
    ];
    const hasInvalidDate = datePairs.some(([sd, sm, ed, em]) =>
      isEndBeforeStart(data[sd] as string, data[sm] as string, data[ed] as string, data[em] as string)
    );
    if (hasInvalidDate) {
      alert('Please check your dates — end date cannot be before start date.');
      return;
    }

    setGenerating(true);
    setError(null);
    lastData.current = data;

    try {
      const doc = generatePDF(data);
      const fileName = 'Tour2026_' + (data.center_name || 'request').replace(/\s+/g, '_') + '.pdf';
      doc.save(fileName);

      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const { error: fnError } = await supabase.functions.invoke('send-pdf-email', {
        body: {
          copyTo: wantsCopy && copyEmail ? copyEmail : undefined,
          subject: 'Tour 2026 — Request from ' + data.center_name + ', ' + data.country,
          pdfBase64,
          centerName: data.center_name,
        },
      });

      if (fnError) throw fnError;
      setSubmitted(true);

    } catch (err) {
      console.error('Error:', err);
      setError(
        'An error occurred while sending your request. Your PDF has been downloaded — ' +
        'please send it manually to tour2026@jamgon-kongtrul.org.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleRedownload = () => {
    if (lastData.current) downloadPDF(lastData.current);
  };



  return (
    <div className="min-h-screen bg-background">
      <img src={headerBanner} alt="Organisation of the 2026 Tours" className="w-full block border-b-[3px] border-b-gold" />

      <div className="max-w-[860px] mx-auto px-6 pt-12 pb-20">
        <div className="text-center mb-12">
          <p className="font-display italic text-[1.25rem] text-bgray tracking-[0.03em]">
            Please fill in the form below and submit your request for the 2026 tours.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit}>
          {/* Center Information */}
          <div className="mb-10 animate-fade-up" style={{ animationDelay: '0.05s' }}>
            <SectionTitle>Center Information</SectionTitle>
            <div className="grid grid-cols-1 gap-5 mb-5">
              <div className="flex flex-col gap-[7px]">
                <FieldLabel htmlFor="center_name">Name of the center</FieldLabel>
                <input id="center_name" className={inputClass} value={data.center_name} onChange={e => onChange('center_name', e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-[7px]">
                <FieldLabel htmlFor="city">City</FieldLabel>
                <input id="city" className={inputClass} value={data.city} onChange={e => onChange('city', e.target.value)} required />
              </div>
              <div className="flex flex-col gap-[7px]">
                <FieldLabel htmlFor="country">Country</FieldLabel>
                <select id="country" className={selectClass} style={selectBgStyle} value={data.country} onChange={e => onChange('country', e.target.value)} required>
                  <option value="">— Select a country —</option>
                  {COUNTRIES.map(c => <option key={c} value={c} className="bg-navy text-foreground">{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent my-10 opacity-40" />

          {/* Persons Responsible */}
          <div className="mb-10 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <SectionTitle>Persons Responsible</SectionTitle>
            <PersonBlock num={1} data={data} onChange={onChange} />
            <PersonBlock num={2} data={data} onChange={onChange} />
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent my-10 opacity-40" />

          {/* Course Details */}
          <div className="mb-10 animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <SectionTitle>Course Details</SectionTitle>

            {/* Plan A */}
            <div className="border border-secondary/25 border-t-2 border-t-gold px-5 pt-5 pb-3.5 mb-6 bg-navy/[0.07]">
              <h3 className="font-display font-semibold text-[1.05rem] text-gold-light mb-1 tracking-[0.04em]">Plan A</h3>
              <p className="text-[1.15rem] text-gold-light font-display italic mb-5 tracking-[0.02em]"><p className="text-[1.15rem] text-gold-light font-display italic mb-5 tracking-[0.02em]">H.H. Karmapa comes to the European Center</p></p>
              <p className="text-[0.92rem] text-bgray/70 mb-5 leading-relaxed">Please indicate your preferred dates for a visit of H.E. Jamgon Kongtrul Rinpoche to your center. You may add a second date option if your first choice is not available.</p>

              <p className="text-[0.82rem] font-semibold tracking-[0.1em] uppercase text-bgray mb-2">Option 1</p>
              <DateRow startDayField="start_day" startMonthField="start_month" endDayField="end_day" endMonthField="end_month" data={data} onChange={onChange} required />

              <div className="mt-4 mb-2">
                <span className="text-[0.92rem] text-gold italic underline underline-offset-2 hover:text-gold-light transition-colors cursor-pointer" onClick={() => {
                  if (showAltA) { onChange('start_day_alt',''); onChange('start_month_alt',''); onChange('end_day_alt',''); onChange('end_month_alt',''); }
                  setShowAltA(!showAltA);
                }}>
                  {showAltA ? '− Remove option 2' : '+ Add a second date option (optional)'}
                </span>
              </div>
              {showAltA && (
                <div className="mt-3 border-l-2 border-gold/30 pl-4">
                  <p className="text-[0.82rem] font-semibold tracking-[0.1em] uppercase text-bgray mb-2">Option 2</p>
                  <DateRow startDayField="start_day_alt" startMonthField="start_month_alt" endDayField="end_day_alt" endMonthField="end_month_alt" data={data} onChange={onChange} />
                </div>
              )}
            </div>

            {/* Plan B */}
            <div className="border border-secondary/25 border-t-2 border-t-secondary px-5 pt-5 pb-3.5 mb-6 bg-navy/[0.07]">
              <h3 className="font-display font-semibold text-[1.05rem] text-gold-light mb-1 tracking-[0.04em]">Plan B</h3>
              <p className="text-[1.15rem] text-gold-light font-display italic mb-5 tracking-[0.02em]"><p className="text-[1.15rem] text-gold-light font-display italic mb-5 tracking-[0.02em]">H.H. Karmapa does not come to the European Center</p></p>
              <p className="text-[0.92rem] text-bgray/70 mb-5 leading-relaxed">Please indicate your preferred dates for a visit of H.E. Jamgon Kongtrul Rinpoche to your center in case H.H Karmapa Thaye Dorje cannot visit EC. You may add a second date option if your first choice is not available.</p>

              <p className="text-[0.82rem] font-semibold tracking-[0.1em] uppercase text-bgray mb-2">Option 1</p>
              <DateRow startDayField="start_day2" startMonthField="start_month2" endDayField="end_day2" endMonthField="end_month2" data={data} onChange={onChange} />

              <div className="mt-4 mb-2">
                <span className="text-[0.92rem] text-gold italic underline underline-offset-2 hover:text-gold-light transition-colors cursor-pointer" onClick={() => {
                  if (showAltB) { onChange('start_day2_alt',''); onChange('start_month2_alt',''); onChange('end_day2_alt',''); onChange('end_month2_alt',''); }
                  setShowAltB(!showAltB);
                }}>
                  {showAltB ? '− Remove option 2' : '+ Add a second date option (optional)'}
                </span>
              </div>
              {showAltB && (
                <div className="mt-3 border-l-2 border-gold/30 pl-4">
                  <p className="text-[0.82rem] font-semibold tracking-[0.1em] uppercase text-bgray mb-2">Option 2</p>
                  <DateRow startDayField="start_day2_alt" startMonthField="start_month2_alt" endDayField="end_day2_alt" endMonthField="end_month2_alt" data={data} onChange={onChange} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 mt-5">
              <div className="flex flex-col gap-[7px]">
                <FieldLabel htmlFor="topics">Topic(s) of the course <span className="text-bgray/50 font-normal text-[0.82rem]">(optional)</span></FieldLabel>
                <textarea id="topics" className={inputClass + " resize-vertical min-h-[110px]"} value={data.topics} onChange={e => onChange('topics', e.target.value)} />
              </div>
              <div className="flex flex-col gap-[7px]">
                <FieldLabel htmlFor="empowerments">Request for empowerment(s) <span className="text-bgray/50 font-normal text-[0.82rem]">(optional)</span></FieldLabel>
                <textarea id="empowerments" className={inputClass + " resize-vertical min-h-[110px]"} value={data.empowerments} onChange={e => onChange('empowerments', e.target.value)} />
              </div>
              <div className="flex flex-col gap-[7px]">
                <FieldLabel htmlFor="comments">Additional comments <span className="text-bgray/50 font-normal">(optional)</span></FieldLabel>
                <textarea id="comments" className={inputClass + " resize-none overflow-hidden min-h-[44px]"} value={data.comments} onChange={e => onChange('comments', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Receive copy option */}
          <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setWantsCopy(!wantsCopy)}>
              <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-all ${wantsCopy ? 'bg-gold border-gold' : 'border-bgray/50 bg-foreground/5'}`}>
                {wantsCopy && <span className="text-navy-deep text-xs font-bold">✓</span>}
              </div>
              <span className="text-[0.85rem] text-bgray">I would like to receive a copy of the PDF by email</span>
            </div>
            {wantsCopy && (
              <div className="mt-4 ml-8 max-w-sm">
                <div className="flex flex-col gap-[7px]">
                  <FieldLabel htmlFor="copy_email">Your email address</FieldLabel>
                  <input
                    id="copy_email"
                    type="email"
                    className={inputClass}
                    placeholder="your@email.com"
                    value={copyEmail}
                    onChange={e => setCopyEmail(e.target.value)}
                    required={wantsCopy}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="text-center mt-12 animate-fade-up" style={{ animationDelay: '0.35s' }}>
            <button
              type="submit"
              disabled={generating}
              className="inline-block bg-gradient-to-br from-gold to-gold-dark text-navy-deep font-body font-bold text-[0.9rem] tracking-[0.25em] uppercase py-4 px-14 border-none cursor-pointer relative transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_hsl(var(--primary)/0.35)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              style={{ clipPath: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)' }}
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                {generating && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {generating ? 'Sending…' : 'Send'}
              </span>
            </button>
            <p className="mt-[18px] text-[0.85rem] text-bgray/90">
              A PDF summary will be generated and sent to tour2026@jamgon-kongtrul.org.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-center p-6 border border-red-400/50 bg-red-500/10 mt-8">
              <p className="text-red-400 text-[0.9rem] leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={handleRedownload}
                className="inline-block mt-4 bg-transparent border border-red-400 text-red-400 font-body text-[0.82rem] font-medium tracking-[0.15em] uppercase py-2.5 px-7 cursor-pointer transition-colors hover:bg-red-400 hover:text-navy-deep"
              >
                ⬇ Download PDF again
              </button>
            </div>
          )}

          {/* Success message */}
          {submitted && (
            <div className="text-center p-8 border border-gold bg-primary/[0.08] mt-8">
              <h3 className="font-display text-[1.6rem] text-gold mb-2">Thank you</h3>
              <p className="text-bgray text-[0.9rem]">Your request has been sent successfully to tour2026@jamgon-kongtrul.org.</p>
              <button
                type="button"
                onClick={handleRedownload}
                className="inline-block mt-4 bg-transparent border border-gold text-gold font-body text-[0.82rem] font-medium tracking-[0.15em] uppercase py-2.5 px-7 cursor-pointer transition-colors hover:bg-gold hover:text-navy-deep"
              >
                ⬇ Download PDF again
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
