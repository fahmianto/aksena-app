import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Plus, Save, Trash2, Edit2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DripSettings() {
  const { currentUser } = useAuth();
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ step: 1, delayDays: 1, messageTemplate: '', isActive: true });

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'drip_sequences'), orderBy('step', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setSequences(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser]);

  const handleEdit = (seq) => {
    setEditingId(seq.id);
    setEditForm({ step: seq.step, delayDays: seq.delayDays, messageTemplate: seq.messageTemplate, isActive: seq.isActive });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await addDoc(collection(db, 'drip_sequences'), {
          ...editForm,
          createdAt: new Date()
        });
        toast.success('Sequence baru ditambahkan!');
      } else {
        await updateDoc(doc(db, 'drip_sequences', editingId), editForm);
        toast.success('Sequence berhasil diupdate!');
      }
      setEditingId(null);
    } catch (err) {
      toast.error('Gagal menyimpan sequence');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus tahapan edukasi ini?')) return;
    try {
      await deleteDoc(doc(db, 'drip_sequences', id));
      toast.success('Sequence dihapus!');
    } catch (err) {
      toast.error('Gagal menghapus sequence');
    }
  };

  const handleAddNew = () => {
    const nextStep = sequences.length > 0 ? Math.max(...sequences.map(s => s.step)) + 1 : 1;
    setEditingId('new');
    setEditForm({ step: nextStep, delayDays: nextStep * 2, messageTemplate: 'Halo {{name}}, ...', isActive: true });
  };

  if (loading) return <div className="p-8 text-center">Memuat setting Drip Campaign...</div>;

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Drip Sequences</h1>
          <p>Atur rentetan otomatis WA Edukasi (Nurture) untuk Leads</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={handleAddNew} disabled={editingId !== null} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={16} />
            Tambah Tahap Edukasi
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, padding: 16, background: 'rgba(0,212,255,0.05)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <AlertCircle size={20} color="var(--color-info)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--color-text)' }}>Tips Variabel Dinamis:</strong><br/>
            Gunakan <code>{`{{name}}`}</code> untuk memanggil nama kontak, atau <code>{`{{businessName}}`}</code> untuk nama bisnis. <br/>
            Contoh: <em>Halo {`{{name}}`}, ini kabar terbaru dari Aksena untuk {`{{businessName}}`} lho!</em>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sequences.length === 0 && editingId !== 'new' && (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
            Belum ada tahapan edukasi. Klik "Tambah Tahap Edukasi" untuk mulai membuat skenario.
          </div>
        )}

        {editingId === 'new' && (
          <SequenceEditor form={editForm} setForm={setEditForm} onSave={handleSave} onCancel={handleCancelEdit} />
        )}

        {sequences.map(seq => (
          editingId === seq.id ? (
            <SequenceEditor key={seq.id} form={editForm} setForm={setEditForm} onSave={handleSave} onCancel={handleCancelEdit} />
          ) : (
            <div key={seq.id} className="card" style={{ display: 'flex', gap: 20, padding: 20 }}>
              {/* Step indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', minWidth: 100 }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Edukasi Ke</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-accent)' }}>{seq.step}</div>
                <div style={{ fontSize: 12, color: seq.isActive ? 'var(--color-success)' : 'var(--color-text-muted)', marginTop: 8 }}>
                  {seq.isActive ? 'Bekerja' : 'Nonaktif'}
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontWeight: 600 }}>Terkirim setelah: <span style={{ color: 'var(--color-accent)' }}>{seq.delayDays} Hari</span> dari tanggal masuk</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ghost" onClick={() => handleEdit(seq)}><Edit2 size={16} /></button>
                    <button className="btn-ghost" onClick={() => handleDelete(seq.id)} style={{ color: 'var(--color-danger)' }}><Trash2 size={16} /></button>
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 'var(--radius-md)', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {seq.messageTemplate}
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

function SequenceEditor({ form, setForm, onSave, onCancel }) {
  return (
    <div className="card" style={{ padding: 20, border: '1px solid var(--color-accent)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, marginBottom: 16 }}>
        <div className="form-group">
          <label>Edukasi Ke (Urutan)</label>
          <input type="number" className="form-input" value={form.step} onChange={e => setForm({...form, step: parseInt(e.target.value) || 0})} />
        </div>
        <div className="form-group">
          <label>Dikirim Pada (H+... Masuk)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="number" className="form-input" style={{ width: 100 }} value={form.delayDays} onChange={e => setForm({...form, delayDays: parseInt(e.target.value) || 0})} />
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Hari</span>
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <label>Pesan Edukasi WhatsApp</label>
        <textarea 
          className="form-input" 
          rows={6}
          value={form.messageTemplate} 
          onChange={e => setForm({...form, messageTemplate: e.target.value})}
          placeholder="Halo {{name}}, bagaimana kabar {{businessName}} hari ini?"
        />
      </div>

      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <label className="switch">
          <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} />
          <span className="slider round"></span>
        </label>
        <span style={{ fontSize: 14 }}>{form.isActive ? 'Status: Aktif' : 'Status: Nonaktif'}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button className="btn btn-outline" onClick={onCancel}>Batal</button>
        <button className="btn btn-primary" onClick={onSave} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Save size={16}/> Simpan</button>
      </div>
    </div>
  );
}
