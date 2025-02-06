"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Popover } from "react-tiny-popover";
import "./comments.css";

import ollama, { ChatResponse } from "ollama/browser";
import { COMMENT_TRANSFORMATION_SINGLE } from "@/utilities/SAMPLE_DATA";
import {
  getTextAfterThink,
  getThoughtContent,
  saveComments,
} from "@/utilities/helpers";
import ElementPicker from "./picker";

const QUEUE_MAX = 2;

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
    original: "Dont focus on techniques” I can totally do that",
    transformed: loadingSpinnerTiny,
    id: "2",
    loading: true,
  },
  {
    original:
      "Tried Jiu Jitsu for the first time 2 days ago. The feeling of being out of breath and just having another grown adult laying across my abdomen was probably one of the most uncomfortable physical feelings I've ever had. At one point I had to tap just to get a breath while the other guy was a black belt just patiently laying in side control.",
    transformed: loadingSpinnerTiny,
    id: "3",
    loading: true,
  },
];

export interface Comment {
  original: string;
  transformed: React.JSX.Element | string;
  id: string;
  loading: boolean;
  thinking?: string;
  processing?: boolean;
  isThinking?: boolean;
}
const Comments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showOriginal, setShowOriginal] = useState<number[]>([]);
  const [showThinking, setShowThinking] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const transformCommentDeeply = async (
    messageStr: string,
    commentId?: string
  ) => {
    const message = {
      role: "user",
      content: `${COMMENT_TRANSFORMATION_SINGLE} ${messageStr}`,
    };
    const messages = [message];
    const response = await ollama.chat({
      model: "deepseek-r1:1.5b",
      messages,
      stream: true,
    });
    let fullResponse = "";
    for await (const part of response as AsyncIterable<ChatResponse>) {
      fullResponse += part.message.content;
      setComments((prevComments) =>
        prevComments.map((c) =>
          c.id === commentId
            ? { ...c, thinking: fullResponse, isThinking: true }
            : c
        )
      );
    }
    const thinkingContent = getThoughtContent(fullResponse);
    setComments((prevComments) =>
      prevComments.map((c) =>
        c.id === commentId
          ? { ...c, thinking: thinkingContent, isThinking: false }
          : c
      )
    );
    return getTextAfterThink(fullResponse);
  };

  const startCommentTransformation = useCallback(async (comment: Comment) => {
    const transformedContent = await transformCommentDeeply(
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
  }, []);

  useEffect(() => {
    const processComments = async () => {
      const processingQueue: Promise<void>[] = [];
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
          const processComment = async () => {
            await startCommentTransformation(comment);
          };
          processingQueue.push(processComment());
          if (processingQueue.length >= QUEUE_MAX) {
            await Promise.all(processingQueue);
            processingQueue.length = 0;
          }
        }
      }
      if (processingQueue.length > 0) {
        await Promise.all(processingQueue);
      }
    };

    processComments();
  }, [comments, startCommentTransformation]);

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

  const thinkingSection = (index: number, comment: Comment) => (
    <Popover
      isOpen={showThinking.includes(index)}
      positions={["left"]}
      content={
        <div
          className="ml-2 p-2 rounded text-xs border"
          style={{
            maxWidth: "150px",
            maxHeight: "150px",
            overflow: "auto",
          }}
        >
          {comment.thinking}
        </div>
      }
    >
      <button
        className={`text-white hover:text-orange-700 p-2 -m-2 text-sm ${
          showThinking.includes(index) ? "" : "opacity-50"
        }`}
        onClick={() => toggleThinking(index)}
      >
        💡
      </button>
    </Popover>
  );

  return (
    <>
      <ElementPicker
        onSelect={(element, info) =>
          console.log("picked element", element, "\n info", info)
        }
      />
      <div>
        <h3 className="text-md font-semibold mb-2">Comments</h3>
        <div className="max-h-96 overflow-y-auto overflow-x-auto text-sm">
          {comments.map((comment, index) => (
            <div key={comment.id} className="mb-2 p-2 border rounded relative">
              <div className="flex items-start gap-2">
                {comment.thinking && thinkingSection(index, comment)}
                <div
                  className="flex-grow"
                  style={{
                    width: "150px",
                    maxWidth: "150px",
                    maxHeight: "100px",
                    overflow: "auto",
                  }}
                >
                  {comment.transformed}
                </div>
                <Popover
                  isOpen={showOriginal.includes(index)}
                  positions={["right"]}
                  content={
                    <div
                      className="ml-2 p-2 rounded text-xs border"
                      style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        overflow: "auto",
                      }}
                    >
                      Original: {comment.original}
                    </div>
                  }
                >
                  <button
                    className={`text-white hover:text-orange-700 p-2 -m-2 text-xl ${
                      showOriginal.includes(index) ? "" : "opacity-50"
                    }`}
                    onClick={() => toggleOriginals(index)}
                  >
                    ↺
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
            className="flex items-center text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M17 3a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1h12a1 1 0 001-1V3zM9 15H7v-2h2v2zm4 0h-2v-2h2v2zm1-4H6V5h8v6z" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </>
  );
};

export default Comments;
