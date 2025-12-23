export default function VysheListPage() {
  return (
    <>
      <div style={{ height: 300, background: '#ddd' }}>
        HEADER / BG
      </div>

      <div className="contentShell">
        <h1>Выше</h1>
        <p>Тестовый контент</p>

        <div style={{ height: 1200, background: '#f5f5f5' }}>
          Длинный контент для скролла
        </div>
      </div>
    </>
  );
}