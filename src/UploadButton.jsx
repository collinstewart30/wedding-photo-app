import { useState } from 'react';
import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';

const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_SIZE_MB = 15; // absolute max before rejecting
const COMPRESS_TARGET_MB = 2; // aim to shrink to ~2MB per photo

function extFromFile(file) {
  const ext = file.name?.split('.').pop()?.toLowerCase();
  if (ext) return ext;
  const map = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif' };
  return map[file.type] || 'jpg';
}

export default function UploadButton({ onUploaded, guestName }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const handleChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setBusy(true);
    try {
      let uploaded = [];

      for (let i = 0; i < files.length; i++) {
        let file = files[i];

        if (!VALID_TYPES.includes(file.type)) {
          setStatus(`Skipped ${file.name} (invalid type)`);
          continue;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setStatus(`Skipped ${file.name} (too large)`);
          continue;
        }

        // Compress before upload
        const compressed = await imageCompression(file, {
          maxSizeMB: COMPRESS_TARGET_MB,
          maxWidthOrHeight: 2000,
          useWebWorker: true
        });

        setStatus(`Uploading ${i + 1} of ${files.length}…`);

        const ext = extFromFile(file);
        const safeName = guestName ? guestName.replace(/\s+/g, '_') : 'anon';
        const filePath = `public/${safeName}_${Date.now()}_${uuidv4()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from('photos')
          .upload(filePath, compressed, { upsert: false, cacheControl: '3600' });

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
      e.target.value = ''; // reset input
      setTimeout(() => setStatus(''), 2500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: '4px' }}>
      <label className="btn">
        {busy ? 'Uploading…' : 'Upload Photos'}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={busy}
        />
      </label>
      {status && <small style={{ color: '#666' }}>{status}</small>}
    </div>
  );
}