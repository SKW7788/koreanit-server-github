const { useState, useEffect } = React;

function PostsPage() {
  const [baseUrl] = useState(localStorage.getItem('reactBaseUrl') || location.origin);
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);

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

  const loadMe = async () => {
    try {
      const r = await api('/api/me');
      setMe(r?.data || null);
    } catch {
      location.href = '/';
    }
  };

  const loadPosts = async () => {
    const r = await api('/api/posts?page=1&limit=50');
    setPosts(r?.data || []);
  };

  const logout = async () => {
    await api('/api/logout', { method: 'POST' });
    location.href = '/';
  };

  useEffect(() => { loadMe(); loadPosts(); }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <header className="card p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">Koreanit 게시판</h1>
            {me && <p className="text-sm text-slate-500 mt-1">{me.username}님</p>}
          </div>
          <div className="flex gap-2">
            <button className="btn btn-muted" onClick={logout}>로그아웃</button>
          </div>
        </div>
      </header>

      <section className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">게시글 목록</h2>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={() => location.href='/post-create.html'}>게시글 작성</button>
            <button className="btn btn-muted" onClick={loadPosts}>새로고침</button>
          </div>
        </div>

        <div className="space-y-2">
          {posts.map((p, idx) => (
            <div key={p.id} className="border rounded-lg p-3">
              <button className="text-left w-full" onClick={() => location.href=`/comments.html?postId=${p.id}`}>
                <p className="font-semibold text-black break-all" style={{ maxWidth: '50ch' }}>
                  <span className="text-indigo-700 underline">{idx + 1}. #{p.id}</span>
                  <span> {p.title}</span>
                </p>
                <p className="text-sm text-slate-600 break-all" style={{ maxWidth: '50ch' }}>{p.content}</p>
              </button>
            </div>
          ))}
          {posts.length === 0 && <p className="text-sm text-slate-500">게시글이 없습니다.</p>}
        </div>
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<PostsPage />);