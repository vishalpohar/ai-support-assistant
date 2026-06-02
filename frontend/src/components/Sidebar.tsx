import type React from "react";
import { HiOutlineSparkles } from "react-icons/hi";
import { IoChatbubbles, IoTrashOutline } from "react-icons/io5";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { TbMessageCircle } from "react-icons/tb";

import { useAppDispatch } from "../app/hooks";
import { getMessages } from "../features/messageSlice";

import type { Session } from "../types/session";

interface SidebarProps {
  sidebarOpen: boolean;
  clearChat: () => void;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sessions: Session[];
  currentSession: string | null;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  loadSession: (sessionId: string) => void;
}

const Sidebar = ({
  sidebarOpen,
  clearChat,
  setSidebarOpen,
  sessions,
  currentSession,
  isDarkMode,
  setIsDarkMode,
  loadSession,
}: SidebarProps) => {
  const dispatch = useAppDispatch();
  const loadMessages = async (sessionId: string) => {
    dispatch(getMessages(sessionId));
  };
  return (
    <div
      className={`
    fixed md:static
    top-0 left-0
    h-screen
    w-[280px]
    z-50
    flex flex-col
    py-6
    transition-transform
    duration-300
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
    ${isDarkMode ? "bg-gray-800" : "bg-white"}
  `}>
      <div className="mb-8 px-6 pb-5 border-b md:border-0 border-indigo-500">
        <div className="flex items-center gap-2">
          <HiOutlineSparkles className="text-3xl text-indigo-500" />
          <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            SmartAssist
          </h2>
        </div>
      </div>

      <button
        className={`
          flex
          items-center
          gap-3
          px-4
          py-3
          mx-4
          rounded-xl
          mb-4
          transition
          ${
            isDarkMode
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-gray-100 hover:bg-gray-200"
          }
        `}
        onClick={() => {
          clearChat();
          setSidebarOpen(false);
        }}>
        <IoChatbubbles />
        New Chat
      </button>

      <div className="flex-1 mt-4 px-4 overflow-y-auto">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`
              flex
              items-center
              gap-3
              px-3
              py-3
              mb-2
              rounded-xl
              border
              border-black/50
              cursor-pointer
              transition
              duration-200
              ${
                currentSession === session.id
                  ? "bg-indigo-500 text-white"
                  : isDarkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-100"
              }
            `}
            onClick={() => {
              loadMessages(session.id);
              loadSession(session.id);
              setSidebarOpen(false);
            }}>
            <TbMessageCircle />
            <span>{session.title}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto px-4 flex flex-col gap-2">
        <button
          className={`
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-xl
              transition
              ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }
            `}
          onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? <MdOutlineLightMode /> : <MdOutlineDarkMode />}
          <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
        <button
          className={`
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-xl
              transition
              ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }
            `}
          onClick={() => {
            clearChat();
            setSidebarOpen(false);
          }}>
          <IoTrashOutline />
          Clear Chat
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
