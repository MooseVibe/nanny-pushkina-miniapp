export default function TopNav({ active, onChange }) {
    const items = [
      { id: "home", label: "Home" },
      { id: "vyshe", label: "Выше (список)" },
      { id: "lesson", label: "Деталка занятия" },
      { id: "booking", label: "Запись" },
      { id: "success", label: "Успех" },
    ];
  
    return (
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: active === item.id ? "#111" : "#fff",
              color: active === item.id ? "#fff" : "#111",
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  }