import { toast } from "react-hot-toast";

export const toastConfirm = (message: string, onConfirm: () => void) => {
    toast(
      (t) => (
        <div className="flex flex-col">
          <p>{message}</p>
          <div className="flex justify-center gap-3 mt-2">
            <button
              className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => {
                toast.dismiss(t.id);
                onConfirm();
              }}
            >
              Yes, Delete
            </button>
            <button
              className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 3000 } 
    );
  };
  