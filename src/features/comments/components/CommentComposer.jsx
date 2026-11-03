import React from "react";
import Button from "../../../ui/Button";
import { Send } from "lucide-react";

export const CommentComposer = ({ value, onChange, onSubmit, loading }) => (
  <form onSubmit={onSubmit} className="flex items-start gap-2">
    <textarea
      rows={2}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Write a comment..."
      aria-label="Comment"
      className="input-dark flex-1 resize-none"
    />
    <Button
      type="submit"
      size="sm"
      variant="primary"
      loading={loading}
      disabled={!value.trim()}
      icon={Send}
    >
      Send
    </Button>
  </form>
);

export default CommentComposer;
