const { useState, useEffect } = React;

function PostCreatePage() {
  const [baseUrl] = useState(localStorage.getItem('reactBaseUrl') || location.origin);
  const [form, setForm] = useState({ title: '', content: '' });
  const [msg, setMsg] = useState('');

  const api = async (path, options = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);
    return body;
  };

  const guardLogin = async () => {
    try { await api('/api/me'); } catch { location.href = '/'; }
  };

  const createPost = async () => {
    try {
      const r = await api('/api/posts', { method: 'POST', body: JSON.stringify(form) });
      const postId = r?.data?.id;
      if (postId) location.href = `/comments.html?postId=${postId}`;
      else location.href = '/posts.html';
    } catch (e) {
      setMsg(`작성 실패: ${e.message}`);
    }
  };

  useEffect(() => { guardLogin(); }, []);

  return (
    <div className="max-w-[39rem] mx-auto p-4 md:p-8 space-y-6">
      <header className="card p-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">게시글 작성</h1>
        <button className="btn btn-muted" onClick={() => location.href='/posts.html'}>목록으로</button>
      </header>

      <section className="card p-5 space-y-3">
        <input className="input break-all" style={{ maxWidth: '50ch' }} placeholder="제목" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <textarea className="input break-all" style={{ maxWidth: '50ch' }} rows="6" placeholder="내용" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}></textarea>
        <div className="flex gap-2 justify-center">
          <button className="btn btn-primary" onClick={createPost}>작성 완료</button>
          <button className="btn btn-muted" onClick={() => location.href='/posts.html'}>취소</button>
        </div>
        {msg && <p className="text-sm text-rose-600 text-center">{msg}</p>}
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<PostCreatePage />);