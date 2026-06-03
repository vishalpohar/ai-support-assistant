import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { FaMicrophone, FaPaperPlane, FaSpinner } from "react-icons/fa";
import { MdClose, MdOutlineUploadFile } from "react-icons/md";

interface InputProps {
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  newMessage: () => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  isDarkMode: boolean;
}

const InputArea = ({
  inputRef,
  fileInputRef,
  selectedFile,
  setSelectedFile,
  newMessage,
  message,
  setMessage,
  loading,
  isDarkMode,
}: InputProps) => {
  useEffect(() => {
    const textarea = inputRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + "px";
  }, [message]);

  const onPdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");

      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      newMessage();
    }
  };

    const removeFile = () => {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

  return (
    <div
      className={`px-8 pt-3 pb-2 border-t ${
        isDarkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
      }`}>
      <div
        className={`
        px-5
        py-2
        rounded-3xl
        border
        transition
          ${
            isDarkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-gray-100 border-gray-200"
          }
        `}>
        <textarea
          ref={inputRef}
          placeholder="Ask me anything..."
          value={message}
          className={`
              w-full
              bg-transparent
              outline-none
              resize-none
              overflow-y-auto
              max-h-[100px]
              text-sm
              ${
                isDarkMode
                  ? "text-white placeholder:text-gray-400"
                  : "text-black placeholder:text-gray-500"
              }
            `}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setMessage(e.target.value)
          }
          onKeyDown={handleKeyPress}
          rows={1}
        />
        <div className="mt-2 flex items-center justify-between">
          {!selectedFile && (
            <button
              className="
                rounded-full
                flex
                items-center
                justify-center
                p-2
                hover:bg-indigo-500
                hover:text-white
                transition"
              onClick={() => fileInputRef.current?.click()}>
              {loading && selectedFile ? (
                <FaSpinner className="text-indigo-500 animate-spin" />
              ) : (
                <MdOutlineUploadFile size={22} />
              )}
            </button>
          )}
          <input
            type="file"
            accept=".pdf,application/pdf"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={onPdfUpload}
          />
          {selectedFile && (
            <div
              className={`
              flex
              items-center
              gap-2
              px-3
              py-1
              rounded-lg
              text-xs
              ${isDarkMode ? "bg-gray-600 text-white" : "bg-gray-200 text-black"}
            `}>
              {selectedFile.name}
              <button
                className="
                p-1
                rounded-full
                hover:bg-red-500
                hover:text-white"
                onClick={removeFile}>
                <MdClose size={16} />
              </button>
            </div>
          )}
          <div className="flex gap-4">
            <button
              className="
            rounded-full
            flex
            items-center
            justify-center
            p-2
            hover:bg-indigo-500
            hover:text-white
            transition"
              title="Voice input">
              <FaMicrophone />
            </button>
            <button
              className="
                rounded-full
                flex
                items-center
                justify-center
                p-2
                hover:bg-indigo-500
                hover:text-white
                transition"
              onClick={newMessage}
              disabled={(!message.trim() && !selectedFile) || loading}>
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaPaperPlane />
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="text-center text-xs opacity-50 mt-2">
        Press Enter to send, Shift + Enter for new line
      </div>
    </div>
  );
};

export default InputArea;
