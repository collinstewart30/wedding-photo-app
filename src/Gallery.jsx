import { useState } from 'react';

export default function Gallery({ photos }) {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="grid">
        {photos.map((item) => {
          const key = `${item.id}-${item.url}`; // ensures React re-renders
          const urlWithCacheBust = item.url.includes('?') 
            ? `${item.url}&v=${item.id}` 
            : `${item.url}?v=${item.id}`;

          return item.type === 'photo' ? (
            <div key={key} style={{ position: 'relative' }}>
              <img
                src={urlWithCacheBust}
                alt={item.guestName || ''}
                className="tile"
                loading="lazy"
                onClick={() => setSelected(item)}
              />
              {item.guestName && (
                <span className="guest-tag">{item.guestName}</span>
              )}
            </div>
          ) : (
            <div key={key} style={{ position: 'relative' }}>
              <video
                key={key} // force re-render when URL changes
                className="tile"
                controls
                preload="metadata"
                crossOrigin="anonymous"
                onClick={() => setSelected(item)}
              >
                <source src={urlWithCacheBust} type="video/mp4" />
              </video>
              {item.guestName && (
                <span className="guest-tag">{item.guestName}</span>
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="lightbox" onClick={() => setSelected(null)}>
          <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
          {selected.type === 'video' ? (
            <video
              key={`${selected.id}-${selected.url}`}
              src={`${selected.url}&v=${selected.id}`} // cache-bust
              controls
              autoPlay
              preload="metadata"
              crossOrigin="anonymous"
              style={{ maxWidth: '95vw', maxHeight: '90vh' }}
            />
          ) : (
            <img
              src={`${selected.url}&v=${selected.id}`} // cache-bust
              alt={selected.guestName || ''}
              style={{ maxWidth: '95vw', maxHeight: '90vh' }}
            />
          )}
        </div>
      )}
    </>
  );
}