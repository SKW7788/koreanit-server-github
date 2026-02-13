window.ApiClient = {
  baseUrl() {
    return localStorage.getItem('apiBaseUrl') || location.origin;
  },
  setBaseUrl(url) {
    localStorage.setItem('apiBaseUrl', url);
  },
  async request(path, options = {}) {
    const res = await fetch(`${this.baseUrl()}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });

    let body;
    try { body = await res.json(); }
    catch { body = { message: 'JSON 응답이 아닙니다.' }; }

    if (!res.ok) {
      const err = new Error(body?.message || `HTTP ${res.status}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    return body;
  },

  me() { return this.request('/api/me'); },
  signup(payload) { return this.request('/api/users', { method: 'POST', body: JSON.stringify(payload) }); },
  login(payload) { return this.request('/api/login', { method: 'POST', body: JSON.stringify(payload) }); },
  logout() { return this.request('/api/logout', { method: 'POST' }); },

  users(limit = 20) { return this.request(`/api/users?limit=${limit}`); },

  posts(page = 1, limit = 20) { return this.request(`/api/posts?page=${page}&limit=${limit}`); },
  post(id) { return this.request(`/api/posts/${id}`); },
  createPost(payload) { return this.request('/api/posts', { method: 'POST', body: JSON.stringify(payload) }); },
  updatePost(id, payload) { return this.request(`/api/posts/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); },
  deletePost(id) { return this.request(`/api/posts/${id}`, { method: 'DELETE' }); },

  comments(postId, limit = 20) { return this.request(`/api/posts/${postId}/comments?limit=${limit}`); },
  createComment(postId, payload) { return this.request(`/api/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(payload) }); },
  deleteComment(id) { return this.request(`/api/comments/${id}`, { method: 'DELETE' }); }
};
