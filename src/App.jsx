import { useEffect, useRef, useState } from 'react';
import UploadButton from './UploadButton';
import Gallery from './Gallery';
import NameBar from './NameBar';

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [guestName, setGuestName] = useState('');
  const timerRef = useRef(null);

  // Fetch gallery items from your PHP endpoint
  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('https://redsurgefitness.com/weddinglist.php');
      const data = await res.json();
      // Ensure all items have url and type
      setPhotos(
        data.map((item) => ({
          url: item.url,
          type: item.type,
          guestName: item.guestName || 'anon',
          uploadedAt: item.uploadedAt || null,
        }))
      );
    } catch (e) {
      console.error('Failed to fetch gallery:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, 15000); // refresh every 15s
    return () => clearInterval(timerRef.current);
  }, []);

  // Called when new files are uploaded
  const handleUploaded = (uploadedItems) => {
    // Prepend newly uploaded items so they appear at the top
    setPhotos((prev) => [...uploadedItems, ...prev]);
  };

  return (
    <>
      <header className="header">
        <h1>
          Stewart
          <br />
          Wedding
          <br />
          Gallery
        </h1>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'flex-end',
          }}
        >
          <NameBar onNameChange={setGuestName} />
          <div className="button-group">
            <UploadButton onUploaded={handleUploaded} guestName={guestName} />
            <button className="btn" onClick={refresh} disabled={refreshing}>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <div className="footer">
        Thank you for sharing your memories! Tap ‘Upload Photos/Videos’ to add from your
        camera roll or camera. Optional: enter your name to tag your photo.
      </div>

      <main className="container">
        <Gallery photos={photos} />
      </main>

    </>
  );
}