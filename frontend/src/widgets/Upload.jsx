// src/widgets/Upload.jsx
import React, { useState, useRef } from "react";
import {
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/solid";
import api from "@/configs/api";
import { toast } from "react-toastify";

export default function Upload({ studentId, onUploaded }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleFiles = (newFiles) => {
    const pdfs = Array.from(newFiles).filter((f) =>
      f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfs.length !== newFiles.length) {
      setError("فقط ملفات PDF مسموح بها");
    }
    setFiles((prev) => [...prev, ...pdfs]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!studentId) {
      setError("المعرف مطلوب");
      return;
    }
    if (files.length === 0) {
      setError("أضف ملفات أولاً");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("studentId", studentId);
    files.forEach((f) => formData.append("certificate", f));

    try {
      const { data } = await api.post("/certificates", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("تم رفع الشهادات بنجاح");
      onUploaded(data);
      setFiles([]);
      setError("");
    } catch (e) {
      console.error(e);
      setError("حدث خطأ أثناء الرفع");
      toast.error("حدث خطأ أثناء الرفع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h5" className="mb-4 font-arabic text-center">
        رفع شهادات للطالب: {studentId}
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="min-h-[10rem] border-4 border-dashed border-blue-500 rounded-2xl flex flex-col items-center justify-center p-4"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <Typography className="font-arabic">اسحب إفلات PDF هنا</Typography>
          <img src="/img/upload.png" width={50} height={50} alt="" />

          <Button
            onClick={() => inputRef.current.click()}
            className="font-arabic"
            disabled={loading}
          >
            اختر ملفات
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        <div className="border rounded-2xl p-4 max-h-[10rem] overflow-auto">
          {files.length > 0 ? (
            files.map((f, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center border-b py-2 font-arabic"
              >
                <span>{f.name}</span>
                <IconButton
                  size="sm"
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, i) => i !== idx))
                  }
                  disabled={loading}
                >
                  <TrashIcon className="h-5 w-5 text-red-500" />
                </IconButton>
              </div>
            ))
          ) : (
            <Typography className="text-center text-gray-500 font-arabic">
              لا توجد ملفات
            </Typography>
          )}
        </div>
      </div>

      {error && (
        <Typography color="red" className="mt-4 text-center font-arabic">
          {error}
        </Typography>
      )}

      <div className="flex justify-center mt-6">
        <Button
          onClick={handleUpload}
          className="font-arabic flex items-center gap-2"
          color="green"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4z"
                ></path>
              </svg>
              جاري الرفع…
            </>
          ) : (
            "رفع الشهادات"
          )}
        </Button>
      </div>
    </div>
  );
}
