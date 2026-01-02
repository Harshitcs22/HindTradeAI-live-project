// assets/js/auth-logic.js

// 1. Tab Switching (Login vs Signup)
function toggleTab(tab) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginTab = document.getElementById('tab-login');
    const signupTab = document.getElementById('tab-signup');

    if(tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginTab.classList.add('text-blue-400', 'border-b-2', 'border-blue-400');
        loginTab.classList.remove('text-gray-400');
        signupTab.classList.remove('text-blue-400', 'border-b-2', 'border-blue-400');
        signupTab.classList.add('text-gray-400');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        signupTab.classList.add('text-blue-400', 'border-b-2', 'border-blue-400');
        signupTab.classList.remove('text-gray-400');
        loginTab.classList.remove('text-blue-400', 'border-b-2', 'border-blue-400');
        loginTab.classList.add('text-gray-400');
    }
}

// 2. Role Selection Logic
function selectRole(role) {
    document.getElementById('role').value = role;
    
    // Reset buttons
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('border-blue-500', 'bg-blue-500/20', 'text-white');
        btn.classList.add('border-white/10', 'bg-white/5', 'text-gray-400');
    });
    
    // Highlight active button
    const activeBtn = document.querySelector(`button[data-role="${role}"]`);
    activeBtn.classList.remove('border-white/10', 'bg-white/5', 'text-gray-400');
    activeBtn.classList.add('border-blue-500', 'bg-blue-500/20', 'text-white');
}

// 3. Handle SIGN UP (FIXED: Manual profile creation with correct schema)
async function handleSignup(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('fullName').value;
    const companyName = document.getElementById('companyName').value;
    const phone = document.getElementById('phone').value;
    const role = document.getElementById('role').value; // 'exporter', 'ca', 'cha'
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const businessCategory = document.getElementById('businessCategory').value;

    const errorMsg = document.getElementById('error-msg');
    const successMsg = document.getElementById('success-msg');
    
    errorMsg.classList.add('hidden');
    successMsg.classList.add('hidden');

    try {
        // Step 1: Sign up with Supabase Auth
        const { data: authData, error: authError } = await window.sb.auth.signUp({
            email,
            password
        });

        if (authError) throw authError;

        if (!authData.user) {
            throw new Error('User creation failed');
        }

        console.log('✅ Auth user created:', authData.user.id);

        // Step 2: Create profile in user_profiles table using correct column name (id, not user_id)
        const { data: profileData, error: profileError } = await window.sb
            .from('user_profiles')
            .insert([{
                id: authData.user.id,
                email: email,
                full_name: fullName,
                company_name: companyName,
                phone: phone,
                city: city,
                state: state,
                business_category: businessCategory,
                role: role,
                status: 'active',
                trust_score: 0,
                shipments_completed: 0,
                credits: 100
            }])
            .select()
            .single();

        if (profileError) {
            console.error('Profile creation error:', profileError);
            throw new Error('Database error saving new user: ' + profileError.message);
        }

        console.log('✅ Profile created:', profileData);

        successMsg.innerText = '✅ Signup successful! Redirecting to dashboard...';
        successMsg.classList.remove('hidden');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);

    } catch (error) {
        console.error('Signup error:', error);
        errorMsg.innerText = '❌ ' + error.message;
        errorMsg.classList.remove('hidden');
    }
}

// 4. Handle LOGIN
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('error-msg');

    try {
        const { data, error } = await window.sb.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        console.log('✅ Login successful, redirecting to dashboard...');

        // Redirect to dashboard on success
        window.location.href = 'dashboard.html';

    } catch (err) {
        console.error('Login error:', err);
        errorMsg.innerText = '❌ ' + err.message;
        errorMsg.classList.remove('hidden');
    }
}
