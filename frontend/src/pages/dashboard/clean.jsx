// src/pages/AddCertificates.jsx
import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Avatar,
  Alert,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Spinner,
} from "@material-tailwind/react";
import { toast } from "react-toastify";
import api from "@/configs/api";

export default function AddCertificates() {
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertInfo, setAlertInfo] = useState({
    color: "green",
    message: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load data functionality 

  const handleOpenConfirmDialog = () => setOpenConfirmDialog(true);
  const handleCloseConfirmDialog = () => setOpenConfirmDialog(false);

  const displayAlert = (color, message) => {
    setAlertInfo({ color, message });
    setShowAlert(true);
    
    // Auto hide alert after 5 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setIsLoading(true);
    try {
      await api.delete(`/certificates`);
      handleCloseConfirmDialog();
      displayAlert("green", "تم حذف جميع الشهادات بنجاح");
      toast.success("تم حذف الشهادات بنجاح");
    } catch (err) {
      console.error("Error deleting certificates:", err);
      displayAlert("red", "حدث خطأ أثناء حذف الشهادات");
      toast.error("حدث خطأ أثناء حذف الشهادات");
    } finally {
      setIsDeleting(false);
      setIsLoading(false);
    }
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
              <Avatar src="/img/garbage-truck.png" size="xl" variant="rounded" className="hidden md:block" />
              <div>
                <Typography variant="h2" className="font-arabic">
                  حذف جميع الشهادات من قاعدة البيانات
                </Typography>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Alert Messages */}
        {showAlert && (
          <div className="px-6">
            <Alert
              color={alertInfo.color}
              variant="gradient"
              className="mb-4 text-right font-arabic"
              dismissible={{
                onClose: () => setShowAlert(false),
              }}
            >
              {alertInfo.message}
            </Alert>
          </div>
        )}

        {/* Main Content */}
        <CardBody className="p-6 flex flex-col items-center justify-center">
            <Button
              color="red"
              onClick={handleOpenConfirmDialog}
              className="font-arabic"
              disabled={isLoading}
            >
              {isLoading?"جاري الحذف ...":"حذف جميع الشهادات"}
            </Button>
        </CardBody>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        handler={handleCloseConfirmDialog}
        size="sm"
      >
        <DialogHeader className="justify-end font-arabic">
          تأكيد الحذف
        </DialogHeader>
        <DialogBody className="text-right font-arabic">
          هل أنت متأكد من رغبتك في حذف جميع الشهادات؟ لا يمكن التراجع عن هذا الإجراء.
        </DialogBody>
        <DialogFooter className="flex justify-between">
          <Button 
            variant="text" 
            color="blue-gray" 
            onClick={handleCloseConfirmDialog}
            className="font-arabic"
          >
            إلغاء
          </Button>
          <Button 
            color="red" 
            onClick={handleDelete}
            loading={isDeleting}
            className="font-arabic"
          >
            تأكيد الحذف
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}