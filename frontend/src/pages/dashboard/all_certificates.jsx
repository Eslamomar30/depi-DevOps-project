// src/pages/AllCertificates.jsx
import React, { useState, useEffect } from "react";
import {
  Card, CardHeader, CardBody,
  Typography, Input, Button, IconButton,
  Dialog, DialogHeader, DialogBody, DialogFooter,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon, EyeIcon, ArrowDownTrayIcon,
  TrashIcon, DocumentTextIcon, XMarkIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import Upload from "@/widgets/Upload";
import api from "@/configs/api";
import { toast } from "react-toastify";

// Material-UI imports
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

export default function AllCertificates() {
  const [groups, setGroups] = useState([]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState("view");
  const [deletingStud, setDeletingStud] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    fetchCertificates();
  }, [pagination.page, pagination.limit]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/certificates?page=${pagination.page}&limit=${pagination.limit}`);
      
      const allCerts = data.data;
      const map = {};
      allCerts.forEach((c) => {
        map[c.studentId] = map[c.studentId] || [];
        map[c.studentId].push(c);
      });
      
      setGroups(
        Object.entries(map).map(([id, certs]) => ({
          studentId: id,
          certCount: certs.length,
          certificates: certs,
        }))
      );
      
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const filtered = filter
    ? groups.filter((g) => g.studentId.includes(filter.trim()))
    : groups;

  const openDialogFor = (studentId, certificates, initialMode) => {
    setSelected({ studentId, certificates });
    setMode(initialMode);
    setOpenDialog(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الطالب وكل شهاداته؟")) return;
    setDeletingStud(true);
    try {
      await api.delete(`/certificates/student/${studentId}`);
      setGroups((prev) => prev.filter((g) => g.studentId !== studentId));
      setOpenDialog(false);
      toast.success("تم حذف الطالب بنجاح");
      fetchCertificates(); // Refresh data
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء حذف الطالب");
    } finally {
      setDeletingStud(false);
    }
  };

  const onUploaded = (newCerts) => {
    setSelected((prev) => ({
      ...prev,
      certificates: [...newCerts, ...prev.certificates],
    }));
    setGroups((prev) =>
      prev.map((g) =>
        g.studentId === selected.studentId
          ? {
              ...g,
              certCount: g.certCount + newCerts.length,
              certificates: [...newCerts, ...g.certificates],
            }
          : g
      )
    );
  };

  const getDownloadUrl = (url) =>
    url.replace("/upload/", "/upload/fl_attachment/");

  const handleDeleteCert = async (certId) => {
    if (!window.confirm("هل تريد حذف هذه الشهادة؟")) return;
    try {
      await api.delete(`/certificates/${certId}`);
      const updatedCerts = selected.certificates.filter((c) => c._id !== certId);
      if (updatedCerts.length === 0) {
        setGroups((prev) =>
          prev.filter((g) => g.studentId !== selected.studentId)
        );
        setOpenDialog(false);
      } else {
        setSelected((prev) => ({ ...prev, certificates: updatedCerts }));
        setGroups((prev) =>
          prev.map((g) =>
            g.studentId === selected.studentId
              ? { ...g, certCount: g.certCount - 1, certificates: updatedCerts }
              : g
          )
        );
      }
      toast.success("تم حذف الشهادة");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء حذف الشهادة");
    }
  };

  return (
    <>
      <div className="relative mt-8 h-72 w-full rounded-xl bg-cover bg-center bg-[url('/img/background-image.png')]">
        <div className="absolute inset-0 bg-gray-900/75" />
      </div>

      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border shadow">
        <CardHeader className="p-4 text-right">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Typography variant="h2" className="font-arabic flex-1">
              إدارة الطلاب والشهادات
            </Typography>
            <div className="flex items-center gap-x-2">
              <Input
                label="معرف الطالب"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="font-arabic"
              />
              <Button
                onClick={() => {
                  const grp = groups.find((g) => g.studentId === filter.trim());
                  if (grp) openDialogFor(grp.studentId, grp.certificates, "view");
                }}
                disabled={!filter.trim()}
                color="blue"
                className="flex items-center gap-x-2 font-arabic"
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-white" />
                بحث
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-4 pb-4">
          <TableContainer component={Paper} sx={{ minHeight: 400 }}>
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }} >
                    <Typography variant="h6" className="font-arabic flex-1">
                       معرف الطالب
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    <Typography variant="h6" className="font-arabic flex-1">
                       عدد الشهادات
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    <Typography variant="h6" className="font-arabic flex-1">
                       إجراءات
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      لا توجد بيانات للعرض
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((g) => (
                    <TableRow 
                      key={g.studentId}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="center">{g.studentId}</TableCell>
                      <TableCell align="center">{g.certCount}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          <Button
                            variant="outlined"
                            color="blue"
                            onClick={() =>
                              openDialogFor(g.studentId, g.certificates, "view")
                            }
                            className="font-arabic"
                          >
                            شهادات
                          </Button>
                          <Button
                            variant="outlined"
                            color="green"
                            onClick={() =>
                              openDialogFor(g.studentId, g.certificates, "add")
                            }
                            className="font-arabic"
                          >
                            إضافة شهادة
                          </Button>
                          <Button
                            variant="outlined"
                            color="red"
                            onClick={() => handleDeleteStudent(g.studentId)}
                            disabled={deletingStud}
                            className="font-arabic"
                          >
                            حذف طالب
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {!loading && pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Stack spacing={2}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            </Box>
          )}
        </CardBody>
      </Card>

      <Dialog
        open={openDialog}
        size="lg"
        handler={() => setOpenDialog(false)}
        className="font-arabic"
      >
        <DialogHeader className="bg-blue-gray-50">
          <Typography variant="h5" className="font-arabic">
            شهادات الطالب: {selected?.studentId}
          </Typography>
          <IconButton
            variant="text"
            color="gray"
            className="ml-auto"
            onClick={() => setOpenDialog(false)}
          >
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </DialogHeader>
        <DialogBody divider className="space-y-4">
          {mode === "add" && (
            <Upload
              studentId={selected?.studentId}
              onUploaded={onUploaded}
            />
          )}
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {selected?.certificates.map((cert, idx) => (
              <Card
                key={cert._id}
                className="relative border rounded-lg p-4 flex flex-col items-center hover:shadow-lg transition-shadow"
              >
                <Typography variant="small" className="absolute top-2 left-2 text-gray-500">
                  {new Date(cert.createdAt).toLocaleDateString("ar-EG")}
                </Typography>
                <DocumentTextIcon className="h-12 w-12 text-blue-500" />
                <Typography variant="h6" className="mt-2">
                  شهادة {idx + 1}
                </Typography>
                <Box display="flex" justifyContent="center" gap={2} className="mt-4">
                  <IconButton
                    color="blue"
                    onClick={() => window.open(cert.certificateUrl, '_blank')}
                  >
                    <EyeIcon className="h-5 w-5" />
                  </IconButton>
                  <IconButton
                    color="green"
                    onClick={() => window.open(getDownloadUrl(cert.certificateUrl), '_blank')}
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </IconButton>
                  <IconButton
                    color="red"
                    onClick={() => handleDeleteCert(cert._id)}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </IconButton>
                </Box>
              </Card>
            ))}
            {selected?.certificates.length === 0 && (
              <Typography className="text-center text-gray-500 py-8">
                لا توجد شهادات لهذا الطالب
              </Typography>
            )}
          </div>
        </DialogBody>
        <DialogFooter className="bg-blue-gray-50">
          <Button
            variant="gradient"
            color="blue"
            onClick={() => setOpenDialog(false)}
            className="font-arabic"
          >
            إغلاق
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}