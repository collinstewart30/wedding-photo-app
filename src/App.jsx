import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient';
import UploadButton from './UploadButton';
import Gallery from './Gallery';

async function listAllPublicUrls() {
  // We put everything under the 'public/' folder, with timestamp prefixes.
  const { data, error } = await supabase.storage.from('photos').list('public', {
    limit: 1000, // plenty for a wedding
  });
  if (error) throw error;

  const files = (data || []).slice();
  // We named files like `${Date.now()}_uuid.ext`, so sort by name desc for newest first
  files.sort((a, b) => b.name.localeCompare(a.name));
  return files.map((f) => supabase.storage.from('photos').getPublicUrl(`public/${f.name}`).data.publicUrl);
}

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
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
    refresh(); // initial load
    timerRef.current = setInterval(refresh, 15000); // auto-refresh every 15s
    return () => clearInterval(timerRef.current);
  }, [refresh]);

  const handleUploaded = (urls) => {
    // show instantly; auto-refresh will reconcile any order differences
    setPhotos((prev) => [...urls, ...prev]);
  };

  return (
    <>
      <header className="header">
        <h1>📸 Wedding Photo Gallery</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <UploadButton onUploaded={handleUploaded} />
          <button className="btn" onClick={refresh} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      <main className="container">
        <Gallery photos={photos} />
      </main>

      <div className="footer">
        Tip: Tap “Upload Photos” and choose from your camera roll. New photos appear for everyone.
      </div>
    </>
  );
}