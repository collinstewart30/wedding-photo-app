import { useState } from 'react';

export default function Gallery({ photos }) {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="grid">
        {photos.map((item) => (
          item.type === 'photo' ? (
            <div key={item.id || item.url} style={{ position: 'relative' }}>
              <img
                src={item.url}
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
            <div key={item.id || item.url} style={{ position: 'relative' }}>
              <video
                className="tile"
                controls
                onClick={() => setSelected(item)}
              >
                <source src={item.url} type="video/mp4" />
              </video>
              {item.guestName && (
                <span className="guest-tag">{item.guestName}</span>
              )}
            </div>
          )
        ))}
      </div>

      {selected && (
        <div className="lightbox" onClick={() => setSelected(null)}>
          <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
          {selected.type === 'video' ? (
            <video
              src={selected.url}
              controls
              autoPlay
              style={{ maxWidth: '95vw', maxHeight: '90vh' }}
            />
          ) : (
            <img
              src={selected.url}
              alt={selected.guestName || ''}
              style={{ maxWidth: '95vw', maxHeight: '90vh' }}
            />
          )}
        </div>
      )}
    </>
  );
}