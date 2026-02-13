const { useState } = React;

function SignupPage() {
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem('reactBaseUrl') || location.origin);
  const [form, setForm] = useState({ username:'', password:'', nickname:'', email:'' });
  const [msg, setMsg] = useState('');
  const [toast, setToast] = useState('');

  const api = async (path, options = {}) => {
    localStorage.setItem('reactBaseUrl', baseUrl);
    const res = await fetch(`${baseUrl}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);
    return body;
  };

  const completeSignup = async () => {
    try {
      await api('/api/users', { method:'POST', body: JSON.stringify(form) });
      await api('/api/login', { method:'POST', body: JSON.stringify({ username: form.username, password: form.password }) });
      setToast('가입 완료, 게시판으로 이동');
      setTimeout(() => {
        location.href = '/board.html';
      }, 1000);
    } catch (e) {
      setToast('');
      setMsg(`회원가입 실패: ${e.message}`);
    }
  };

  const cancelSignup = () => {
    location.href = '/';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
      <header className="card p-5 text-center">
        <h1 className="text-2xl font-bold">Koreanit 게시판</h1>
        <p className="text-sm text-slate-500 mt-1">회원가입</p>
      </header>

      <section className="card p-5 space-y-3">
        <input className="input" value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} placeholder="http://localhost:8080"/>
        <input className="input" placeholder="username" value={form.username} onChange={e=>setForm({...form, username:e.target.value})}/>
        <input className="input" type="password" placeholder="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        <input className="input" placeholder="nickname" value={form.nickname} onChange={e=>setForm({...form, nickname:e.target.value})}/>
        <input className="input" placeholder="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>

        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={completeSignup}>완료</button>
          <button className="btn btn-muted" onClick={cancelSignup}>취소</button>
        </div>
      </section>

      {msg && <p className="text-sm text-slate-600">{msg}</p>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SignupPage />);
