import ReactMarkdown from "react-markdown";

import { HiOutlineSparkles } from "react-icons/hi";
import {
  IoCopyOutline,
  IoPersonCircle,
  IoThumbsDownOutline,
  IoThumbsUpOutline,
} from "react-icons/io5";
import type { ChatMessage } from "../types/message";
import { formatTime } from "../utils/formatTime";

interface MessageProps {
  msg: ChatMessage;
}

const Message = ({ msg }: MessageProps) => {
  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };
  return (
    <div
      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
      <div
        className="
        w-9
        h-9
        rounded-full
        flex
        items-center
        justify-center
        shrink-0
      ">
        {msg.role === "user" ? (
          <IoPersonCircle size={30} className="text-indigo-500" />
        ) : (
          <HiOutlineSparkles size={26} className="text-indigo-500" />
        )}
      </div>

      <div className="max-w-[80%]">
        <div
          className={`
          rounded-2xl
          px-4
          py-3
          shadow-sm
          ${
            msg.role === "user"
              ? "bg-indigo-500 text-white"
              : "bg-white text-gray-900 border border-gray-100"
          }
        `}>
          <div
            className={`prose prose-sm max-w-none dark:prose-invert ${
              msg.role === "user" ? "text-right" : ""
            }`}>
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        </div>

        <div
          className={`
          flex
          items-center
          gap-3
          mt-2
          text-xs
          text-gray-500
          ${msg.role === "user" ? "justify-end" : "justify-between"}
        `}>
          <span>{formatTime(msg.timestamp)}</span>

          {msg.role !== "user" && (
            <div className="flex items-center gap-2">
              <button
                className="
                p-1.5
                rounded-md
                hover:bg-indigo-500
                hover:text-white
                transition
              "
                onClick={() => copyToClipboard(msg.text)}
                title="Copy">
                <IoCopyOutline />
              </button>

              <button
                className="
                p-1.5
                rounded-md
                hover:bg-indigo-500
                hover:text-white
                transition
              "
                title="Helpful">
                <IoThumbsUpOutline />
              </button>

              <button
                className="
                p-1.5
                rounded-md
                hover:bg-indigo-500
                hover:text-white
                transition
              "
                title="Not helpful">
                <IoThumbsDownOutline />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
