import { useState } from 'react';

export default function Gallery({ photos }) {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="grid">
        {photos.map((item) => (
          item.type === 'photo' ? (
            <img
              key={item.url}
              src={item.url}
              alt=""
              className="tile"
              loading="lazy"
              onClick={() => setSelected(item)}
            />
          ) : (
            <video
              key={item.url}
              className="tile"
              controls
              onClick={() => setSelected(item)}
            >
              <source src={item.url} type="video/mp4" />
            </video>
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
              alt=""
              style={{ maxWidth: '95vw', maxHeight: '90vh' }}
            />
          )}
        </div>
      )}
    </>
  );
}