import { useState } from 'react';
import imageCompression from 'browser-image-compression';

export default function UploadButton({ onUploaded, guestName }) {
  const [uploads, setUploads] = useState([]); // Tracks progress/status per file
  const [busy, setBusy] = useState(false);

  const handleChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setBusy(true);
    setUploads(files.map((f) => ({ name: f.name, progress: 0, status: 'pending' })));

    const uploadedItems = [];

    for (let i = 0; i < files.length; i++) {
      let file = files[i];

      // Compress images only
      if (file.type.startsWith('image/')) {
        try {
          file = await imageCompression(file, { maxSizeMB: 2, maxWidthOrHeight: 2000 });
        } catch (err) {
          console.error('Image compression failed', err);
        }
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('guestName', guestName || '');

      try {
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', 'https://redsurgefitness.com/weddingupload.php');

          // Progress event
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setUploads((prev) =>
                prev.map((u, idx) =>
                  idx === i ? { ...u, progress: percent, status: 'uploading' } : u
                )
              );
            }
          };

          xhr.onload = () => {
            if (xhr.status === 200) {
              try {
                const data = JSON.parse(xhr.responseText);
                if (data.success) {
                  uploadedItems.push({ url: data.url, type: data.type });
                  setUploads((prev) =>
                    prev.map((u, idx) =>
                      idx === i ? { ...u, progress: 100, status: 'done' } : u
                    )
                  );
                  resolve();
                } else {
                  setUploads((prev) =>
                    prev.map((u, idx) =>
                      idx === i ? { ...u, status: 'error' } : u
                    )
                  );
                  reject(data.error);
                }
              } catch (err) {
                reject(err);
              }
            } else {
              setUploads((prev) =>
                prev.map((u, idx) =>
                  idx === i ? { ...u, status: 'error' } : u
                )
              );
              reject(`Upload failed with status ${xhr.status}`);
            }
          };

          xhr.onerror = () => {
            setUploads((prev) =>
              prev.map((u, idx) =>
                idx === i ? { ...u, status: 'error' } : u
              )
            );
            reject('Network error');
          };

          xhr.send(formData);
        });
      } catch (err) {
        console.error('Upload error', err);
      }
    }

    if (uploadedItems.length) {
      onUploaded(uploadedItems);
    }

    setBusy(false);
    e.target.value = ''; // Reset input
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
      </label>

      {uploads.map((u, idx) => (
        <div key={idx} style={{ width: '100%', fontSize: 12 }}>
          <div>{u.name}</div>
          <div
            style={{
              width: '100%',
              height: 6,
              background: '#eee',
              borderRadius: 3,
              overflow: 'hidden',
              marginBottom: 2,
            }}
          >
            <div
              style={{
                width: `${u.progress}%`,
                height: '100%',
                background:
                  u.status === 'error' ? 'red' : u.status === 'done' ? 'green' : '#3498db',
                transition: 'width 0.2s',
              }}
            />
          </div>
          <small>
            {u.status === 'pending'
              ? 'Pending'
              : u.status === 'uploading'
              ? `Uploading… ${u.progress}%`
              : u.status === 'done'
              ? 'Done'
              : 'Error'}
          </small>
        </div>
      ))}
    </div>
  );
}