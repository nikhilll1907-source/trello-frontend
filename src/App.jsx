import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { BoardProvider } from "./features/boards/context/BoardContext";
import { CommentsProvider } from "./features/comments/context/CommentsContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BoardProvider>
          <CommentsProvider>
            <AppRoutes />
          </CommentsProvider>
        </BoardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
