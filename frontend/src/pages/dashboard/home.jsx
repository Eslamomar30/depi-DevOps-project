import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
  projectsTableData,
  ordersOverviewData,
} from "@/data";
import { BanknotesIcon, CheckCircleIcon, ClockIcon, UsersIcon } from "@heroicons/react/24/solid";
import api from "@/configs/api";

export function Home() {

    const stats_temp = [
    {
      "title":"عدد الشهادات المصدرة",
      "value":153,
      "icon":BanknotesIcon,
footer: {
  color: "text-green-500",
  value: "+55%",
  label: "عن الأسبوع الماضي",
},

    },
        {
      "title":"عدد الطلاب المسجلين",
      "value":89,
      "icon":UsersIcon,
footer: {
  color: "text-green-500",
  value: "+3%",
  label: "عن الشهر الماضي",
},
    },
    
  ]

  const [stats, setStats] = useState(stats_temp);
  const [loading, setLoading] = useState(true);

  // Fetch stats from the backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/certificates/stats");
        setStats([
          {
            title: "عدد الشهادات المصدرة",
            value: response.data.totalCerts,
            icon: BanknotesIcon,
            footer: {
              color: "text-green-500",
              value: "+55%",
              label: "عن الأسبوع الماضي",
            },
          },
          {
            title: "عدد الطلاب المسجلين",
            value: response.data.uniqueStudents,
            icon: UsersIcon,
            footer: {
              color: "text-green-500",
              value: "+3%",
              label: "عن الشهر الماضي",
            },
          },
        ]);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);


  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6 grid-cols-2 4">
        {stats.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            loading={loading}
          />
        ))}
      </div>
      {/* <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {statisticsChartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div> */}

    </div>
  );
}

export default Home;
