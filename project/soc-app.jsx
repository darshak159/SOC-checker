// soc-app.jsx — SOC Checker React App
const { useState, useEffect, useRef, useMemo } = React;

// ─── Icons ────────────────────────────────────────────────────────────────────
function Icon({ name, size = 20, color = 'currentColor', sw = 1.8 }) {
  const icons = {
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    list: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
    check: <polyline points="20 6 9 17 4 12" />,
    x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    chevR: <polyline points="9 18 15 12 9 6" />,
    chevL: <polyline points="15 18 9 12 15 6" />,
    chevD: <polyline points="6 9 12 15 18 9" />,
    upload: <><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" /></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    download: <><polyline points="8 17 12 21 16 17" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.88 18.09A5 5 0 0018 9h-1.26A8 8 0 103 16.11" /></>,
    folder: <><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {icons[name] || null}
    </svg>);

}

// ─── UI Primitives ─────────────────────────────────────────────────────────────
function ScorePill({ score }) {
  const s = scoreStyle(score);
  return <span className="score-pill" style={{ color: s.color, background: s.bg }}>{score}%</span>;
}

const ROLE_COLOR = { teamleader: '#2563EB', trainer: '#7C3AED', manager: '#059669', admin: '#D97706' };

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [role, setRole] = React.useState('');

  const users = React.useMemo(() =>
  role ? INITIAL_USERS.filter((u) => u.role === role) : [],
  [role]);

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── Gradient hero ── */}
      <div style={{
        background: 'linear-gradient(145deg, #0F4C8A 0%, #1565C0 45%, #6A1FC2 100%)',
        padding: '64px 28px 52px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        {/* decorative blobs */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', top: 30, left: 20, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        {/* Logo mark */}
        <div style={{ position: 'relative', zIndex: 1, margin: '0 auto 20px', width: 80, height: 80 }}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <defs>
              <linearGradient id="logoInner" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="1" stopColor="#818CF8" />
              </linearGradient>
            </defs>
            {/* outer glow ring */}
            <circle cx="40" cy="40" r="39" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
            {/* badge face */}
            <circle cx="40" cy="40" r="34" fill="url(#logoInner)" opacity="0.95" />
            {/* inner subtle ring */}
            <circle cx="40" cy="40" r="27" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            {/* bold checkmark */}
            <path d="M22 40 L34 53 L58 27" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 style={{
          fontSize: 32, fontWeight: 800, color: '#fff',
          letterSpacing: '-0.04em', marginBottom: 8,
          position: 'relative', zIndex: 1,
          textShadow: '0 2px 12px rgba(0,0,0,0.2)'
        }}>SOC Checker</h1>
        <p style={{
          fontSize: 13, color: 'rgba(255,255,255,0.72)',
          fontWeight: 500, letterSpacing: '0.04em',
          textTransform: 'uppercase', position: 'relative', zIndex: 1
        }}>Brock Outlet · Standards of Operations</p>
      </div>

      {/* ── Form area ── */}
      <div style={{ flex: 1, padding: '30px 24px 48px', background: '#F7F6F3' }} data-comment-anchor="ca4105186a-div-98-7">
        <p className="label">Your Role</p>
        <select
          className="soc-input soc-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ marginBottom: 24 }}>
          
          <option value="">Select your role...</option>
          <option value="teamleader">Team Leader</option>
          <option value="trainer">Crew Trainer</option>
          <option value="manager">Manager</option>
          <option value="admin">GM / Dept. Manager</option>
        </select>

        {role &&
        <div className="fade-in">
            <p className="label">Select Your Name</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {users.map((u) =>
            <button key={u.id} onClick={() => onLogin(u)} className="login-row">
                  <div style={{
                width: 40, height: 40, borderRadius: 99, flexShrink: 0,
                background: ROLE_COLOR[u.role] + '1A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1.5px solid ${ROLE_COLOR[u.role]}30`
              }}>
                    <Icon name="user" size={17} color={ROLE_COLOR[u.role]} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: '#78716C', marginTop: 1 }}>{ROLES[u.role]}</div>
                  </div>
                  <Icon name="chevR" size={16} color="#C8C4C0" />
                </button>
            )}
            </div>
          </div>
        }
      </div>
    </div>);

}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar({ user, onLogout }) {
  return (
    <div className="top-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg, #1565C0, #6A1FC2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="check" size={15} color="#fff" sw={2.8} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>SOC Checker</div>
          <div style={{ fontSize: 12, color: '#78716C', display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ color: ROLE_COLOR[user.role], fontWeight: 500 }}>{ROLES[user.role]}</span>
            <span>·</span>
            <span>{user.outlet !== 'All' ? user.outlet : 'All Outlets'}</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={onLogout} style={{ padding: 8, borderRadius: 8, color: '#78716C' }}>
          <Icon name="logout" size={20} />
        </button>
      </div>
    </div>);

}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ tab, setTab, role }) {
  const tabs = [
  { id: 'dashboard', icon: 'home', label: 'Home' },
  { id: 'new', icon: 'plus', label: 'New Check' },
  { id: 'history', icon: 'list', label: 'History' },
  ...(role === 'manager' || role === 'admin' ? [{ id: 'reports', icon: 'chart', label: 'Reports' }] : []),
  ...(role === 'admin' ? [{ id: 'templates', icon: 'folder', label: 'Library' }] : [])];

  return (
    <div className="bottom-nav">
      {tabs.map((t) =>
      <button key={t.id} className={'nav-item' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
          <div style={{ position: 'relative' }}>
            <Icon name={t.icon} size={22} sw={tab === t.id ? 2.2 : 1.7} />
            {t.badge > 0 && <span className="notif-badge">{t.badge > 9 ? '9+' : t.badge}</span>}
          </div>
          <span>{t.label}</span>
        </button>
      )}
    </div>);

}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardScreen({ data, user, onNewCheck, onViewCheck }) {
  const today = new Date().toISOString().split('T')[0];

  const myChecks = useMemo(() => {
    return data.checks.
    filter((c) => user.role === 'admin' || user.outlet === 'All' || c.outlet === user.outlet).
    sort((a, b) => b.date.localeCompare(a.date));
  }, [data.checks, user]);

  const todayChecks = myChecks.filter((c) => c.date === today);
  const failAlerts = myChecks.filter((c) => c.hasFail).slice(0, 3);
  const avgScore = myChecks.length ? Math.round(myChecks.reduce((s, c) => s + c.score, 0) / myChecks.length) : 0;
  const failCount = myChecks.filter((c) => c.hasFail).length;

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="screen fade-in">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em' }}>{greet}, {user.name.split(' ')[0]}</h2>
        <p style={{ fontSize: 13, color: '#78716C', marginTop: 2 }}>{fmtDate(today)}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
        { label: 'Today', value: todayChecks.length, sub: 'checks' },
        { label: 'Avg Score', value: avgScore + '%', sub: 'overall', color: scoreStyle(avgScore).color },
        { label: 'Fails', value: failCount, sub: 'total', color: failCount > 0 ? '#DC2626' : undefined }].
        map((s, i) =>
        <div key={i} className="card" style={{ textAlign: 'center', padding: '14px 6px' }}>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, color: s.color || '#1C1917' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#78716C', marginTop: 3 }}>{s.label}</div>
          </div>
        )}
      </div>

      {/* Fail alerts for managers */}
      {(user.role === 'manager' || user.role === 'admin') && failAlerts.length > 0 &&
      <div style={{ marginBottom: 16 }}>
          <p className="label">Recent Fails</p>
          {failAlerts.map((c) =>
        <button key={c.id} onClick={() => onViewCheck(c)} style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '11px 14px', borderRadius: 12, marginBottom: 6, textAlign: 'left',
          background: '#FEF2F2', border: '1px solid #FECACA'
        }}>
              <Icon name="alert" size={17} color="#DC2626" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1C1917' }}>{c.traineeName} — {c.department}</div>
                <div style={{ fontSize: 12, color: '#78716C' }}>{fmtDate(c.date)} · {c.outlet}</div>
              </div>
              <ScorePill score={c.score} />
            </button>
        )}
        </div>
      }

      <button className="btn-primary" onClick={onNewCheck} style={{ marginBottom: 20 }}>
        + Start New SOC Check
      </button>

      <p className="label">Recent Checks</p>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {myChecks.slice(0, 10).map((c, i) =>
        <button key={c.id} onClick={() => onViewCheck(c)} style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
          padding: '11px 16px', textAlign: 'left', background: 'transparent',
          borderBottom: i < Math.min(myChecks.length - 1, 9) ? '1px solid #F5F4F1' : 'none'
        }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{c.traineeName}</div>
              <div style={{ fontSize: 12, color: '#78716C' }}>{c.templateName} · {fmtDate(c.date)}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {c.hasFail && <Icon name="alert" size={14} color="#DC2626" />}
              <ScorePill score={c.score} />
            </div>
          </button>
        )}
        {myChecks.length === 0 &&
        <div style={{ padding: '36px 16px', textAlign: 'center', color: '#A8A29E', fontSize: 14 }}>No checks yet</div>
        }
      </div>
    </div>);

}

// ─── Check Detail Modal ────────────────────────────────────────────────────────
function CheckDetailModal({ check, data, onClose }) {
  const tpl = data.templates.find((t) => t.id === check.templateId);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480,
        maxHeight: '88vh', overflow: 'auto', padding: '20px 20px 32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{check.templateName}</h3>
            <p style={{ fontSize: 13, color: '#78716C' }}>{check.department} · {check.outlet} · {fmtDate(check.date)}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <ScorePill score={check.score} />
            <button onClick={onClose} style={{ padding: 4, color: '#78716C' }}><Icon name="x" size={20} /></button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[['Trainee', check.traineeName], ['Trainer', check.trainerName]].map(([l, v]) =>
          <div key={l} style={{ background: '#F9F8F6', borderRadius: 10, padding: '9px 12px' }}>
              <div style={{ fontSize: 11, color: '#78716C', marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
            </div>
          )}
        </div>

        {check.comment &&
        <div style={{ padding: '12px 14px', background: '#F9F8F6', borderRadius: 10, marginBottom: 14, border: '1px solid #EEEDEB' }}>
            <div style={{ fontSize: 11, color: '#A8A29E', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Comments</div>
            <p style={{ fontSize: 13, color: '#44403C', lineHeight: 1.55 }}>{check.comment}</p>
          </div>
        }

        {tpl && tpl.sections.map((sec) =>
        <div key={sec.id} style={{ marginBottom: 12 }}>
            {tpl.sections.length > 1 &&
          <p className="label">{sec.name} <span style={{ fontWeight: 400, color: '#B5B0AB' }}>weight {sec.weight}</span></p>
          }
            {sec.items.map((item) => {
            const r = check.itemRatings[item.id];
            const rColor = r === 'pass' ? '#059669' : '#DC2626';
            const rBg = r === 'pass' ? '#DCFCE7' : '#FEE2E2';
            const rIcon = r === 'pass' ? 'check' : 'x';
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F5F4F1' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 99, background: r ? rBg : '#F5F4F1', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {r ? <Icon name={rIcon} size={14} color={rColor} sw={2.5} /> : <span style={{ color: '#C8C4C0', fontSize: 12 }}>—</span>}
                  </div>
                  <span style={{ fontSize: 13, lineHeight: 1.5 }}>{item.text}</span>
                </div>);

          })}
          </div>
        )}
      </div>
    </div>);

}

// ─── New Check Wizard ─────────────────────────────────────────────────────────
function NewCheckScreen({ data, user, onSave, onBack }) {
  const TOTAL = 5;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    outlet: user.outlet !== 'All' ? user.outlet : 'Brock',
    department: '',
    date: todayStr(),
    traineeName: '',
    trainerId: user.id,
    managerId: user.role === 'manager' ? user.id : '',
    templateId: '',
    itemRatings: {},
    uploadedTpl: null,
    comment: ''
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const fileRef = useRef();

  const availTrainers = data.users.filter((u) => u.role === 'trainer' && (!form.outlet || u.outlet === form.outlet));
  const availManagers = data.users.filter((u) => u.role === 'manager' && (!form.outlet || u.outlet === form.outlet));
  const deptTpls = data.templates.filter((t) => t.department === form.department);
  const currentTpl = form.uploadedTpl || data.templates.find((t) => t.id === form.templateId);

  const allRated = currentTpl && currentTpl.sections.every((s) => s.items.every((i) => form.itemRatings[i.id]));
  const score = currentTpl ? calculateScore(currentTpl, form.itemRatings) : 0;

  const canNext = [
  () => !!form.outlet,
  () => form.traineeName && form.trainerId && form.date,
  () => !!currentTpl,
  () => allRated,
  () => true][
  step - 1];

  async function handleFileUpload(file) {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv' || ext === 'txt') {
      const text = await file.text();
      const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 3);
      const tpl = { id: 'custom_' + Date.now(), name: file.name.replace(/\.[^.]+$/, ''), department: form.department, sections: [{ id: 'cs1', name: 'Checklist', weight: 1, items: lines.map((l, i) => ({ id: 'ci_' + i, text: l })) }] };
      set('uploadedTpl', tpl);set('templateId', tpl.id);set('itemRatings', {});
    } else if (ext === 'docx') {
      if (!window.JSZip) {
        await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
          s.onload = res;s.onerror = rej;document.head.appendChild(s);
        });
      }
      const ab = await file.arrayBuffer();
      const zip = new window.JSZip();
      await zip.loadAsync(ab);
      const xml = await zip.file('word/document.xml').async('string');
      const lines = xml.replace(/<[^>]+>/g, '\n').split('\n').map((l) => l.trim()).filter((l) => l.length > 5 && !/^[A-Z0-9_:]+$/.test(l));
      const tpl = { id: 'custom_' + Date.now(), name: file.name.replace('.docx', ''), department: form.department, sections: [{ id: 'cs1', name: 'Checklist', weight: 1, items: lines.map((l, i) => ({ id: 'ci_' + i, text: l })) }] };
      set('uploadedTpl', tpl);set('templateId', tpl.id);set('itemRatings', {});
    } else {
      alert('Supported formats: .docx, .csv, .txt');
    }
  }

  function handleSubmit() {
    const trainer = data.users.find((u) => u.id === form.trainerId);
    const manager = data.users.find((u) => u.id === form.managerId);
    const check = {
      id: 'c_' + Date.now(), date: form.date, outlet: form.outlet, department: form.department,
      traineeName: form.traineeName, trainerId: form.trainerId, trainerName: trainer?.name || '—',
      managerId: form.managerId, managerName: manager?.name || '—',
      templateId: currentTpl.id, templateName: currentTpl.name,
      itemRatings: form.itemRatings, score,
      comment: form.comment || '',
      department: currentTpl.department || '',
      hasFail: Object.values(form.itemRatings).includes('fail')
    };
    const newData = { ...data, checks: [check, ...data.checks] };
    onSave(newData, check);
  }

  const StepHead = ({ title, sub }) =>
  <div style={{ marginBottom: 20 }}>
      <div style={{ background: '#EDEDEB', borderRadius: 99, height: 3, marginBottom: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#1C1917', borderRadius: 99, width: `${step / TOTAL * 100}%`, transition: 'width 0.3s ease' }} />
      </div>
      <div style={{ fontSize: 11, color: '#A8A29E', marginBottom: 4 }}>Step {step} of {TOTAL}</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h2>
      {sub && <p style={{ fontSize: 13, color: '#78716C', marginTop: 3 }}>{sub}</p>}
    </div>;


  return (
    <div className="screen fade-in">
      <button onClick={step > 1 ? () => setStep((s) => s - 1) : onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#78716C', marginBottom: 16, fontSize: 14 }}>
        <Icon name="chevL" size={18} /> {step > 1 ? 'Back' : 'Cancel'}
      </button>

      {/* Step 1 — Outlet */}
      {step === 1 &&
      <div className="fade-in">
          <StepHead title="Select Outlet" sub="Confirm your outlet to continue" />
          <p className="label">Outlet</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {OUTLETS.map((o) =>
          <button key={o} onClick={() => set('outlet', o)} className={'picker-btn' + (form.outlet === o ? ' active' : '')} style={{ flex: 1 }}>{o}</button>
          )}
          </div>
        </div>
      }

      {/* Step 2 — Employee Details */}
      {step === 2 &&
      <div className="fade-in">
          <StepHead title="Employee Details" sub="Who is being assessed?" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <p className="label">Date</p>
              <input type="date" className="soc-input" value={form.date} onChange={(e) => set('date', e.target.value)} />
            </div>
            <div>
              <p className="label">Trainee / Employee Name</p>
              <input className="soc-input" placeholder="Enter full name" value={form.traineeName} onChange={(e) => set('traineeName', e.target.value)} />
            </div>
            <div style={{ padding: '11px 14px', borderRadius: 12, background: '#F9F8F6', border: '1.5px solid #EEEDEB', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 99, background: ROLE_COLOR[user.role] + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="user" size={16} color={ROLE_COLOR[user.role]} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#A8A29E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conducted by</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1917' }}>{user.name} <span style={{ fontWeight: 400, color: '#78716C' }}>· {ROLES[user.role]}</span></div>
              </div>
            </div>

          </div>
        </div>
      }

      {/* Step 3 — Template */}
      {step === 3 &&
      <div className="fade-in">
          <StepHead title="SOC Template" sub="Choose the template to use" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {data.templates.map((t) =>
          <button key={t.id} onClick={() => {set('templateId', t.id);set('uploadedTpl', null);set('itemRatings', {});}}
          className={'tpl-btn' + (form.templateId === t.id && !form.uploadedTpl ? ' active' : '')}>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
                    {t.sections.reduce((n, s) => n + s.items.length, 0)} items
                  </div>
                </div>
                {form.templateId === t.id && !form.uploadedTpl && <Icon name="check" size={18} color="#fff" sw={2.5} />}
              </button>
          )}
            {data.templates.length === 0 &&
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#A8A29E', fontSize: 14 }}>No templates yet — ask your GM to upload some via the Library tab</div>
          }
          </div>

        {user.role === 'admin' &&
        <>
          <p className="label">Upload Custom Template</p>
          <div className="card" style={{ border: '1.5px dashed #DDDBD8' }}>
            <p style={{ fontSize: 13, color: '#78716C', marginBottom: 12 }}>Supports .docx, .csv, .txt</p>
            {form.uploadedTpl ?
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0' }}>
                <Icon name="check" size={16} color="#059669" sw={2.5} />
                <span style={{ fontSize: 13, color: '#059669', fontWeight: 500, flex: 1 }}>{form.uploadedTpl.name}</span>
                <span style={{ fontSize: 12, color: '#78716C' }}>{form.uploadedTpl.sections[0]?.items.length} items</span>
                <button onClick={() => {set('uploadedTpl', null);set('templateId', '');}} style={{ color: '#78716C', padding: 4 }}><Icon name="x" size={15} /></button>
              </div> :

            <button onClick={() => fileRef.current?.click()} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Icon name="upload" size={16} /> Choose File
              </button>
            }
            <input ref={fileRef} type="file" accept=".docx,.xlsx,.xls,.csv,.txt,.doc" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e.target.files[0])} />
          </div>
          </>
        }
        </div>
      }

      {/* Step 4 — Checklist */}
      {step === 4 && currentTpl &&
      <div className="fade-in">
          <StepHead title={currentTpl.name} sub={`Rating for ${form.traineeName}`} />
          {currentTpl.sections.map((sec) =>
        <div key={sec.id} style={{ marginBottom: 14 }}>
              {currentTpl.sections.length > 1 &&
          <p className="label">{sec.name} <span style={{ fontWeight: 400, color: '#B5B0AB' }}>· weight {sec.weight}</span></p>
          }
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {sec.items.map((item, idx) =>
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: idx < sec.items.length - 1 ? '1px solid #F5F4F1' : 'none' }}>
                    <p style={{ fontSize: 14, lineHeight: 1.45, flex: 1 }}>{item.text}</p>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      {[
                { r: 'pass', icon: 'check', active: '#059669', activeBg: '#DCFCE7' },
                { r: 'fail', icon: 'x', active: '#DC2626', activeBg: '#FEE2E2' }].
                map(({ r, icon, active, activeBg }) => {
                  const on = form.itemRatings[item.id] === r;
                  return (
                    <button key={r}
                    onClick={() => set('itemRatings', { ...form.itemRatings, [item.id]: r })}
                    style={{
                      width: 40, height: 40, borderRadius: 99, flexShrink: 0,
                      border: `1.5px solid ${on ? active : '#E7E5E4'}`,
                      background: on ? activeBg : '#F9F8F6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.1s'
                    }}>
                            <Icon name={icon} size={18} color={on ? active : '#C8C4C0'} sw={on ? 2.8 : 1.8} />
                          </button>);

                })}
                    </div>
                  </div>
            )}
              </div>
            </div>
        )}

          <div style={{ marginTop: 20 }}>
            <p className="label" style={{ marginBottom: 6 }}>Comments / Feedback <span style={{ fontWeight: 400, color: '#B5B0AB', textTransform: 'none', letterSpacing: 0 }}>— optional</span></p>
            <textarea
            className="soc-input"
            rows={3}
            placeholder="Add any notes or observations..."
            value={form.comment}
            onChange={(e) => set('comment', e.target.value)}
            style={{ resize: 'vertical', lineHeight: 1.5 }} />
          
          </div>

          {allRated &&
        <div style={{ padding: '14px 18px', borderRadius: 14, background: scoreStyle(score).bg, border: `1px solid ${scoreStyle(score).color}30`, marginTop: 12 }}>
              <div style={{ fontSize: 12, color: '#78716C' }}>Current Score</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: scoreStyle(score).color, letterSpacing: '-0.03em' }}>{score}%</div>
            </div>
        }
        </div>
      }

      {/* Step 5 — Summary */}
      {step === 5 &&
      <div className="fade-in">
          <StepHead title="Review & Submit" sub="Check everything before submitting" />
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #F5F4F1' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{currentTpl?.name}</div>
                <div style={{ fontSize: 13, color: '#78716C', marginTop: 2 }}>{form.department} · {form.outlet}</div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: scoreStyle(score).color, letterSpacing: '-0.03em', lineHeight: 1 }}>{score}%</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
            ['Trainee', form.traineeName],
            ['Date', fmtDate(form.date)],
            ['Trainer', data.users.find((u) => u.id === form.trainerId)?.name || '—']].
            map(([l, v]) =>
            <div key={l} style={{ background: '#F9F8F6', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: '#78716C' }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginTop: 1 }}>{v}</div>
                </div>
            )}
            </div>
          </div>

          <button className="btn-primary" onClick={handleSubmit}>Submit SOC Check</button>
        </div>
      }

      {/* Continue button */}
      {step < 5 &&
      <div style={{ marginTop: 24 }}>
          <button className="btn-primary" onClick={() => setStep((s) => s + 1)} disabled={!canNext()} style={{ opacity: canNext() ? 1 : 0.35 }}>
            Continue
          </button>
        </div>
      }
    </div>);

}

// ─── History Screen ────────────────────────────────────────────────────────────
function HistoryScreen({ data, user, onViewCheck }) {
  const [fOutlet, setFOutlet] = useState('All');

  const checks = useMemo(() => data.checks.
  filter((c) => {
    if (user.role !== 'admin' && user.outlet !== 'All' && c.outlet !== user.outlet) return false;
    if (fOutlet !== 'All' && c.outlet !== fOutlet) return false;
    return true;
  }).
  sort((a, b) => b.date.localeCompare(a.date)), [data.checks, user, fOutlet]);

  return (
    <div className="screen fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 14 }}>Check History</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto' }}>
        <select className="soc-input soc-select" style={{ flex: '0 0 auto', width: 'auto', padding: '8px 12px', fontSize: 13 }} value={fOutlet} onChange={(e) => setFOutlet(e.target.value)}>
          <option value="All">All Outlets</option>
          {OUTLETS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <p style={{ fontSize: 13, color: '#78716C', marginBottom: 10 }}>{checks.length} check{checks.length !== 1 ? 's' : ''}</p>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {checks.map((c, i) =>
        <button key={c.id} onClick={() => onViewCheck(c)} style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
          padding: '11px 16px', textAlign: 'left', background: 'transparent',
          borderBottom: i < checks.length - 1 ? '1px solid #F5F4F1' : 'none'
        }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{c.traineeName}</div>
              <div style={{ fontSize: 12, color: '#78716C', marginTop: 1 }}>{c.templateName} · {fmtDate(c.date)}</div>
              <div style={{ fontSize: 11, color: '#A8A29E', marginTop: 1 }}>Trainer: {c.trainerName}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {c.hasFail && <Icon name="alert" size={14} color="#DC2626" />}
              <ScorePill score={c.score} />
            </div>
          </button>
        )}
        {checks.length === 0 &&
        <div style={{ padding: '40px 16px', textAlign: 'center', color: '#A8A29E', fontSize: 14 }}>No checks match your filters</div>
        }
      </div>
    </div>);

}

// ─── Reports Screen ────────────────────────────────────────────────────────────
function ReportsScreen({ data, user }) {
  const [period, setPeriod] = useState('month');
  const [rTab, setRTab] = useState('scores');
  const [selectedCrew, setSelectedCrew] = useState(null);

  const days = period === 'week' ? 7 : 30;
  const cutoff = useMemo(() => {const d = new Date('2026-06-19');d.setDate(d.getDate() - days);return d.toISOString().split('T')[0];}, [days]);

  const filtered = useMemo(() =>
  data.checks.filter((c) => c.date >= cutoff),
  [data.checks, cutoff]);

  const empSummary = useMemo(() => {
    const map = {};
    filtered.forEach((c) => {
      if (!map[c.traineeName]) map[c.traineeName] = { name: c.traineeName, outlet: c.outlet, checks: [] };
      map[c.traineeName].checks.push(c);
    });
    return Object.values(map).map((e) => ({
      name: e.name, outlet: e.outlet,
      count: e.checks.length,
      avg: Math.round(e.checks.reduce((s, c) => s + c.score, 0) / e.checks.length),
      last: e.checks.sort((a, b) => b.date.localeCompare(a.date))[0]?.date
    })).sort((a, b) => b.avg - a.avg);
  }, [filtered]);

  const trainerActivity = useMemo(() => {
    const map = {};
    filtered.forEach((c) => {
      if (!map[c.trainerName]) map[c.trainerName] = { name: c.trainerName, outlet: c.outlet, count: 0, last: '' };
      map[c.trainerName].count++;
      if (c.date > map[c.trainerName].last) map[c.trainerName].last = c.date;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [filtered]);

  const managerActivity = useMemo(() => {
    const map = {};
    filtered.forEach((c) => {
      if (!map[c.managerName]) map[c.managerName] = { name: c.managerName, outlet: c.outlet, count: 0, last: '' };
      map[c.managerName].count++;
      if (c.date > map[c.managerName].last) map[c.managerName].last = c.date;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [filtered]);

  function doExport() {
    const label = `${period}_${new Date().toISOString().split('T')[0]}`;
    if (rTab === 'scores') {
      exportCSV(
        empSummary.map((e) => [e.name, e.count, e.avg + '%', fmtDate(e.last)]),
        ['Employee', 'Checks', 'Avg Score', 'Last Check'],
        'SOC_Scores_' + label
      );
    } else {
      exportCSV(
        [
        ...trainerActivity.map((t) => ['Trainer', t.name, t.outlet, t.count, Math.round(t.count / days * 100) + '%', fmtDate(t.last)]),
        ...managerActivity.map((m) => ['Manager', m.name, m.outlet, m.count, Math.round(m.count / days * 100) + '%', fmtDate(m.last)])],

        ['Role', 'Name', 'Outlet', 'Checks', 'Completion Rate', 'Last Active'],
        'SOC_Activity_' + label
      );
    }
  }

  return (
    <div className="screen fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Reports</h2>
        <button onClick={doExport} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '8px 14px', borderRadius: 10, background: '#F5F4F1', fontSize: 13, fontWeight: 500, border: '1px solid #EDEDEB' }}>
          <Icon name="download" size={14} /> Export CSV
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div className="tab-strip" style={{ flex: 1 }}>
          {['week', 'month'].map((p) =>
          <button key={p} className={'tab-btn' + (period === p ? ' active' : '')} onClick={() => setPeriod(p)}>
              {p === 'week' ? 'This Week' : 'This Month'}
            </button>
          )}
        </div>
        {user.role === 'admin' && <></>}
      </div>

      <p style={{ fontSize: 13, color: '#78716C', marginBottom: 12 }}>{filtered.length} checks · last {days} days</p>

      <div className="tab-strip" style={{ marginBottom: 14 }}>
        {[['scores', 'Employee Scores'], ['activity', 'Trainer & Manager'], ['crew', 'Crew']].map(([id, label]) =>
        <button key={id} className={'tab-btn' + (rTab === id ? ' active' : '')} onClick={() => setRTab(id)}>{label}</button>
        )}
      </div>

      {rTab === 'scores' &&
      <div style={{ overflowX: 'auto' }} className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="report-table">
            <thead><tr><th>Employee</th><th>Checks</th><th>Avg</th><th>Last Check</th></tr></thead>
            <tbody>
              {empSummary.map((e) =>
            <tr key={e.name}>
                  <td style={{ fontWeight: 500 }}>{e.name}</td>
                  <td>{e.outlet}</td>
                  <td>{e.count}</td>
                  <td><ScorePill score={e.avg} /></td>
                  <td style={{ color: '#78716C', fontSize: 12 }}>{fmtDate(e.last)}</td>
                </tr>
            )}
              {empSummary.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#A8A29E', padding: 32 }}>No data for this period</td></tr>}
            </tbody>
          </table>
        </div>
      }

      {rTab === 'activity' &&
      <div>
          <p className="label" style={{ marginBottom: 8 }}>Crew Trainers</p>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
            <table className="report-table">
              <thead><tr><th>Trainer</th><th>Outlet</th><th>Checks</th><th>Rate</th><th>Last Active</th></tr></thead>
              <tbody>
                {trainerActivity.map((t) => {
                const rate = Math.min(Math.round(t.count / days * 100), 100);
                return (
                  <tr key={t.name}>
                      <td style={{ fontWeight: 500 }}>{t.name}</td>
                      <td>{t.outlet}</td>
                      <td>{t.count}</td>
                      <td><ScorePill score={rate} /></td>
                      <td style={{ color: '#78716C', fontSize: 12 }}>{fmtDate(t.last)}</td>
                    </tr>);

              })}
                {trainerActivity.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#A8A29E', padding: 24 }}>No data</td></tr>}
              </tbody>
            </table>
          </div>

          <p className="label" style={{ marginBottom: 8 }}>Managers</p>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="report-table">
              <thead><tr><th>Manager</th><th>Outlet</th><th>Supervised</th><th>Rate</th><th>Last Active</th></tr></thead>
              <tbody>
                {managerActivity.map((m) => {
                const rate = Math.min(Math.round(m.count / days * 100), 100);
                return (
                  <tr key={m.name}>
                      <td style={{ fontWeight: 500 }}>{m.name}</td>
                      <td>{m.outlet}</td>
                      <td>{m.count}</td>
                      <td><ScorePill score={rate} /></td>
                      <td style={{ color: '#78716C', fontSize: 12 }}>{fmtDate(m.last)}</td>
                    </tr>);

              })}
                {managerActivity.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#A8A29E', padding: 24 }}>No data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      }

      {rTab === 'crew' && (() => {
        const crewMap = {};
        filtered.forEach(c => {
          if (!crewMap[c.traineeName]) crewMap[c.traineeName] = [];
          crewMap[c.traineeName].push(c);
        });
        const crewList = Object.entries(crewMap)
          .map(([name, checks]) => ({ name, checks: checks.sort((a,b) => b.date.localeCompare(a.date)), avg: Math.round(checks.reduce((s,c) => s+c.score,0)/checks.length) }))
          .sort((a,b) => a.name.localeCompare(b.name));
        return (
          <div className="fade-in">
            {crewList.length === 0 && <div style={{ textAlign:'center', padding:'40px 16px', color:'#A8A29E', fontSize:14 }}>No checks in this period</div>}
            <div className="card" style={{ padding:0, overflow:'hidden' }}>
              {crewList.map((c,i) => (
                <button key={c.name} onClick={() => setSelectedCrew(c.name)} style={{
                  display:'flex', alignItems:'center', gap:12, width:'100%', padding:'12px 16px', textAlign:'left', background:'transparent',
                  borderBottom: i < crewList.length-1 ? '1px solid #F5F4F1' : 'none',
                }}>
                  <div style={{ width:36, height:36, borderRadius:99, background:'#F5F4F1', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon name="user" size={17} color="#78716C" />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600 }}>{c.name}</div>
                    <div style={{ fontSize:12, color:'#78716C' }}>{c.checks.length} SOC{c.checks.length!==1?'s':''} · Last {fmtDate(c.checks[0].date)}</div>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <ScorePill score={c.avg} />
                    <Icon name="chevR" size={16} color="#C8C4C0" />
                  </div>
                </button>
              ))}
            </div>

            {selectedCrew && (() => {
              const crew = crewList.find(c => c.name === selectedCrew);
              if (!crew) return null;
              return (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:100, display:'flex', alignItems:'flex-end' }}
                  onClick={() => setSelectedCrew(null)}>
                  <div onClick={e => e.stopPropagation()} style={{ background:'#F7F6F3', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:480, maxHeight:'88vh', overflow:'auto', display:'flex', flexDirection:'column' }}>
                    <div style={{ padding:'20px 20px 14px', background:'#fff', borderBottom:'1px solid #EEEDEB', borderRadius:'20px 20px 0 0', flexShrink:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize:17, fontWeight:700 }}>{crew.name}</h3>
                          <p style={{ fontSize:13, color:'#78716C', marginTop:2 }}>{crew.checks.length} SOC{crew.checks.length!==1?'s':''} this period</p>
                        </div>
                        <button onClick={() => setSelectedCrew(null)} style={{ color:'#78716C', padding:4, background:'none', border:'none', cursor:'pointer' }}><Icon name="x" size={20} /></button>
                      </div>
                    </div>
                    <div style={{ flex:1, overflow:'auto', padding:'12px 16px' }}>
                      {crew.checks.map((c,i) => (
                        <div key={c.id} className="card" style={{ marginBottom:8, display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:14, fontWeight:500 }}>{c.templateName}</div>
                            <div style={{ fontSize:12, color:'#78716C', marginTop:2 }}>{fmtDate(c.date)} · {c.trainerName}</div>
                            {c.comment && <div style={{ fontSize:12, color:'#78716C', marginTop:4, fontStyle:'italic' }}>"{c.comment}"</div>}
                          </div>
                          <ScorePill score={c.score} />
                        </div>
                      ))}
                    </div>
                    <div style={{ padding:'14px 16px 28px', background:'#fff', borderTop:'1px solid #EEEDEB', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:13, color:'#78716C', fontWeight:500 }}>Average Score</span>
                      <ScorePill score={crew.avg} />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}
    </div>);

}

// ─── Alerts Screen ─────────────────────────────────────────────────────────────
function AlertsScreen({ data, user, onUpdate }) {
  const notifs = data.notifications.
  filter((n) => user.role === 'admin' || user.outlet === 'All' || n.outlet === user.outlet).
  sort((a, b) => b.date.localeCompare(a.date));

  const markAll = () => onUpdate({ ...data, notifications: data.notifications.map((n) => ({ ...n, read: true })) });
  const markOne = (id) => onUpdate({ ...data, notifications: data.notifications.map((n) => n.id === id ? { ...n, read: true } : n) });

  return (
    <div className="screen fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Alerts</h2>
        {notifs.some((n) => !n.read) &&
        <button onClick={markAll} style={{ fontSize: 13, color: '#2563EB', fontWeight: 500 }}>Mark all read</button>
        }
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {notifs.map((n, i) =>
        <button key={n.id} onClick={() => markOne(n.id)} style={{
          display: 'flex', gap: 12, width: '100%', padding: '14px 16px', textAlign: 'left',
          background: n.read ? 'transparent' : '#FFFBEB',
          borderBottom: i < notifs.length - 1 ? '1px solid #F5F4F1' : 'none'
        }}>
            <div style={{ width: 34, height: 34, borderRadius: 99, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="alert" size={16} color="#DC2626" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: n.read ? 400 : 600, lineHeight: 1.4 }}>{n.message}</div>
              <div style={{ fontSize: 12, color: '#78716C', marginTop: 2 }}>{fmtDate(n.date)} · {n.outlet}</div>
            </div>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: 99, background: '#DC2626', flexShrink: 0, marginTop: 6 }} />}
          </button>
        )}
        {notifs.length === 0 &&
        <div style={{ padding: '44px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>✓</div>
            <p style={{ color: '#A8A29E', fontSize: 14 }}>All clear — no alerts</p>
          </div>
        }
      </div>
    </div>);

}

// ─── Templates Screen (Admin only) ────────────────────────────────────────────
function TemplatesScreen({ data, onUpdate }) {
  const [libTab,      setLibTab]      = useState('templates');
  const [batch,       setBatch]       = useState([]);
  const [showSheet,   setShowSheet]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser,     setNewUser]     = useState({ name: '', role: 'teamleader' });
  const fileRef = useRef();

  async function parseFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    let items = [];
    try {
      if (ext === 'csv' || ext === 'txt') {
        const text = await file.text();
        items = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 3);
      } else if (ext === 'docx' || ext === 'doc') {
        if (!window.JSZip) {
          await new Promise((res, rej) => {const s = document.createElement('script');s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';s.onload = res;s.onerror = rej;document.head.appendChild(s);});
        }
        const ab = await file.arrayBuffer();
        const zip = new window.JSZip();
        await zip.loadAsync(ab);
        const xml = await zip.file('word/document.xml').async('string');
        items = xml.replace(/<[^>]+>/g, '\n').split('\n').map((l) => l.trim()).filter((l) => l.length > 5 && !/^[A-Z0-9_:]+$/.test(l));
      } else if (ext === 'xlsx' || ext === 'xls') {
        if (!window.XLSX) {
          await new Promise((res, rej) => {const s = document.createElement('script');s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload = res;s.onerror = rej;document.head.appendChild(s);});
        }
        const ab = await file.arrayBuffer();
        const wb = window.XLSX.read(ab, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
        items = rows.flat().map((c) => String(c || '').trim()).filter((c) => c.length > 3);
      } else {
        return { name: file.name, department: '', items: [], error: 'Unsupported format' };
      }
      return { name: file.name.replace(/\.[^.]+$/, ''), department: '', items, error: null };
    } catch (e) {
      return { name: file.name, department: '', items: [], error: 'Parse error' };
    }
  }

  async function handleFiles(files) {
    if (!files || !files.length) return;
    setSaving(true);
    const results = await Promise.all(Array.from(files).map(parseFile));
    setBatch(results);
    setSaving(false);
    setShowSheet(true);
  }

  function updateBatch(i, field, value) {
    setBatch((b) => b.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function saveAll() {
    const valid = batch.filter((b) => b.name && b.department && b.items.length && !b.error);
    if (!valid.length) return;
    const newTpls = valid.map((b) => ({
      id: 'tpl_' + Date.now() + '_' + Math.random().toString(36).slice(2),
      name: b.name,
      department: b.department,
      sections: [{ id: 'sec_' + Date.now(), name: 'Checklist', weight: 1,
        items: b.items.map((text, i) => ({ id: 'ci_' + i + '_' + Date.now(), text })) }]
    }));
    onUpdate({ ...data, templates: [...data.templates, ...newTpls] });
    setShowSheet(false);
    setBatch([]);
  }

  function deleteTemplate(id) {
    if (!confirm('Remove this template from the library?')) return;
    onUpdate({ ...data, templates: data.templates.filter((t) => t.id !== id) });
  }

  const readyCount = batch.filter((b) => b.department && b.items.length && !b.error).length;

  return (
    <div className="screen fade-in">
      <div className="tab-strip" style={{ marginBottom: 16 }}>
        <button className={'tab-btn' + (libTab === 'templates' ? ' active' : '')} onClick={() => setLibTab('templates')}>Templates</button>
        <button className={'tab-btn' + (libTab === 'team' ? ' active' : '')} onClick={() => setLibTab('team')}>Team</button>
      </div>
      {libTab === 'templates' && (<>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Template Library</h2>
        <button onClick={() => fileRef.current?.click()} disabled={saving} style={{
          display: 'flex', gap: 6, alignItems: 'center', padding: '9px 14px',
          borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#6A1FC2)',
          color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1
        }}>
          <Icon name="upload" size={14} color="#fff" /> {saving ? 'Reading…' : 'Upload Files'}
        </button>
        <input ref={fileRef} type="file" multiple accept=".docx,.xlsx,.xls,.csv,.txt,.doc"
        style={{ display: 'none' }}
        onChange={(e) => {handleFiles(e.target.files);e.target.value = '';}} />
      </div>
      <p style={{ fontSize: 12, color: '#A8A29E', marginBottom: 16 }}>Select multiple files at once — hold Cmd / Ctrl when picking</p>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        {data.templates.length === 0 &&
        <div style={{ textAlign: 'center', padding: '48px 16px', color: '#A8A29E', fontSize: 14 }}>No templates yet — tap Upload Files to add yours</div>
        }
        {data.templates.map((t, i) =>
        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < data.templates.length - 1 ? '1px solid #F5F4F1' : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: '#78716C', marginTop: 2 }}>{t.sections.reduce((n, s) => n + s.items.length, 0)} items</div>
            </div>
            <button onClick={() => deleteTemplate(t.id)} style={{ padding: 6, color: '#A8A29E', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Icon name="x" size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Batch review sheet */}
      {showSheet &&
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}
      onClick={() => setShowSheet(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#F7F6F3', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 20px 12px', background: '#fff', borderBottom: '1px solid #EEEDEB', borderRadius: '20px 20px 0 0', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>Review Uploads</h3>
                  <p style={{ fontSize: 12, color: '#78716C', marginTop: 2 }}>{batch.length} file{batch.length !== 1 ? 's' : ''} — assign a department to each</p>
                </div>
                <button onClick={() => setShowSheet(false)} style={{ color: '#78716C', padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} /></button>
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px' }}>
              {batch.map((b, i) =>
            <div key={i} className="card" style={{ marginBottom: 10, opacity: b.error ? 0.5 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: b.error ? 0 : 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1917' }}>{b.name}</div>
                      {b.error ?
                  <div style={{ fontSize: 12, color: '#DC2626', marginTop: 2 }}>{b.error}</div> :
                  <div style={{ fontSize: 12, color: '#78716C', marginTop: 2 }}>{b.items.length} items detected</div>
                  }
                    </div>
                    {b.department && !b.error && <Icon name="check" size={16} color="#059669" sw={2.5} />}
                  </div>
                  {!b.error &&
              <select className="soc-input soc-select" value={b.department}
              onChange={(e) => updateBatch(i, 'department', e.target.value)}
              style={{ fontSize: 13, padding: '9px 12px' }}>
                      <option value="">Assign department…</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
              }
                </div>
            )}
            </div>

            <div style={{ padding: '12px 16px 32px', background: '#fff', borderTop: '1px solid #EEEDEB', flexShrink: 0 }}>
              <button className="btn-primary" onClick={saveAll}
            disabled={readyCount === 0}
            style={{ opacity: readyCount > 0 ? 1 : 0.35 }}>
                Save {readyCount} Template{readyCount !== 1 ? 's' : ''} to Library
              </button>
            </div>
          </div>
        </div>
      }
      </>)}
      {libTab === 'team' && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p className="label" style={{ margin: 0 }}>Team Members</p>
            <button onClick={() => { setNewUser({ name: '', role: 'teamleader' }); setShowAddUser(true); }} style={{
              display: 'flex', gap: 6, alignItems: 'center', padding: '8px 14px', borderRadius: 10,
              background: 'linear-gradient(135deg,#1565C0,#6A1FC2)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}><Icon name="plus" size={14} color="#fff" /> Add Member</button>
          </div>
          {['admin','manager','trainer','teamleader'].map(role => {
            const members = data.users.filter(u => u.role === role);
            if (!members.length) return null;
            return (
              <div key={role} style={{ marginBottom: 16 }}>
                <p className="label">{ROLES[role]}s</p>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {members.map((u, i) => (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < members.length - 1 ? '1px solid #F5F4F1' : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 99, background: ROLE_COLOR[u.role] + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name="user" size={16} color={ROLE_COLOR[u.role]} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: '#78716C' }}>{ROLES[u.role]}</div>
                      </div>
                      {u.id !== 'u15' && (
                        <button onClick={() => { if (!confirm('Remove ' + u.name + '?')) return; onUpdate({ ...data, users: data.users.filter(x => x.id !== u.id) }); }}
                          style={{ padding: 6, color: '#A8A29E', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Icon name="x" size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {showAddUser && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}
              onClick={() => setShowAddUser(false)}>
              <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, padding: '22px 20px 36px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>Add Team Member</h3>
                  <button onClick={() => setShowAddUser(false)} style={{ color: '#78716C', padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <p className="label">Full Name</p>
                    <input className="soc-input" placeholder="e.g. Sarah M." value={newUser.name}
                      onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))} />
                  </div>
                  <div>
                    <p className="label">Role</p>
                    <select className="soc-input soc-select" value={newUser.role}
                      onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}>
                      <option value="teamleader">Team Leader</option>
                      <option value="trainer">Crew Trainer</option>
                      <option value="manager">Manager</option>
                      <option value="admin">GM / Dept. Manager</option>
                    </select>
                  </div>
                </div>
                <button className="btn-primary" style={{ marginTop: 20, opacity: newUser.name.trim() ? 1 : 0.35 }}
                  disabled={!newUser.name.trim()}
                  onClick={() => {
                    const u = { id: 'u_' + Date.now(), name: newUser.name.trim(), role: newUser.role, outlet: 'Brock' };
                    onUpdate({ ...data, users: [...data.users, u] });
                    setShowAddUser(false); setNewUser({ name: '', role: 'teamleader' });
                  }}>Add to Team</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── App Root ──────────────────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [viewCheck, setViewCheck] = useState(null);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {setData(loadAppData());}, []);

  function persist(d) {setData(d);saveAppData(d);}

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#78716C', fontFamily: 'DM Sans, sans-serif' }}>
        Loading…
      </div>);

  }

  const unread = 0;

  if (!user) {
    return (
      <div className="app-shell">
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <LoginScreen onLogin={(u) => {setUser(u);setTab('dashboard');}} />
        </div>
      </div>);

  }

  return (
    <div className="app-shell">
      {/* Submit success modal */}
      {submitted &&
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={() => setSubmitted(null)}>
          <div onClick={(e) => e.stopPropagation()} className="card fade-in" style={{ width: '100%', maxWidth: 340, textAlign: 'center', padding: 28 }}>
            <div style={{ width: 60, height: 60, borderRadius: 99, background: scoreStyle(submitted.score).bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon name="check" size={30} color={scoreStyle(submitted.score).color} sw={2.5} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Check Submitted</h3>
            <p style={{ fontSize: 13, color: '#78716C', marginBottom: 14 }}>{submitted.traineeName} · {submitted.department}</p>
            <div style={{ fontSize: 48, fontWeight: 700, color: scoreStyle(submitted.score).color, letterSpacing: '-0.04em', marginBottom: 6 }}>{submitted.score}%</div>
            <button className="btn-primary" onClick={() => setSubmitted(null)}>Done</button>
          </div>
        </div>
      }

      {viewCheck && <CheckDetailModal check={viewCheck} data={data} onClose={() => setViewCheck(null)} />}

      <TopBar user={user} onLogout={() => {setUser(null);setTab('dashboard');}} />

      {tab === 'new' ?
      <NewCheckScreen data={data} user={user}
      onSave={(d, c) => {persist(d);setSubmitted(c);setTab('dashboard');}}
      onBack={() => setTab('dashboard')} /> :

      <>
          <div className="main-area">
            <BottomNav tab={tab} setTab={setTab} role={user.role} />
            <div className="content-wrap">
              {tab === 'dashboard' && <DashboardScreen data={data} user={user} onNewCheck={() => setTab('new')} onViewCheck={setViewCheck} />}
              {tab === 'history' && <HistoryScreen data={data} user={user} onViewCheck={setViewCheck} />}
              {tab === 'reports' && <ReportsScreen data={data} user={user} />}
              {tab === 'templates' && <TemplatesScreen data={data} onUpdate={persist} />}
            </div>
          </div>
        </>
      }
    </div>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);