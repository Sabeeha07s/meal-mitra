import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [donations, setDonations] = useState([]);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('mm_user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('mm_token') || '');
  const [message, setMessage] = useState('');
  const [auth, setAuth] = useState({ name: '', email: '', password: '', role: 'REQUESTER' });
  const [form, setForm] = useState({ title: '', description: '', quantity: '', foodType: 'Prepared food', pickupAddress: '', pickupTime: '' });
  const [chatInput, setChatInput] = useState('');
  const [chatReply, setChatReply] = useState('');

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
  }
  async function load() {
    try { setDonations(await request('/donations')); } catch (e) { setMessage(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function authenticate(path) {
    try {
      const data = await request(`/auth/${path}`, { method: 'POST', body: JSON.stringify(auth) });
      if (path === 'login') {
        localStorage.setItem('mm_token', data.token);
        localStorage.setItem('mm_user', JSON.stringify(data.user));
        setToken(data.token); setUser(data.user);
      } else setMessage('Account created. Please sign in.');
    } catch (e) { setMessage(e.message); }
  }
  async function createDonation(e) {
    e.preventDefault();
    try { await request('/donations', { method: 'POST', body: JSON.stringify(form) }); setMessage('Donation published.'); setForm({ title:'', description:'', quantity:'', foodType:'Prepared food', pickupAddress:'', pickupTime:'' }); load(); }
    catch (e) { setMessage(e.message); }
  }
  async function claim(id) {
    try { await request(`/donations/${id}/claim`, { method: 'PATCH' }); setMessage('Donation claimed successfully.'); load(); }
    catch (e) { setMessage(e.message); }
  }
  async function askAssistant(e) {
    e.preventDefault();
    try { const data = await request('/chat', { method: 'POST', body: JSON.stringify({ message: chatInput }) }); setChatReply(data.reply); }
    catch (e) { setChatReply(e.message); }
  }
  function logout() { localStorage.clear(); setToken(''); setUser(null); setMessage('Signed out.'); }

  return <main className="shell">
    <header><div><p className="eyebrow">SHARE FOOD · SUPPORT COMMUNITIES</p><h1>Meal Mitra</h1><p className="sub">A simple way to connect surplus food with people who need it.</p></div>
      {user ? <div className="userbox"><span>{user.name} · {user.role}</span><button className="secondary" onClick={logout}>Sign out</button></div> : <span className="pill">Community platform</span>}
    </header>
    {message && <div className="notice" role="status">{message}<button onClick={() => setMessage('')}>×</button></div>}
    {!user && <section className="panel"><h2>Join Meal Mitra</h2><div className="authgrid">
      <input placeholder="Name (for registration)" value={auth.name} onChange={e=>setAuth({...auth,name:e.target.value})}/>
      <input placeholder="Email" type="email" value={auth.email} onChange={e=>setAuth({...auth,email:e.target.value})}/>
      <input placeholder="Password (8+ characters)" type="password" value={auth.password} onChange={e=>setAuth({...auth,password:e.target.value})}/>
      <select value={auth.role} onChange={e=>setAuth({...auth,role:e.target.value})}><option value="REQUESTER">Requester</option><option value="DONOR">Donor</option><option value="NGO">NGO</option></select>
    </div><div className="actions"><button onClick={()=>authenticate('register')}>Create account</button><button className="secondary" onClick={()=>authenticate('login')}>Sign in</button></div><small>For sign in, use the email and password of an existing account.</small></section>}
    {user?.role !== 'REQUESTER' && user && <section className="panel"><h2>Publish a donation</h2><form onSubmit={createDonation} className="formgrid">
      <input required placeholder="Food title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
      <input required placeholder="Quantity (e.g. 10 meal boxes)" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/>
      <input placeholder="Food type" value={form.foodType} onChange={e=>setForm({...form,foodType:e.target.value})}/>
      <input required placeholder="Pickup address" value={form.pickupAddress} onChange={e=>setForm({...form,pickupAddress:e.target.value})}/>
      <input required type="datetime-local" value={form.pickupTime} onChange={e=>setForm({...form,pickupTime:e.target.value})}/>
      <textarea placeholder="Description / allergen details" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
      <button type="submit">Publish donation</button>
    </form></section>}
    <section className="sectionhead"><div><p className="eyebrow">AVAILABLE NEARBY</p><h2>Food donations</h2></div><button className="secondary" onClick={load}>Refresh</button></section>
    <section className="cards">{donations.length ? donations.map(d=><article className="card" key={d._id}>
      <div className="cardtop"><span className="pill green">{d.foodType || 'Food'}</span><span className="muted">{new Date(d.pickupTime).toLocaleString()}</span></div>
      <h3>{d.title}</h3><p>{d.description || 'No additional details provided.'}</p><p><b>Quantity:</b> {d.quantity}</p><p><b>Pickup:</b> {d.pickupAddress}</p>
      <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.pickupAddress)}`}>Open pickup location ↗</a>
      {user && ['REQUESTER','NGO'].includes(user.role) && <button onClick={()=>claim(d._id)}>Claim donation</button>}
    </article>) : <div className="empty">No available donations yet. Check back soon.</div>}</section>
    <section className="panel assistant"><p className="eyebrow">MEAL MITRA ASSISTANT</p><h2>Have a question?</h2><form onSubmit={askAssistant}><input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Ask about using the platform…" required/><button>Ask</button></form>{chatReply && <p className="reply">{chatReply}</p>}</section>
    <footer>Meal Mitra · Built to make food sharing easier. Please verify food safety and pickup details before every handover.</footer>
  </main>;
}
