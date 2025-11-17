import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Input,
  Avatar,
  IconButton,
  Alert,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Spinner,
} from "@material-tailwind/react";
import {
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/configs/api";
import Upload from "@/widgets/Upload";

export default function AddCertificates() {
  const [studentId, setStudentId] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    certId: null
  });

  const onUploaded = (newCerts) => {
    setCertificates((prev) => [...newCerts, ...prev]);
    setShowUpload(false);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 5000);
  };

  const openDeleteConfirmDialog = (certId) => {
    setConfirmDialog({
      open: true,
      certId
    });
  };

  const closeDeleteConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      certId: null
    });
  };

  const handleDelete = async (certId) => {
    closeDeleteConfirmDialog();
    setDeletingIds((prev) => [...prev, certId]);
    try {
      await api.delete(`/certificates/${certId}`);
      setCertificates((prev) => prev.filter((c) => c._id !== certId));
      toast.success("تم حذف الشهادة بنجاح");
    } catch (err) {
      console.error("Error deleting certificate:", err);
      toast.error("حدث خطأ أثناء حذف الشهادة");
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== certId));
    }
  };

  const getDownloadUrl = (url) =>
    url.replace("/upload/", "/upload/fl_attachment/");

  const resetForm = () => {
    setStudentId("");
    setCertificates([]);
    setShowUpload(false);
  };

  return (
    <>
      {/* Header Background */}
      <div className="relative mt-8 h-72 w-full rounded-xl bg-cover bg-center bg-[url('/img/background-image.png')]">
        <div className="absolute inset-0 bg-gray-900/75" />
      </div>

      {/* Main Card */}
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100 shadow-lg">
        {/* Title */}
        <CardHeader floated={false} shadow={false} className="p-6 text-right">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar src="/img/upload.png" size="xl" variant="rounded" className="hidden md:block" />
              <div>
                <Typography variant="h2" className="font-arabic">
                  إضافة شهادات جديدة
                </Typography>
                <Typography variant="small" className="text-blue-gray-600 font-arabic">
                  أدخل معرف الطالب ثم ارفع الشهادات
                </Typography>
              </div>
            </div>
            {certificates.length > 0 && (
              <Button
                color="red"
                variant="outlined"
                className="font-arabic"
                onClick={resetForm}
              >
                بدء عملية جديدة
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Main Content */}
        <CardBody className="p-6 space-y-8">
          {/* Student ID Input */}
          <div className="flex flex-col gap-2">
            <Typography variant="h6" className="font-arabic text-right">
              معرف الطالب
            </Typography>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Input
                label="أدخل معرف الطالب"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="font-arabic flex-1"
                size="lg"
              />
              <Button
                color={showUpload ? "red" : "green"}
                className="min-w-[180px] flex items-center gap-2 font-arabic"
                onClick={() => {
                  if (showUpload) {
                    setShowUpload(false);
                  } else if (studentId.trim()) {
                    setShowUpload(true);
                  }
                }}
                disabled={!studentId.trim()}
              >
                {showUpload ? (
                  <>
                    <XMarkIcon className="h-5 w-5" />
                    إلغاء الرفع
                  </>
                ) : (
                  <>
                    <PlusCircleIcon className="h-5 w-5" />
                    رفع الشهادات
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Upload Success Alert */}
          {uploadSuccess && (
            <Alert
              icon={<CheckCircleIcon className="h-6 w-6" />}
              className="bg-green-50 text-green-800 font-arabic border-l-4 border-green-500"
            >
              تم رفع الشهادات بنجاح! يمكنك رفع المزيد أو متابعة الشهادات المرفوعة أدناه.
            </Alert>
          )}

          {/* Upload Section */}
          {showUpload && studentId.trim() && (
            <div className="relative bg-blue-gray-50 rounded-xl shadow-inner p-6 border border-blue-gray-200">
              <Upload studentId={studentId.trim()} onUploaded={onUploaded} />
            </div>
          )}

          {/* Certificates Grid */}
          {certificates.length > 0 && (
            <div className="space-y-4">
              <Typography variant="h4" className="font-arabic text-center border-b pb-2">
                الشهادات المرفوعة
              </Typography>
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {certificates.map((cert, idx) => (
                  <Card key={cert._id} className="hover:shadow-lg transition-shadow">
                    <CardBody className="flex flex-col items-center p-4">
                      <div className="w-full flex justify-between items-start mb-2">
                        <Typography variant="small" className="text-gray-500 font-arabic">
                          {new Date(cert.createdAt).toLocaleDateString("ar-EG")}
                        </Typography>
                        <Typography variant="small" className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          #{idx + 1}
                        </Typography>
                      </div>
                      <DocumentTextIcon className="h-16 w-16 text-blue-500 my-4" />
                      <div className="flex justify-center gap-4 w-full mt-2">
                        <IconButton
                          color="blue"
                          variant="text"
                          onClick={() => window.open(cert.certificateUrl, '_blank')}
                        >
                          <EyeIcon className="h-5 w-5" />
                        </IconButton>
                        <IconButton
                          color="green"
                          variant="text"
                          onClick={() => window.open(getDownloadUrl(cert.certificateUrl), '_blank')}
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </IconButton>
                        <IconButton
                          color="red"
                          variant="text"
                          onClick={() => openDeleteConfirmDialog(cert._id)}
                          disabled={deletingIds.includes(cert._id)}
                        >
                          {deletingIds.includes(cert._id) ? (
                            <svg
                              className="animate-spin h-5 w-5 text-red-500"
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
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4z"
                              />
                            </svg>
                          ) : (
                            <TrashIcon className="h-5 w-5" />
                          )}
                        </IconButton>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!showUpload && certificates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <DocumentTextIcon className="h-20 w-20 text-blue-gray-300 mb-4" />
              <Typography variant="h5" className="font-arabic text-blue-gray-500">
                لم يتم رفع أي شهادات بعد
              </Typography>
              <Typography variant="paragraph" className="font-arabic text-blue-gray-400 mt-2">
                أدخل معرف الطالب ثم انقر على زر "رفع الشهادات" لبدء العملية
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        handler={closeDeleteConfirmDialog}
        size="xs"
      >
        <DialogHeader className="justify-end font-arabic">
          تأكيد الحذف
        </DialogHeader>
        <DialogBody className="text-right font-arabic">
          هل أنت متأكد من حذف هذه الشهادة؟
          <Typography variant="small" className="mt-2 text-blue-gray-500">
            لا يمكن التراجع عن هذا الإجراء بعد التأكيد.
          </Typography>
        </DialogBody>
        <DialogFooter className="flex justify-between">
          <Button 
            variant="text" 
            color="blue-gray" 
            onClick={closeDeleteConfirmDialog}
            className="font-arabic"
          >
            إلغاء
          </Button>
          <Button 
            color="red" 
            onClick={() => {
              handleDelete(confirmDialog.certId)
              console.log("id",confirmDialog.certId)
            }}
            className="font-arabic"
          >
            تأكيد الحذف
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}