const { useState, useEffect } = React;

function App() {
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem('reactBaseUrl') || location.origin);
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [logs, setLogs] = useState('Ready\n');

  const [signup, setSignup] = useState({ username:'', password:'', nickname:'', email:'' });
  const [login, setLogin] = useState({ username:'', password:'' });
  const [postForm, setPostForm] = useState({ title:'', content:'' });
  const [commentForm, setCommentForm] = useState({ postId:'', content:'', commentId:'' });
  const [comments, setComments] = useState([]);

  const appendLog = (title, payload) => {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
    setLogs(prev => `[${new Date().toLocaleTimeString()}] ${title}\n${text}\n\n` + prev);
  };

  const api = async (path, options = {}) => {
    localStorage.setItem('reactBaseUrl', baseUrl);
    const res = await fetch(`${baseUrl}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });

    let body;
    try { body = await res.json(); }
    catch { body = { message: 'JSON 응답이 아닙니다.' }; }

    appendLog(`${options.method || 'GET'} ${path} [${res.status}]`, body);
    if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);
    return body;
  };

  const loadMe = async () => {
    try {
      const r = await api('/api/me');
      setMe(r?.data || null);
    } catch {
      setMe(null);
    }
  };

  const loadPosts = async () => {
    try {
      const r = await api('/api/posts?page=1&limit=20');
      setPosts(r?.data || []);
    } catch (e) {
      appendLog('게시글 조회 실패', e.message);
    }
  };

  const doSignup = async () => {
    try { await api('/api/users', { method:'POST', body: JSON.stringify(signup) }); }
    catch (e) { appendLog('회원가입 실패', e.message); }
  };

  const doLogin = async () => {
    try {
      await api('/api/login', { method:'POST', body: JSON.stringify(login) });
      await loadMe();
    } catch (e) {
      appendLog('로그인 실패', e.message);
    }
  };

  const doLogout = async () => {
    try {
      await api('/api/logout', { method:'POST' });
      setMe(null);
    } catch (e) {
      appendLog('로그아웃 실패', e.message);
    }
  };

  const createPost = async () => {
    try {
      await api('/api/posts', { method:'POST', body: JSON.stringify(postForm) });
      setPostForm({ title:'', content:'' });
      await loadPosts();
    } catch (e) {
      appendLog('게시글 생성 실패', e.message);
    }
  };

  const loadComments = async () => {
    if (!commentForm.postId) return;
    try {
      const r = await api(`/api/posts/${commentForm.postId}/comments?limit=20`);
      setComments(r?.data || []);
    } catch (e) {
      appendLog('댓글 조회 실패', e.message);
    }
  };

  const createComment = async () => {
    if (!commentForm.postId || !commentForm.content.trim()) return;
    try {
      await api(`/api/posts/${commentForm.postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: commentForm.content })
      });
      setCommentForm({ ...commentForm, content: '' });
      await loadComments();
    } catch (e) {
      appendLog('댓글 생성 실패', e.message);
    }
  };

  const deleteComment = async () => {
    if (!commentForm.commentId) return;
    try {
      await api(`/api/comments/${commentForm.commentId}`, { method: 'DELETE' });
      setCommentForm({ ...commentForm, commentId: '' });
      await loadComments();
    } catch (e) {
      appendLog('댓글 삭제 실패', e.message);
    }
  };

  useEffect(() => {
    loadMe();
    loadPosts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <header className="card p-5 text-center">
        <h1 className="text-2xl font-bold">KOREAN IT</h1>
        <div className="mt-4 flex flex-wrap gap-2 items-center justify-center">
          {me && (
            <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700">
              {`로그인됨: ${me.username} (#${me.id})`}
            </span>
          )}
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 space-y-3">
          <h2 className="text-lg font-semibold">회원가입 / 로그인</h2>
          <div className="grid grid-cols-2 gap-2">
            <input className="input" placeholder="username" value={signup.username} onChange={e=>setSignup({...signup, username:e.target.value})}/>
            <input className="input" type="password" placeholder="password" value={signup.password} onChange={e=>setSignup({...signup, password:e.target.value})}/>
            <input className="input" placeholder="nickname" value={signup.nickname} onChange={e=>setSignup({...signup, nickname:e.target.value})}/>
            <input className="input" placeholder="email" value={signup.email} onChange={e=>setSignup({...signup, email:e.target.value})}/>
          </div>
          <button className="btn btn-primary" onClick={doSignup}>회원가입</button>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t">
            <input className="input" placeholder="username" value={login.username} onChange={e=>setLogin({...login, username:e.target.value})}/>
            <input className="input" type="password" placeholder="password" value={login.password} onChange={e=>setLogin({...login, password:e.target.value})}/>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={doLogin}>로그인</button>
            <button className="btn btn-muted" onClick={doLogout}>로그아웃</button>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="text-lg font-semibold">게시글</h2>
          <input className="input" placeholder="title" value={postForm.title} onChange={e=>setPostForm({...postForm, title:e.target.value})}/>
          <textarea className="input" rows="3" placeholder="content" value={postForm.content} onChange={e=>setPostForm({...postForm, content:e.target.value})}></textarea>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={createPost}>작성</button>
            <button className="btn btn-muted" onClick={loadPosts}>새로고침</button>
          </div>
          <div className="space-y-2 max-h-72 overflow-auto pr-1">
            {posts.map(p => (
              <div key={p.id} className="border rounded-lg p-3">
                <div className="font-semibold">#{p.id} {p.title}</div>
                <div className="text-sm text-slate-600 mt-1">{p.content}</div>
              </div>
            ))}
            {posts.length===0 && <p className="text-sm text-slate-500">게시글이 없습니다.</p>}
          </div>
        </div>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="text-lg font-semibold">댓글</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input className="input" type="number" placeholder="postId" value={commentForm.postId} onChange={e=>setCommentForm({...commentForm, postId:e.target.value})}/>
          <input className="input md:col-span-2" placeholder="댓글 내용" value={commentForm.content} onChange={e=>setCommentForm({...commentForm, content:e.target.value})}/>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-primary" onClick={createComment}>댓글 등록</button>
          <button className="btn btn-muted" onClick={loadComments}>댓글 조회</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input className="input" type="number" placeholder="삭제할 commentId" value={commentForm.commentId} onChange={e=>setCommentForm({...commentForm, commentId:e.target.value})}/>
          <button className="btn btn-muted md:col-span-2" onClick={deleteComment}>댓글 삭제</button>
        </div>

        <div className="space-y-2 max-h-64 overflow-auto pr-1">
          {comments.map(c => (
            <div key={c.id} className="border rounded-lg p-3">
              <div className="font-semibold">댓글 #{c.id}</div>
              <div className="text-sm text-slate-600 mt-1">{c.content}</div>
            </div>
          ))}
          {comments.length===0 && <p className="text-sm text-slate-500">댓글 목록이 없습니다.</p>}
        </div>
      </section>

      <section className="card p-5">
        <h3 className="font-semibold mb-2">응답 로그</h3>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs max-h-96 overflow-auto">{logs}</pre>
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
