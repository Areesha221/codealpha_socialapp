function renderLogin() {
  const container = document.getElementById('feed-content');
  if (!container) return;

  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 80vh;">
      <div class="card border-0" style="background: var(--bg-primary); border: 1px solid var(--border-color) !important; width: 350px;">
        <div class="card-body p-5 text-center">
          <h2 class="text-white mb-4" style="font-family: cursive; font-size: 2.5rem;">SocialApp</h2>
          <form onsubmit="handleLogin(event)">
            <div class="mb-3">
              <input type="text" class="form-control bg-dark border-secondary rounded" 
                     id="login-username" placeholder="Username" required
                     style="color: #fff; height: 50px;">
            </div>
            <div class="mb-4 position-relative">
              <input type="password" class="form-control bg-dark border-secondary rounded" 
                     id="login-password" placeholder="Password" required
                     style="color: #fff; height: 50px; padding-right: 45px;">
              <button type="button" class="btn btn-link position-absolute text-white" 
                      style="right: 10px; top: 50%; transform: translateY(-50%); z-index: 10; background: transparent;"
                      onclick="togglePassword('login-password', this)">
                <i class="bi bi-eye fs-5"></i>
              </button>
            </div>
            <button type="submit" class="btn btn-primary w-100 rounded mb-3" style="height: 50px; font-weight: 600;">Log In</button>
          </form>
          <p class="text-muted small">
            Don't have an account? 
            <a href="#" class="text-primary text-decoration-none" onclick="renderRegister()">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

function renderRegister() {
  const container = document.getElementById('feed-content');
  if (!container) return;

  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 80vh;">
      <div class="card border-0" style="background: var(--bg-primary); border: 1px solid var(--border-color) !important; width: 350px;">
        <div class="card-body p-4 text-center">
          <h2 class="text-white mb-2" style="font-family: cursive; font-size: 2.5rem;">SocialApp</h2>
          <p class="text-muted mb-4 small">Sign up to see photos and videos from your friends.</p>
          <form onsubmit="handleRegister(event)">
            <div class="mb-3">
              <input type="email" class="form-control bg-dark border-secondary rounded" 
                     id="register-email" placeholder="Email" required
                     style="color: #fff; height: 45px;">
            </div>
            <div class="mb-3">
              <input type="text" class="form-control bg-dark border-secondary rounded" 
                     id="register-fullname" placeholder="Full Name" required
                     style="color: #fff; height: 45px;">
            </div>
            <div class="mb-3">
              <input type="text" class="form-control bg-dark border-secondary rounded" 
                     id="register-username" placeholder="Username" required
                     style="color: #fff; height: 45px;">
            </div>
            <div class="mb-4 position-relative">
              <input type="password" class="form-control bg-dark border-secondary rounded" 
                     id="register-password" placeholder="Password" minlength="6" required
                     style="color: #fff; height: 45px; padding-right: 45px;">
              <button type="button" class="btn btn-link position-absolute text-white" 
                      style="right: 10px; top: 50%; transform: translateY(-50%); z-index: 10; background: transparent;"
                      onclick="togglePassword('register-password', this)">
                <i class="bi bi-eye fs-5"></i>
              </button>
            </div>
            <button type="submit" class="btn btn-primary w-100 rounded mb-3" style="height: 45px; font-weight: 600;">Sign Up</button>
          </form>
          <p class="text-muted small">
            Have an account? 
            <a href="#" class="text-primary text-decoration-none" onclick="renderLogin()">Log in</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  const icon = button.querySelector('i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('bi-eye');
    icon.classList.add('bi-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('bi-eye-slash');
    icon.classList.add('bi-eye');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  
  try {
    // ✅ FIXED: Updated to Render Production URL
    const response = await fetch('https://codealpha-socialapp-backend.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: username,
        email: username,
        password: password 
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      const userToSave = data.user || data;
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      localStorage.setItem('user', JSON.stringify(userToSave));
      
      if (typeof showToast === 'function') showToast('Logged in successfully!', 'success');
      
      if (typeof window.finalizeAccountSwitch === 'function') {
        window.finalizeAccountSwitch(userToSave);
      } else {
        setTimeout(() => {
          if (typeof navigate === 'function') navigate('feed');
          if (typeof updateNavigation === 'function') updateNavigation();
        }, 100);
      }
      
    } else {
      if (typeof showToast === 'function') showToast(data.message || 'Login failed', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    if (typeof showToast === 'function') showToast('Network error: ' + error.message, 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('register-email').value;
  const fullName = document.getElementById('register-fullname').value;
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  
  try {
    // ✅ FIXED: Updated to Render Production URL
    const response = await fetch('https://codealpha-socialapp-backend.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName, username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      const userToSave = data.user || data;
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      localStorage.setItem('user', JSON.stringify(userToSave));
      
      if (typeof showToast === 'function') showToast('Account created!', 'success');
      
      if (typeof window.finalizeAccountSwitch === 'function') {
        window.finalizeAccountSwitch(userToSave);
      } else {
        setTimeout(() => {
          if (typeof navigate === 'function') navigate('feed');
          if (typeof updateNavigation === 'function') updateNavigation();
        }, 100);
      }
      
    } else {
      if (typeof showToast === 'function') showToast(data.message || 'Registration failed', 'error');
    }
  } catch (error) {
    console.error('Register error:', error);
    if (typeof showToast === 'function') showToast('Network error', 'error');
  }
}

// Export all functions
window.renderLogin = renderLogin;
window.renderRegister = renderRegister;
window.togglePassword = togglePassword;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;