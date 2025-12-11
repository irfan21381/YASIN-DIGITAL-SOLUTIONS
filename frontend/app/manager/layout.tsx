import ManagerGuard from "./ManagerGuard";

export default function ManagerLayout({ children }) {
  return <ManagerGuard>{children}</ManagerGuard>;
}
