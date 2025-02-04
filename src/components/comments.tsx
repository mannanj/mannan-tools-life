"use client";

import React, { useState, useEffect } from "react";
import { Popover } from "react-tiny-popover";
import "./comments.css";

const Comments = () => {
  const [comments, setComments] = useState<
    { original: string; transformed: string; id: string }[]
  >([]);
  const [showOriginal, setShowOriginal] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Example transformer function - replace with your desired transformation
  const transformComment = (text: string) => {
    return text.toUpperCase(); // Simple transform for demonstration
  };

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 3 seconds delay

    // Example comments
    const exampleComments = [
      {
        original: "This is the original comment",
        transformed: transformComment("This is the new comment"),
        id: "1",
      },
      {
        original: "Original comment here",
        transformed: transformComment("New comment here"),
        id: "2",
      },
      {
        original: "Yet another original comment",
        transformed: transformComment("Yet another new comment"),
        id: "3",
      },
    ];

    setComments(exampleComments);

    return () => clearTimeout(timer);
  }, []);

  // Insert transformed comments into markers
  useEffect(() => {
    comments.forEach((comment) => {
      const marker = document.querySelector(
        `[data-comment-id="${comment.id}"]`
      );
      if (marker) {
        const wrapper = document.createElement("span");
        wrapper.innerHTML = comment.transformed;
        if (marker.parentNode) {
          marker.parentNode.replaceChild(wrapper, marker);
        }
      }
    });
  }, [comments]);

  const togglePopover = (index: number) => {
    setShowOriginal((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (loading) {
    return (
      <div className="loading-banner">
        <div className="rainbow-loader"></div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Transformed Comments</h3>
      <div className="max-h-96 overflow-y-auto">
        {comments.map((comment, index) => (
          <div key={comment.id} className="mb-2 p-2 border rounded relative">
            <div className="flex items-start gap-2">
              <div className="flex-grow">{comment.transformed}</div>
              <Popover
                isOpen={showOriginal.includes(index)}
                positions={["right"]}
                content={
                  <div className="ml-2 p-2 rounded text-sm border">
                    Original: {comment.original}
                  </div>
                }
              >
                <button
                  className="text-blue-500 hover:text-blue-700 p-2 -m-2 text-xs"
                  onClick={() => togglePopover(index)}
                >
                  {showOriginal.includes(index) ? "x" : "➔"}
                </button>
              </Popover>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;
