import { X } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  title = "Logout",
  message = "Are you sure want to logout?",
  confirmText = "Yes,Logout",
  cancelText = "Cancel",
  confirmBtnClass = "bg-gradient-to-r from-purple-600 to-purple-800 text-white",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      
      <div className="relative w-[420px] bg-white rounded-2xl shadow-2xl p-8 text-center animate-scaleIn">

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute -top-4 right-4 bg-purple-200 text-purple-700 rounded-full p-2 hover:bg-purple-300 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-600 mb-3">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-500 text-sm mb-8">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          
          <button
            onClick={onCancel}
            className="px-6 py-2 w-36 rounded-lg bg-purple-200 text-purple-700 font-medium hover:bg-purple-300 transition cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`px-6 py-2 w-36 rounded-lg font-medium hover:opacity-90 transition cursor-pointer ${confirmBtnClass}`}
          >
            {confirmText}
          </button>

        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;