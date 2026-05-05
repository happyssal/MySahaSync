import { useState } from "react";
import { auth, db } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- Social Login (Google / GitHub) ---
  const handleSocialLogin = async (providerName) => {
    let provider;
    if (providerName === 'google') provider = new GoogleAuthProvider();
    if (providerName === 'github') provider = new GithubAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      // Social providers usually verify emails automatically
      toast.success(`Welcome ${result.user.displayName}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- Classic Sign Up / Sign In ---
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignup) {
        // 1. ACCOUNT CREATION
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. UPDATE PROFILE (USERNAME)
        await updateProfile(user, { displayName: username });

        // 3. SAVE TO FIRESTORE
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          username: username,
          email: email,
          createdAt: new Date()
        });

        // 4. SEND ACTIVATION LINK
        await sendEmailVerification(user);
        
        // 5. IMMEDIATE SIGN OUT
        await signOut(auth);
        
        toast.success("Account created! A verification link has been sent to your email. Please check your spam folder!", {
          duration: 8000,
        });
        setIsSignup(false); // Toggle to Sign In screen
        
      } else {
        // 1. ATTEMPT SIGN IN
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // 2. CHECK IF LINK WAS CLICKED
        if (!userCredential.user.emailVerified) {
          toast.error("Your account is not activated. Please click the link sent to your email.");
          await signOut(auth); // Prevent access if not verified
          return;
        }
        
        toast.success(`Glad to see you again, ${userCredential.user.displayName || 'User'}!`);
        navigate("/");
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') toast.error("This email is already in use.");
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        toast.error("Incorrect email or password.");
      } else toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-white/50">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-cyan-700">MySahaSync 🌿</h1>
          <p className="text-gray-500 mt-2 italic">Your daily health companion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-cyan-400 outline-none transition-all"
                placeholder="Enter your username"
                required={isSignup}
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-cyan-400 outline-none transition-all"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-cyan-400 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-200 transition-all disabled:opacity-50"
          >
            {loading ? "Loading..." : isSignup ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="relative my-8 text-center">
          <span className="bg-white px-4 text-gray-400 text-sm font-bold relative z-10">OR CONTINUE WITH</span>
          <div className="absolute top-1/2 w-full border-t border-gray-100"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-2xl hover:bg-gray-50 transition-all font-bold text-gray-600"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" />
            Google
          </button>
          <button 
            type="button"
            onClick={() => handleSocialLogin('github')}
            className="flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-2xl hover:bg-gray-50 transition-all font-bold text-gray-600"
          >
            <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="18" alt="GitHub" />
            GitHub
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-cyan-600 font-black hover:underline"
          >
            {isSignup ? "Sign In" : "Sign up for free"}
          </button>
        </p>
      </div>
    </div>
  );
}