import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient';
import UploadButton from './UploadButton';
import Gallery from './Gallery';
import NameBar from './NameBar';

async function listAllPublicUrls() {
  const { data, error } = await supabase.storage.from('photos').list('public', { limit: 1000 });
  if (error) throw error;
  const files = (data || []).slice();
  files.sort((a, b) => b.name.localeCompare(a.name));
  return files.map((f) => supabase.storage.from('photos').getPublicUrl(`public/${f.name}`).data.publicUrl);
}

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [guestName, setGuestName] = useState('');
  const timerRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const urls = await listAllPublicUrls();
      setPhotos(urls);
    } catch (e) {
      console.error('Error listing photos:', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, 15000);
    return () => clearInterval(timerRef.current);
  }, [refresh]);

  const handleUploaded = (urls) => {
    setPhotos((prev) => [...urls, ...prev]);
  };

  return (
    <>
      <header className="header">
        <h1>📸 Wedding Photo Gallery</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <NameBar onNameChange={setGuestName} />
          <div style={{ display: 'flex', gap: 8 }}>
            <UploadButton onUploaded={handleUploaded} guestName={guestName} />
            <button className="btn" onClick={refresh} disabled={refreshing}>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <Gallery photos={photos} />
      </main>

      <div className="footer">
        Tap “Upload Photos” to add from your camera roll or camera. Entering your name is optional.
      </div>
    </>
  );
}