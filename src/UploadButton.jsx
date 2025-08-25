import { useState } from 'react';
import imageCompression from 'browser-image-compression';

export default function UploadButton({ onUploaded, guestName }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const handleChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    setStatus('');

    let uploaded = [];
    try {
      for (let file of files) {
        // Compress images only
        if (file.type.startsWith('image/')) {
          file = await imageCompression(file, { maxSizeMB: 2, maxWidthOrHeight: 2000 });
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('guestName', guestName || '');

        const res = await fetch('https://redsurgefitness.com/weddingupload.php', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (data.success) {
          uploaded.push({ url: data.url, type: data.type });
        } else {
          console.error('Upload error:', data.error);
        }
      }

      if (uploaded.length) {
        onUploaded(uploaded);
        setStatus('Upload complete!');
      } else {
        setStatus('No files uploaded.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Upload failed.');
    } finally {
      setBusy(false);
      e.target.value = ''; // Reset file input
      setTimeout(() => setStatus(''), 2500);
    }
  };

  return (
    <label className="btn">
      {busy ? 'Uploading…' : 'Upload Photos/Videos'}
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleChange}
        style={{ display: 'none' }}
        disabled={busy}
      />
      {status && <small style={{ display: 'block', marginTop: 4 }}>{status}</small>}
    </label>
  );
}