const { useState, useEffect } = React;

function CommentsPage() {
  const [baseUrl] = useState(localStorage.getItem('reactBaseUrl') || location.origin);
  const [me, setMe] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const params = new URLSearchParams(location.search);
  const postId = params.get('postId');

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

  const init = async () => {
    if (!postId) {
      location.href = '/posts.html';
      return;
    }
    try {
      const meRes = await api('/api/me');
      setMe(meRes?.data || null);
    } catch {
      location.href = '/';
      return;
    }

    try {
      const postRes = await api(`/api/posts/${postId}`);
      setPost(postRes?.data || null);
    } catch {
      setPost(null);
    }

    await loadComments();
  };

  const loadComments = async () => {
    const r = await api(`/api/posts/${postId}/comments?limit=50`);
    setComments(r?.data || []);
  };

  const createComment = async () => {
    if (!newComment.trim()) return;
    await api(`/api/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content: newComment.trim() }) });
    setNewComment('');
    await loadComments();
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditingContent(c.content);
  };

  const saveEdit = async () => {
    if (!editingId || !editingContent.trim()) return;
    await api(`/api/comments/${editingId}`, { method: 'PUT', body: JSON.stringify({ content: editingContent.trim() }) });
    setEditingId(null);
    setEditingContent('');
    await loadComments();
  };

  const removeComment = async (id) => {
    await api(`/api/comments/${id}`, { method: 'DELETE' });
    await loadComments();
  };

  useEffect(() => { init(); }, []);

  return (
    <div className="max-w-md mx-auto p-4 md:p-8 space-y-6">
      <header className="card p-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">댓글 페이지</h1>
        <button className="btn btn-muted" onClick={() => location.href='/posts.html'}>목록으로</button>
      </header>

      {post && (
        <section className="card p-5 space-y-2">
          <h2 className="text-lg font-semibold break-all" style={{ maxWidth: '50ch' }}>#{post.id} {post.title}</h2>
          <p className="text-slate-700 break-all" style={{ maxWidth: '50ch' }}>{post.content}</p>
        </section>
      )}

      <section className="card p-5 space-y-3">
        <h3 className="font-semibold">댓글 작성</h3>
        <div className="flex gap-2">
          <input className="input break-all" style={{ maxWidth: '50ch' }} placeholder="댓글 입력" value={newComment} onChange={e => setNewComment(e.target.value)} />
          <button className="btn btn-primary" onClick={createComment}>등록</button>
        </div>
      </section>

      <section className="card p-5 space-y-2">
        <h3 className="font-semibold">댓글 목록</h3>
        {comments.map(c => {
          const mine = me && Number(me.id) === Number(c.userId);
          const editing = editingId === c.id;
          return (
            <div key={c.id} className="border rounded-lg p-3 space-y-2">
              <p className="text-xs text-slate-500">#{c.id} · 작성자 #{c.userId}</p>
              {!editing ? <p className="break-all" style={{ maxWidth: '50ch' }}>{c.content}</p> : <input className="input break-all" style={{ maxWidth: '50ch' }} value={editingContent} onChange={e => setEditingContent(e.target.value)} />}
              {mine && (
                <div className="flex gap-2">
                  {!editing ? (
                    <button className="btn btn-muted" onClick={() => startEdit(c)}>수정</button>
                  ) : (
                    <>
                      <button className="btn btn-primary" onClick={saveEdit}>수정완료</button>
                      <button className="btn btn-muted" onClick={() => { setEditingId(null); setEditingContent(''); }}>취소</button>
                    </>
                  )}
                  <button className="btn btn-muted" onClick={() => removeComment(c.id)}>삭제</button>
                </div>
              )}
            </div>
          );
        })}
        {comments.length === 0 && <p className="text-sm text-slate-500">댓글이 없습니다.</p>}
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CommentsPage />);