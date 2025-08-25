import { useState } from 'react';
import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

function extFromFile(file) {
  const nameExt = file.name?.split('.').pop()?.toLowerCase();
  if (nameExt) return nameExt;
  const map = { 'image/jpeg':'jpg', 'image/png':'png', 'image/webp':'webp', 'image/heic':'heic', 'image/heif':'heif' };
  return map[file.type] || 'jpg';
}

export default function UploadButton({ onUploaded }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const handleChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setBusy(true);
    try {
      let uploaded = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Optional: client-side size guard (e.g. 15 MB)
        if (file.size > 15 * 1024 * 1024) {
          setStatus(`Skipped ${file.name} (too large)`);
          continue;
        }

        setStatus(`Uploading ${i + 1} of ${files.length}…`);

        const ext = extFromFile(file);
        const filePath = `public/${Date.now()}_${uuidv4()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from('photos')
          .upload(filePath, file, { upsert: false, cacheControl: '3600' });

        if (upErr) throw upErr;

        const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
        uploaded.push(data.publicUrl);
      }

      if (uploaded.length) onUploaded(uploaded);
      setStatus(uploaded.length ? 'Upload complete!' : 'Nothing uploaded.');
    } catch (err) {
      console.error(err);
      setStatus('Upload failed. Try again.');
    } finally {
      setBusy(false);
      // Reset the input so you can re-upload the same file(s)
      e.target.value = '';
      setTimeout(() => setStatus(''), 2000);
    }
  };

  return (
    <label className="btn">
      {busy ? 'Uploading…' : 'Upload Photos'}
      <input
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleChange}
        style={{ display: 'none' }}
        disabled={busy}
      />
    </label>
  );
}