// import ollama, { ChatResponse } from "ollama/browser";
import { Comment } from '@/components/comments';
import { saveAs } from 'file-saver';

// const chatDeep = async (message: string) => {
//     const response: ChatResponse = await ollama.chat({
//       // model: "llama3.2",
//       model: "deepseek-r1:1.5b",
//       messages: [{ role: "user", content: message ?? "Why is the sky blue?" }],
//     });
//     console.log(response);
//   };

export const saveToFile = (data: string, filename: string) => {
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, filename);
};

export const saveComments = (comments: Comment[]): void => {
  const data = JSON.stringify(
    comments,
    null,
    2
  );
  saveToFile(data, "comments.json");
};

export function getTextAfterThink(text: string): string {
  const regex = /<\/think>(.*?)$/s;
  const match = text.match(regex);
  return match ? match[1] : '';
}

export function getThoughtContent(text: string): string {
  const regex = /<think>(.*?)<\/think>/s;
  const match = text.match(regex);
  return match ? match[1] : '';
}
