import { useState, useEffect } from 'react';

export default function NameBar({ onNameChange }) {
  const [name, setName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('guestName');
    if (stored) {
      setName(stored);
      onNameChange(stored);
    }
  }, [onNameChange]);

  const handleChange = (e) => {
    const value = e.target.value;
    setName(value);
    localStorage.setItem('guestName', value);
    onNameChange(value);
  };

  return (
    <input
      type="text"
      placeholder="Enter your name (optional)"
      value={name}
      onChange={handleChange}
      style={{
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '250px'
      }}
    />
  );
}