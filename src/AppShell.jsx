export default function AppShell({ isDetails, children }) {
    return (
      <div className="appRoot">
        <div className={`headerBg ${isDetails ? "headerBg--details" : ""}`} />
        <div className={`contentShell ${isDetails ? "contentShell--details" : ""}`}>
          {children}
        </div>
      </div>
    );
  }