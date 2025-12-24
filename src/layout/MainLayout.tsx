import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div>
      {/* Public Navbar */}
      <header style={{ padding: "15px", background: "#f5f5f5" }}>
        <h2>YDS Portal</h2>
      </header>

      {/* Page Content */}
      <main style={{ padding: "20px" }}>
        <Outlet />
      </main>

      {/* Footer */}
    
    </div>
  );
}
