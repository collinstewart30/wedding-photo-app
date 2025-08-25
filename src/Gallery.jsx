import { useState } from 'react';

export default function Gallery({ photos }) {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="grid">
        {photos.map((url, i) => (
          <img
            key={url + i}
            src={url}
            alt=""
            className="tile"
            loading="lazy"
            onClick={() => setSelected(url)}
          />
        ))}
      </div>

      {selected && (
        <div className="lightbox" onClick={() => setSelected(null)}>
          <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
          <img src={selected} alt="" />
        </div>
      )}
    </>
  );
}