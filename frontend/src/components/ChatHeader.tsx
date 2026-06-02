import type React from "react";
import { HiOutlineSparkles } from "react-icons/hi2";
import { IoSettingsOutline } from "react-icons/io5";
import { RiMenu3Fill } from "react-icons/ri";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDarkMode: boolean;
}

const ChatHeader = ({
  sidebarOpen,
  setSidebarOpen,
  isDarkMode,
}: HeaderProps) => {
  return (
    <div
      className={`
        px-8 py-5
        flex
        justify-between
        md:justify-end
        items-center
        border-b
        ${
          isDarkMode
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-white border-gray-200 text-gray-900"
        }
      `}>
      <button
        className="md:hidden mr-3 text-indigo-500"
        onClick={() => setSidebarOpen(!sidebarOpen)}>
        <RiMenu3Fill size={26} />
      </button>

      <div className="flex items-center gap-2 md:hidden">
        <HiOutlineSparkles className="text-3xl text-indigo-500" />
        <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          SmartAssist
        </h3>
      </div>

      <div>
        <button
          className="
            p-2
            text-indigo-500
            rounded-lg
            transition
          ">
          <IoSettingsOutline size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
