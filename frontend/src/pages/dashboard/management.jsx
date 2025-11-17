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
} from "@material-tailwind/react";
import {
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import api from "@/configs/api";
import Upload from "@/widgets/Upload";

export  function Management() {
  const [studentId, setStudentId] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [showUpload, setShowUpload] = useState(false);

  const handleSearch = async () => {
    const id = studentId.trim();
    if (!id) return;
    try {
      const { data } = await api.get("/certificates/search", {
        params: { studentId: id },
      });
      setCertificates(data);
    } catch (err) {
      console.error("Error fetching certificates:", err);
      setCertificates([]);
    }
  };

  function getDownloadUrl(certificateUrl) {
  // Insert "fl_attachment" immediately after "/upload"
  return certificateUrl.replace(
    "/upload/",
    "/upload/fl_attachment/" 
  );
}

  const handleDelete = async (certId) => {
    try {
      await api.delete(`/certificates/${certId}`);
      setCertificates((prev) => prev.filter((c) => c._id !== certId));
    } catch (err) {
      console.error("Error deleting certificate:", err);
    }
  };

  return (
    <>
      {/* Header Background */}
      <div
        className="relative mt-8 h-72 w-full rounded-xl bg-cover bg-center bg-[url('/img/background-image.png')]"
      >
        <div className="absolute inset-0 bg-gray-900/75" />
      </div>

      {/* Main Card */}
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100 shadow">
        {/* Search & Upload Header */}
        <CardHeader className="p-4 text-right">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Avatar src="/img/search.png" size="xl" variant="rounded" />
              <div>
                <Typography variant="h2" className="font-arabic">
                  واجهة البحث والإدارة
                </Typography>
                <Typography
                  variant="small"
                  className="text-blue-gray-600 font-arabic"
                >
                  ابحث عن شهادات الطلاب أو أضف شهادات جديدة
                </Typography>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 flex-1">
              <Input
                label="معرف الطالب"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
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

        <CardBody className="px-4 pb-4">
          {/* Certificates Grid Title */}
          <Typography
            variant="h5"
            className="font-arabic mb-4 text-center"
          >
            شهادات الطالب
          </Typography>

          {/* Certificates Grid */}
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {certificates.length > 0 ? (
              certificates.map((cert, idx) => (
                <CardBody
                  key={cert._id}
                  className="relative border flex flex-col items-center p-6"
                >
                  {/* Date badge */}
                  <Typography className="absolute top-2 left-2 text-xs text-gray-500 font-arabic">
                    {new Date(cert.createdAt).toLocaleDateString("ar-EG")}
                  </Typography>

                  {/* Certificate Icon */}
                  <DocumentTextIcon className="h-12 w-12 text-blue-gray-500" />

                  {/* Arbitrary Name */}
                  <Typography variant="h6" className="mt-2 font-arabic">
                    شهادة {idx + 1}
                  </Typography>

                  {/* Actions */}
                  <div className="flex justify-center mt-4 gap-4 items-center">
                    <Link to={cert.certificateUrl} target="_blank">
                      <EyeIcon className="h-6 w-6 text-blue-gray-500 hover:text-blue-700" />
                    </Link>
                    <Link
                      to={getDownloadUrl(cert.certificateUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ArrowDownTrayIcon className="h-6 w-6 text-green-500 hover:text-green-700" />
                    </Link>
                    <IconButton
                      size="sm"
                      variant="text"
                      color="red"
                      onClick={() => handleDelete(cert._id)}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </CardBody>
              ))
            ) : (
              <Typography className="font-arabic text-center col-span-full text-gray-500">
                لا توجد شهادات لهذا الطالب في الوقت الحالي
              </Typography>
            )}
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default Management