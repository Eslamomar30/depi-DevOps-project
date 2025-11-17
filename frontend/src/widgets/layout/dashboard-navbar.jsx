import { Link, useNavigate } from "react-router-dom"; // To handle redirects
import Cookies from "js-cookie"; // To manage cookies
import {
  Navbar,
  Button,
  IconButton,
  Card,
  CardHeader,
  CardBody,
  Input,
  Typography,
  Alert,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Bars3Icon,
  BookOpenIcon,
  KeyIcon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "@/context";
import { useState, useEffect } from "react";
import api from "@/configs/api"; 

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const navigate = useNavigate(); // Use navigate to redirect after logout
  const [showChangePasswordCard, setShowChangePasswordCard] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
  });

  // Close form when clicking outside
  useEffect(() => {
    if (showChangePasswordCard) {
      const handleClickOutside = (event) => {
        const card = document.getElementById("password-change-card");
        if (card && !card.contains(event.target)) {
          handleCloseChangePassword();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showChangePasswordCard]);

  // Password strength checker
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength({ score: 0, message: "" });
      return;
    }

    // Simple password strength algorithm
    let score = 0;
    
    if (newPassword.length >= 8) score += 1;
    if (newPassword.match(/[A-Z]/)) score += 1;
    if (newPassword.match(/[a-z]/)) score += 1;
    if (newPassword.match(/[0-9]/)) score += 1;
    if (newPassword.match(/[^A-Za-z0-9]/)) score += 1;

    let message = "";
    let color = "";

    switch (score) {
      case 0:
      case 1:
        message = "ضعيف جداً";
        color = "red";
        break;
      case 2:
        message = "ضعيف";
        color = "orange";
        break;
      case 3:
        message = "متوسط";
        color = "yellow";
        break;
      case 4:
        message = "قوي";
        color = "green";
        break;
      case 5:
        message = "قوي جداً";
        color = "green";
        break;
      default:
        message = "";
    }

    setPasswordStrength({ score, message, color });
  }, [newPassword]);

  const handleSignOut = () => {
    // Remove the token from cookies with path "/"
    const cok = Cookies.get("authToken");
    console.log("cok", cok);
    Cookies.remove("authToken");

    // Redirect to the login page
    navigate("/dashboard/login");
  };

  const handleOpenChangePassword = () => {
    setShowChangePasswordCard(true);
    // Reset form
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setChangePasswordError("");
    setChangePasswordSuccess("");
  };

  const handleCloseChangePassword = () => {
    setShowChangePasswordCard(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setChangePasswordError("");
    setChangePasswordSuccess("");
  };

  const validatePasswordForm = () => {
    // Validate all required fields
    if (!oldPassword.trim()) {
      setChangePasswordError("الرجاء إدخال كلمة المرور الحالية");
      return false;
    }

    if (!newPassword.trim()) {
      setChangePasswordError("الرجاء إدخال كلمة المرور الجديدة");
      return false;
    }

    if (!confirmNewPassword.trim()) {
      setChangePasswordError("الرجاء تأكيد كلمة المرور الجديدة");
      return false;
    }

    // Check if new password meets minimum requirements
    if (newPassword.length < 8) {
      setChangePasswordError("يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل");
      return false;
    }

    // Check if passwords match
    if (newPassword !== confirmNewPassword) {
      setChangePasswordError("كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين");
      return false;
    }

    // Check if new password is different from old password
    if (newPassword === oldPassword) {
      setChangePasswordError("يجب أن تكون كلمة المرور الجديدة مختلفة عن كلمة المرور الحالية");
      return false;
    }

    // All validations passed
    return true;
  };

  const handleChangePassword = async () => {
    // Reset status messages
    setChangePasswordError("");
    setChangePasswordSuccess("");
    
    // Validate the form
    if (!validatePasswordForm()) {
      return;
    }

    // Set loading state
    setIsSubmitting(true);

    try {
      // Call API to change password
      const response = await api.post("/auth/change-password", {
        oldPassword,
        newPassword,
        confirmNewPassword
      });
      
      // Handle success
      console.log("Password changed successfully:", response.data);
      setChangePasswordSuccess("تم تغيير كلمة المرور بنجاح!");
      setChangePasswordError("");
      
      // Auto close after success
      setTimeout(() => {
        handleCloseChangePassword();
      }, 2000);
    } catch (error) {
      // Handle API errors
      console.error("Error changing password:", error);
      
      // Display appropriate error message based on API response
      if (error.response?.status === 401) {
        setChangePasswordError("كلمة المرور الحالية غير صحيحة");
      } else if (error.response?.data?.message) {
        setChangePasswordError(error.response.data.message);
      } else {
        setChangePasswordError("حدث خطأ أثناء تغيير كلمة المرور، حاول مرة أخرى");
      }
    } finally {
      // Reset loading state
      setIsSubmitting(false);
    }
  };

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "px-0 py-1"
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-row-reverse items-center justify-start w-full px-4">
        {/* Collapse menu (always visible on mobile) */}
        <IconButton
          variant="text"
          color="blue-gray"
          className="xl:hidden"
          onClick={() => setOpenSidenav(dispatch, !openSidenav)}
        >
          <Bars3Icon className="h-6 w-6 text-blue-gray-500" />
        </IconButton>


        {/* Sign out: full text button on xl+, icon-only on mobile */}
        <Button
          variant="text"
          color="blue-gray"
          className="hidden xl:flex items-center gap-2 normal-case font-arabic"
          onClick={handleSignOut} // Trigger sign-out function
        >
          <UserCircleIcon className="h-5 w-5" />
          تسجيل الخروج
        </Button>

        {/* Change Password Button */}
        <Button
          variant="text"
          color="blue-gray"
          className="hidden xl:flex items-center gap-2 normal-case font-arabic"
          onClick={handleOpenChangePassword}
        >
          <KeyIcon className="h-5 w-5" />
          تغيير كلمة المرور
        </Button>
        <Link to={"/"} target="_blank">
          <Button
            variant="text"
            color="blue-gray"
            className="hidden xl:flex items-center gap-2 normal-case font-arabic"
          >
            <BookOpenIcon className="h-5 w-5" />
            واجهة الطلاب
          </Button>
        </Link>

        <IconButton
          variant="text"
          color="blue-gray"
          className="xl:hidden"
          onClick={handleSignOut} // Trigger sign-out function
        >
          <UserCircleIcon className="h-5 w-5" />
        </IconButton>
      </div>

      {/* Change Password Modal/Card */}
      {showChangePasswordCard && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Card id="password-change-card" className="w-96 max-w-[90%] shadow-xl">
            <CardHeader
              variant="gradient"
              color="blue"
              className="grid h-16 place-items-center mb-4"
            >
              <Typography variant="h5" color="white" className="font-arabic">
                تغيير كلمة المرور
              </Typography>
            </CardHeader>
            
            <CardBody className="flex flex-col gap-4 p-6">
              {/* Success Message */}
              {changePasswordSuccess && (
                <Alert
                  color="green"
                  className="font-arabic text-right"
                  animate={{
                    mount: { y: 0 },
                    unmount: { y: 100 },
                  }}
                >
                  {changePasswordSuccess}
                </Alert>
              )}
              
              {/* Error Message */}
              {changePasswordError && (
                <Alert
                  color="red"
                  className="font-arabic text-right"
                  animate={{
                    mount: { y: 0 },
                    unmount: { y: 100 },
                  }}
                >
                  {changePasswordError}
                </Alert>
              )}
              
              {/* Old Password Input */}
              <div dir="rtl">
                <Input
                  type="password"
                  label="كلمة المرور الحالية"
                  size="lg"
                  className="font-arabic"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              {/* New Password Input */}
              <div dir="rtl">
                <Input
                  type="password"
                  label="كلمة المرور الجديدة"
                  size="lg"
                  className="font-arabic"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                
                {/* Password Strength Indicator */}
                {newPassword && passwordStrength.message && (
                  <div className="mt-1 text-sm flex gap-2 items-center justify-end">
                    <span className="font-arabic">قوة كلمة المرور:</span>
                    <span 
                      className="font-arabic font-medium"
                      style={{ color: passwordStrength.color }}
                    >
                      {passwordStrength.message}
                    </span>
                    <div className="h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${passwordStrength.color}-500`}
                        style={{ 
                          width: `${20 * passwordStrength.score}%`,
                          backgroundColor: passwordStrength.color
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Password Requirements */}
                {newPassword && (
                  <div className="mt-2 text-sm text-gray-600 font-arabic text-right">
                    <p>كلمة المرور يجب أن تكون:</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li className={newPassword.length >= 8 ? "text-green-500" : ""}>
                        ٨ أحرف على الأقل
                      </li>
                      <li className={newPassword.match(/[A-Z]/) ? "text-green-500" : ""}>
                        تحتوي على حرف كبير واحد على الأقل
                      </li>
                      <li className={newPassword.match(/[0-9]/) ? "text-green-500" : ""}>
                        تحتوي على رقم واحد على الأقل
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Confirm New Password Input */}
              <div dir="rtl">
                <Input
                  type="password"
                  label="تأكيد كلمة المرور الجديدة"
                  size="lg"
                  className="font-arabic"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                
                {/* Password Match Indicator */}
                {confirmNewPassword && (
                  <div className="mt-1 text-sm flex justify-end">
                    {newPassword === confirmNewPassword ? (
                      <p className="text-green-500 font-arabic">✓ كلمات المرور متطابقة</p>
                    ) : (
                      <p className="text-red-500 font-arabic">✗ كلمات المرور غير متطابقة</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-4 mt-4">
                <Button
                  variant="outlined"
                  color="red"
                  className="font-arabic"
                  onClick={handleCloseChangePassword}
                  disabled={isSubmitting}
                >
                  إلغاء
                </Button>
                
                <Button
                  variant="gradient"
                  color="blue"
                  className="font-arabic"
                  onClick={handleChangePassword}
                  disabled={isSubmitting || changePasswordSuccess}
                >
                  {isSubmitting ? "جاري التحديث..." : "حفظ التغييرات"}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </Navbar>
  );
}