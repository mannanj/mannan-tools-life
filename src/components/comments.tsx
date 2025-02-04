"use client";

import React, { useState, useEffect } from "react";
import { Popover } from "react-tiny-popover";
import "./comments.css";

import ollama, { ChatResponse } from "ollama/browser";
import { OPENER_USER_CHAT } from "@/utilities/SAMPLE_DATA";
import {
  getTextAfterThink,
  getThoughtContent,
  saveComments,
} from "@/utilities/helpers";

export const loadingSpinnerTiny: React.JSX.Element = (
  <div className="flex justify-center items-center">
    <div className="rainbow-loader-tiny"></div>
  </div>
);

const STARTER_COMMENTS: Comment[] = [
  {
    original:
      "100% agreed. The fundamentals of BJJ that we learned 20 years ago are not the fundamentals of today. Movements, framing and finding the calmness during the fight should be the fundamentals of BJJ",
    transformed: loadingSpinnerTiny,
    id: "1",
    loading: true,
  },
  {
    original: "“Dont focus on techniques” I can totally do that",
    transformed: loadingSpinnerTiny,
    id: "2",
    loading: false,
  },
  {
    original:
      "Tried Jiu Jitsu for the first time 2 days ago. The feeling of being out of breath and just having another grown adult laying across my abdomen was probably one of the most uncomfortable physical feelings I've ever had. At one point I had to tap just to get a breath while the other guy was a black belt just patiently laying in side control.",
    transformed: loadingSpinnerTiny,
    id: "3",
    loading: false,
  },
];

export interface Comment {
  original: string;
  transformed: React.JSX.Element | string;
  id: string;
  loading: boolean;
  thinking?: string;
  processing?: boolean;
}
const Comments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showOriginal, setShowOriginal] = useState<number[]>([]);
  const [showThinking, setShowThinking] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatResponse, setChatResponse] = useState<ChatResponse | null>(null);

  const chatDeepStream = async (messageStr: string, commentId?: string) => {
    const message = {
      role: "user",
      //   content: messageStr ?? "Why is the sky blue?",
      content: `${OPENER_USER_CHAT} 100% agreed. The fundamentals of BJJ that we learned 20 years ago are not the fundamentals of today. Movements, framing and finding the calmness during the fight should be the fundamentals of BJJ`,
    };
    const messages = [message];
    // console.log("\nsending messages:", messages);
    const response = await ollama.chat({
      model: "deepseek-r1:1.5b",
      messages,
      stream: true,
    });
    let fullResponse = "";
    let thinkingResponse = "";
    let outsideOfThinkingResponse = "";
    for await (const part of response) {
      fullResponse += part.message.content;
      setChatResponse({
        ...part,
        message: { ...part.message, content: fullResponse },
      });
      //   console.log("fullresponse", fullResponse);
      //   thinkingResponse = getThoughtContent(fullResponse);
      //   if (thinkingResponse && thinkingResponse.length > 0) {
      //     console.log("set thinking respnse", thinkingResponse);
      //     setComments((prevComments) =>
      //       prevComments.map((c) =>
      //         c.id === commentId ? { ...c, thinking: thinkingResponse } : c
      //       )
      //     );
      //   }
      setComments((prevComments) =>
        prevComments.map((c) =>
          c.id === commentId ? { ...c, thinking: fullResponse } : c
        )
      );
    }
    outsideOfThinkingResponse = getTextAfterThink(fullResponse);
    return outsideOfThinkingResponse;
  };

  const transformComment = async (comment: Comment) => {
    const transformedContent = await chatDeepStream(
      comment.original,
      comment.id
    );
    setComments((prevComments) =>
      prevComments.map((c) =>
        c.id === comment.id
          ? {
              ...c,
              transformed: transformedContent,
              loading: false,
            }
          : c
      )
    );
  };

  useEffect(() => {
    const processComments = async () => {
      for (const comment of comments) {
        if (comment.loading && !comment.processing) {
          setComments((prevComments) =>
            prevComments.map((c) =>
              c.id === comment.id
                ? {
                    ...c,
                    processing: true,
                  }
                : c
            )
          );
          await transformComment(comment);
        }
      }
    };

    processComments();
  }, [comments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      const exampleComments = STARTER_COMMENTS;
      setComments(exampleComments);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    comments.forEach((comment) => {
      const marker = document.querySelector(
        `[data-comment-id="${comment.id}"]`
      );
      if (marker) {
        const wrapper = document.createElement("span");
        wrapper.innerHTML =
          typeof comment.transformed === "string"
            ? comment.transformed
            : (comment.transformed as unknown as HTMLElement).outerHTML;
        if (marker.parentNode) {
          marker.parentNode.replaceChild(wrapper, marker);
        }
      }
    });
  }, [comments]);

  const toggleOriginals = (index: number) => {
    setShowOriginal((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleThinking = (index: number) => {
    setShowThinking((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
    console.log("comments", comments);
  };

  if (loading) {
    return (
      <div>
        <div className="rainbow-loader"></div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => {
          chatDeepStream("hello!");
        }}
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
      >
        Talk Deep
      </button>
      {/* <p style={{ maxWidth: "75%" }}>
        {chatResponse ? chatResponse.message.content : ""}
      </p> */}
      <h3 className="text-md font-semibold mb-2">Comments</h3>
      <div className="max-h-96 overflow-y-auto overflow-x-auto text-sm">
        {comments.map((comment, index) => (
          <div key={comment.id} className="mb-2 p-2 border rounded relative">
            <div className="flex items-start gap-2">
              {comment.thinking && (
                <Popover
                  isOpen={showThinking.includes(index)}
                  positions={["left", "right", "top", "bottom"]}
                  content={
                    <div
                      className="ml-2 p-2 rounded text-xs border"
                      style={{ maxWidth: "30%" }}
                    >
                      {comment.thinking}
                    </div>
                  }
                >
                  <button
                    className={`text-white hover:text-orange-700 p-2 -m-2 text-sm ${
                      showThinking.includes(index) ? "opacity-50" : ""
                    }`}
                    onClick={() => toggleThinking(index)}
                  >
                    💡
                  </button>
                </Popover>
              )}
              <div className="flex-grow">{comment.transformed}</div>
              <Popover
                isOpen={showOriginal.includes(index)}
                positions={["right"]}
                content={
                  <div
                    className="ml-2 p-2 rounded text-xs border"
                    style={{ maxWidth: "30%" }}
                  >
                    Original: {comment.original}
                  </div>
                }
              >
                <button
                  className="text-white hover:text-orange-700 p-2 -m-2 text-sm"
                  onClick={() => toggleOriginals(index)}
                >
                  {showOriginal.includes(index) ? "x" : "➔"}
                </button>
              </Popover>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() =>
            saveComments(
              comments.map((comment) => ({
                ...comment,
                transformed:
                  typeof comment.transformed === "string"
                    ? comment.transformed
                    : "[React Element]",
              }))
            )
          }
          className="flex items-center text-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M17 3a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1h12a1 1 0 001-1V3zM9 15H7v-2h2v2zm4 0h-2v-2h2v2zm1-4H6V5h8v6z" />
          </svg>
          Save
        </button>
        {/* ...existing code... */}
      </div>
    </div>
  );
};

export default Comments;
