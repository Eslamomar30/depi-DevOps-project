import {
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import api from "@/configs/api";
import Cookies from "js-cookie";

export function SignIn() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { username, password });
      const token = response.data.token;
      Cookies.set("authToken", token, { expires: 7 });
      toast.success("تم تسجيل الدخول بنجاح!");
      navigate("/dashboard");
    } catch (error) {
      const msg =
        error.response?.data?.message || "حدث خطأ أثناء تسجيل الدخول";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gray-50 p-4">
      {/* Left: Logo & Form */}
      <div className="w-full lg:w-3/5 max-w-md">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Typography variant="h3" className="font-arabic text-3xl lg:text-5xl">
            حلول التعليمية
          </Typography>
          <div className="w-12 h-12 lg:w-16 lg:h-16">
            <img src="/img/logo.jpg" alt="Logo" className="rounded-full" />
          </div>
        </div>
        {/* Form Container */}
        <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6">
          <Typography
            variant="h2"
            className="font-bold text-2xl text-center mb-4 font-arabic"
          >
            تسجيل دخول
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-sm text-center mb-6 font-arabic text-gray-600"
          >
            ادخل اسم المستخدم وكلمة المرور لتسجيل الدخول للموقع
          </Typography>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex flex-col">
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-1 text-right font-arabic"
              >
                اسم المستخدم
              </Typography>
              <Input
                size="lg"
                placeholder="اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="font-arabic"
              />
            </div>
            <div className="flex flex-col">
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-1 text-right font-arabic"
              >
                كلمة المرور
              </Typography>
              <Input
                type="password"
                size="lg"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-arabic"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              fullWidth
              className="mt-4 font-arabic text-lg"
            >
              {loading ? "جارٍ الدخول..." : "تسجيل دخول"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right: Illustration (hidden on small screens) */}
      <div className="w-full lg:w-2/5 mt-8 lg:mt-0 flex justify-center">
        <img
          src="/img/pattern.png"
          alt="Pattern"
          className="hidden lg:block w-3/4 h-auto object-cover rounded-2xl shadow-lg"
        />
      </div>
    </section>
  );
}

export default SignIn;
