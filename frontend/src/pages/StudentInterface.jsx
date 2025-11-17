import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Input,
  Avatar,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
} from "@material-tailwind/react";
import {
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  HomeIcon,  
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import api from "@/configs/api";

export default function StudentsInterface() {
  const [studentId, setStudentId] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [viewMode, setViewMode] = useState("cards");
  const [openDisclaimer, setOpenDisclaimer] = useState(false);
  const [selectedAction, setSelectedAction] = useState({ type: "", url: "" });
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    const idTrim = studentId.trim();
    if (!idTrim) return;
     setHasSearched(true);
    try {
      const { data } = await api.get("/certificates/search", {
        params: { studentId: idTrim },
      });
      setCertificates(data);
    } catch (err) {
      console.error("Error fetching certificates:", err);
      setCertificates([]);
    }
  };

  function getDownloadUrl(certificateUrl) {
    return certificateUrl.replace("/upload/", "/upload/fl_attachment/");
  }

  const handleCertificateAction = (type, url) => {
    setSelectedAction({ type, url });
    setOpenDisclaimer(true);
  };

  const proceedWithAction = () => {
    window.open(selectedAction.url, "_blank");
    setOpenDisclaimer(false);
  };

  return (
    <>
      {/* Header with Logo & Title */}
      <div className="relative h-72 w-full n rounded-xl bg-cover bg-center bg-[url('/img/background-image.png')]">
          <div className="absolute top-4 left-4 z-20 hover:cursor-pointer">
            <Link to="/dashboard">
              <Button
                size="sm"
                variant="text"
                color="white"
                className="flex items-center gap-1 font-arabic"
              >
                <HomeIcon className="h-5 w-5" />
                لوحة التحكم
              </Button>
            </Link>
          </div> 
        <div className="absolute inset-0 bg-gray-900/75 z-0  pointer-events-none" />
        <div className="absolute inset-0 mb-32 flex flex-col justify-center items-center text-center p-4">
          <Avatar src="/img/logo.jpg" alt="Logo" size="xl" variant="circular" />
          <Typography variant="h5" className="mt-4 text-white font-arabic">
            حلول التعليمية
          </Typography>
        </div>
      </div>

      {/* Search Interface */}
      <Card className="mx-4 -mt-20 mb-8 border border-blue-gray-100 shadow min-h-[600px] bg-sky-500">
        <CardHeader className="p-6 text-right bg-blue-gray-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Avatar src="/img/certificate.png" size="xl" variant="rounded" />
              <div>
                <Typography variant="h2" className="font-arabic">
                  2222222منصة استلام الشهادات
                </Typography>
                <Typography
                  variant="small"
                  className="text-blue-gray-300 font-arabic"
                >
                  ابحث عن شهاداتك باستخدام رقم الطلب
                </Typography>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-col md:flex-row">
              <Input
                label="ادخل رقم الطلب هنا"
                value={studentId}
                onChange={(e) => {
                          setStudentId(e.target.value);
                        }}
                className="font-arabic"
              />
              <Button
                onClick={handleSearch}
                className="font-arabic min-w-[140px] px-4 py-2 flex items-center justify-center gap-2"
                color="blue"
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-white" />
                بحث
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* <Typography className="font-arabic text-center text-red-500 mt-8 text-lg font-bold">
          الاحتفاظ بالشهادة مسئولية المتدرب ولا يوجد لدينا ارشيف.
        </Typography> */}

        <CardBody className="p-6">
          {/* View-mode toggle */}
          {certificates.length > 0 && (
            <div className="flex items-center justify-end mb-4 space-x-2">
              <Button
                size="sm"
                className={`font-arabic ${
                  viewMode === "cards"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-400"
                }`}
                onClick={() => setViewMode("cards")}
              >
                عرض بطاقات
              </Button>
              <Button
                size="sm"
                className={`font-arabic ${
                  viewMode === "table"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-400"
                }`}
                onClick={() => setViewMode("table")}
              >
                عرض جدول
              </Button>
            </div>
          )}

          {/* Prompt / No results */}
          {!studentId.trim() && (
            <Typography className="font-arabic text-center text-gray-500">
              من فضلك أدخل رقم الطلب للبحث عن الشهادات.
            </Typography>
          )}
          {hasSearched && studentId.trim() && certificates.length === 0 && (
            <Typography className="font-arabic text-center text-red-500">
              لا توجد شهادات لهذا المعرف
            </Typography>
          )}

          {/* Cards View */}
          {certificates.length > 0 && viewMode === "cards" && (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
             {certificates.map((cert, idx) => (
                <Card key={cert._id} className="hover:shadow-lg transition-shadow">
                  <CardBody className="flex flex-col items-center p-4">
                    {/* Top row with date and badge */}
                    <div className="w-full flex justify-between items-start mb-2">
                      <Typography variant="small" className="text-gray-500 font-arabic">
                        {new Date(cert.createdAt).toLocaleDateString("ar-EG")}
                      </Typography>
                      <Typography
                        variant="small"
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                      >
                        #{idx + 1}
                      </Typography>
                    </div>

                    {/* Certificate Icon */}
                    <DocumentTextIcon className="h-16 w-16 text-blue-500 my-4" />
                                <Typography variant="h6" className="mt-2 font-arabic">
                                  شهادة {idx + 1}
                                </Typography>
                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 w-full mt-2">
                      <IconButton
                        color="blue"
                        variant="text"
                        onClick={() =>
                          handleCertificateAction("view", cert.certificateUrl)
                        }
                      >
                        <EyeIcon className="h-5 w-5" />
                      </IconButton>

                      <IconButton
                        color="green"
                        variant="text"
                        onClick={() =>
                          handleCertificateAction(
                            "download",
                            getDownloadUrl(cert.certificateUrl)
                          )
                        }
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </IconButton>

                    </div>
                  </CardBody>
                </Card>
              ))}

            </div>
          )}

          {/* Table View */}
          {certificates.length > 0 && viewMode === "table" && (
            <table className="min-w-full table-auto text-right font-arabic">
              <thead>
                <tr>
                  <th className="px-4 py-2">الشهادة</th>
                  <th className="px-4 py-2">التاريخ</th>
                  <th className="px-4 py-2">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert, idx) => (
                  <tr key={cert._id} className="border-t">
                    <td className="px-4 py-2 font-arabic">شهادة {idx + 1}</td>
                    <td className="px-4 py-2">
                      {new Date(cert.createdAt).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex justify-center space-x-4">
                        <IconButton
                          onClick={() =>
                            handleCertificateAction("view", cert.certificateUrl)
                          }
                          className="h-6 w-6 text-blue-gray-500 hover:text-blue-700 bg-white"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            handleCertificateAction(
                              "download",
                              getDownloadUrl(cert.certificateUrl)
                            )
                          }
                          className="h-6 w-6 text-green-500 hover:text-green-700 bg-white"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* Disclaimer Dialog */}
      <Dialog open={openDisclaimer} handler={() => setOpenDisclaimer(false)}>
        <DialogHeader className="font-arabic">تنبيه هام</DialogHeader>
        <DialogBody divider className="font-arabic text-right">
          <Typography variant="h5" className="text-red-500 mb-4">
            الاحتفاظ بالشهادة مسئولية المتدرب
          </Typography>
          <Typography variant="paragraph">
            يرجى العلم أنه لا يوجد لدينا أرشيف للشهادات، وعليك تحميل وحفظ جميع
            الشهادات الخاصة بك. لن نكون مسؤولين عن أي شهادات مفقودة في حالة عدم
            قيامك بحفظها.
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            onClick={() => setOpenDisclaimer(false)}
            className="font-arabic mr-2"
          >
            إلغاء
          </Button>
          <Button
            color="blue"
            onClick={proceedWithAction}
            className="font-arabic"
          >
            {selectedAction.type === "view" ? "مشاهدة الشهادة" : "تحميل الشهادة"}
          </Button>
        </DialogFooter>
      </Dialog>

      <footer className="py-2">
        <div className="text-center">
          <Typography
            variant="small"
            className="font-normal text-inherit text-center font-arabic"
          >
            حلول التعليمية &copy; 2025
          </Typography>
        </div>
      </footer>
    </>
  );
}
