const { useState } = React;

function LoginPage() {
  const [baseUrl] = useState(localStorage.getItem('reactBaseUrl') || location.origin);
  const [login, setLogin] = useState({ username:'', password:'' });
  const [msg, setMsg] = useState('');

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

  const doLogin = async () => {
    try {
      await api('/api/login', { method:'POST', body: JSON.stringify(login) });
      location.href = '/posts.html';
    } catch (e) {
      setMsg(`로그인 실패: ${e.message}`);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 md:p-8 space-y-6">
      <header className="card p-5 text-center"><h1 className="text-2xl font-bold">Koreanit 게시판</h1></header>
      <section className="card p-5 space-y-3">
        <h2 className="text-lg font-semibold">로그인</h2>
        <input className="input" placeholder="username" value={login.username} onChange={e=>setLogin({...login, username:e.target.value})}/>
        <input className="input" type="password" placeholder="password" value={login.password} onChange={e=>setLogin({...login, password:e.target.value})}/>
        <div className="flex gap-2 justify-center">
          <button className="btn btn-primary" onClick={doLogin}>로그인</button>
          <button className="btn btn-muted" onClick={() => location.href='/signup.html'}>회원가입</button>
        </div>
      </section>
      {msg && <p className="text-sm text-slate-600 text-center">{msg}</p>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<LoginPage />);