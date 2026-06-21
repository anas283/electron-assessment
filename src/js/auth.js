const db = new PouchDB('user_credentials');

const Auth = {
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    const response = await window.api.login({ username, password });

    if (!response.token) {
      throw new Error('Login failed: no token received');
    }

    window.api.setToken(response.token);

    try {
      const existing = await db.get('currentUser');
      await db.put({
        _id: 'currentUser',
        _rev: existing._rev,
        username,
        token: response.token,
        lastLogin: new Date().toISOString()
      });
    } catch (err) {
      if (err.status === 404) {
        await db.put({
          _id: 'currentUser',
          username,
          token: response.token,
          lastLogin: new Date().toISOString()
        });
      } else {
        throw err;
      }
    }

    return response;
  },

  async logout() {
    window.api.clearToken();
    try {
      const doc = await db.get('currentUser');
      await db.remove(doc);
    } catch (err) {
      // Ignore not found or other errors
    }
  },

  async isAuthenticated() {
    const token = window.api.getToken();
    if (token) return true;

    try {
      const doc = await db.get('currentUser');
      if (doc.token) {
        window.api.setToken(doc.token);
        return true;
      }
    } catch (err) {
      // No stored session
    }

    return false;
  },

  async getCurrentUser() {
    try {
      return await db.get('currentUser');
    } catch (err) {
      return null;
    }
  }
};

window.Auth = Auth;
