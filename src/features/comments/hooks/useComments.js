import { useContext } from "react";
import { CommentsContext } from "../context/CommentsContext";

export const useComments = () => {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error("useComments must be used within a CommentsProvider");
  }
  return context;
};

export default useComments;
