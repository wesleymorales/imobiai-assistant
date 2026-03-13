import { Outlet } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20 max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
}
