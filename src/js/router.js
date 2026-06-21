const routes = {
  signin: 'pages/signin.html',
  dashboard: 'pages/dashboard.html'
};

const Router = {
  async navigate(view) {
    const app = document.getElementById('app');

    if (view === 'dashboard') {
      const authenticated = await window.Auth.isAuthenticated();
      if (!authenticated) {
        view = 'signin';
      }
    }

    try {
      const response = await fetch(routes[view]);
      if (!response.ok) {
        throw new Error(`View not found: ${view}`);
      }
      const html = await response.text();
      app.innerHTML = html;

      // Re-execute any inline scripts from the loaded view
      const scripts = app.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        document.body.appendChild(newScript);
        oldScript.remove();
      });
    } catch (err) {
      app.innerHTML = `<div class="container mt-5"><div class="alert alert-danger">Failed to load view: ${err.message}</div></div>`;
    }
  },

  async init() {
    const authenticated = await window.Auth.isAuthenticated();
    await this.navigate(authenticated ? 'dashboard' : 'signin');
  }
};

window.Router = Router;

Router.init();
