"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  DatePicker,
  Button,
  Space,
  App,
} from "antd";
import {
  BarChartOutlined,
  UserOutlined,
  FileTextOutlined,
  RiseOutlined,
  FallOutlined,
  TrophyOutlined,
  CalendarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import MainLayout from "@/components/layouts/MainLayout";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

const { RangePicker } = DatePicker;

interface StatsData {
  overview: {
    totalCustomers: number;
    totalPrescriptions: number;
    prescriptionsToday: number;
    customersToday: number;
    prescriptionsThisWeek: number;
    customersThisWeek: number;
    prescriptionsThisMonth: number;
    customersThisMonth: number;
  };
  topCustomers: Array<{
    id: number;
    fullname: string;
    phone_number: string | null;
    prescriptionCount: number;
  }>;
  prescriptionTrend: Array<{
    date: string;
    count: number;
  }>;
}

export default function ReportsPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange?.[0]) {
        params.append("dateFrom", dateRange[0].format("YYYY-MM-DD"));
      }
      if (dateRange?.[1]) {
        params.append("dateTo", dateRange[1].format("YYYY-MM-DD"));
      }

      const res = await fetch(`/api/reports/stats?${params}`);
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
      } else {
        message.error(data.message || "Lỗi tải thống kê");
      }
    } catch {
      message.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [dateRange, message]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const topCustomersColumns: ColumnsType<StatsData["topCustomers"][0]> = [
    {
      title: "Hạng",
      key: "rank",
      width: 90,
      render: (_, __, index) => {
        const medals = ["🥇", "🥈", "🥉"];
        const colors = [
          "bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700",
          "bg-gradient-to-r from-gray-100 to-slate-100 text-slate-700",
          "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700",
        ];
        return (
          <div className="flex items-center justify-center">
            {index < 3 ? (
              <div
                className={`px-3 py-1.5 rounded-lg font-bold ${colors[index]}`}
              >
                {medals[index]} #{index + 1}
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-lg font-semibold bg-gray-50 text-gray-600">
                #{index + 1}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Khách hàng",
      dataIndex: "fullname",
      key: "fullname",
      render: (text) => (
        <span className="font-medium text-slate-700">{text}</span>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
      render: (text) => text || <span className="text-gray-400">-</span>,
    },
    {
      title: "Số đơn thuốc",
      dataIndex: "prescriptionCount",
      key: "prescriptionCount",
      align: "center",
      render: (count) => (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <FileTextOutlined className="text-blue-600" />
          <span className="font-bold text-blue-700">{count}</span>
        </div>
      ),
    },
  ];

  // Format trend data for chart
  const trendChartData =
    stats?.prescriptionTrend.map((item) => ({
      date: dayjs(item.date).format("DD/MM"),
      "Số đơn": item.count,
    })) || [];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <span className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <BarChartOutlined />
              </span>
              Báo cáo & Thống kê
            </h1>
            <p className="text-slate-500 mt-2">
              Phân tích dữ liệu và xu hướng kinh doanh
            </p>
          </div>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchStats}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Overview Statistics */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-slate-700">
            📊 Tổng quan
          </h2>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="border-0 shadow-md hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-emerald-500 rounded-xl shadow-lg">
                    <UserOutlined className="text-white text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-emerald-700 font-medium">
                      Tổng khách hàng
                    </div>
                    <div className="text-3xl font-bold text-emerald-600">
                      {stats?.overview.totalCustomers || 0}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="border-0 shadow-md hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                    <FileTextOutlined className="text-white text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-blue-700 font-medium">
                      Tổng đơn thuốc
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {stats?.overview.totalPrescriptions || 0}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="border-0 shadow-md hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                    <RiseOutlined className="text-white text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-purple-700 font-medium">
                      KH hôm nay
                    </div>
                    <div className="text-3xl font-bold text-purple-600">
                      {stats?.overview.customersToday || 0}
                    </div>
                    <div className="text-xs text-purple-500 mt-1">
                      / {stats?.overview.totalCustomers || 0} tổng
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="border-0 shadow-md hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-orange-50 to-red-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                    <CalendarOutlined className="text-white text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-orange-700 font-medium">
                      Đơn hôm nay
                    </div>
                    <div className="text-3xl font-bold text-orange-600">
                      {stats?.overview.prescriptionsToday || 0}
                    </div>
                    <div className="text-xs text-orange-500 mt-1">
                      / {stats?.overview.totalPrescriptions || 0} tổng
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Period Statistics */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-slate-700">
            📅 Thống kê theo thời gian
          </h2>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
                title={
                  <div className="flex items-center gap-2 text-cyan-700">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <CalendarOutlined className="text-cyan-600" />
                    </div>
                    <span className="font-semibold">Tuần này</span>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-cyan-700 font-medium mb-1">
                          Khách hàng mới
                        </div>
                        <div className="text-2xl font-bold text-cyan-600">
                          {stats?.overview.customersThisWeek || 0}
                        </div>
                      </div>
                      <div className="p-3 bg-cyan-500 rounded-lg">
                        <UserOutlined className="text-white text-xl" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-green-700 font-medium mb-1">
                          Đơn thuốc
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {stats?.overview.prescriptionsThisWeek || 0}
                        </div>
                      </div>
                      <div className="p-3 bg-green-500 rounded-lg">
                        <FileTextOutlined className="text-white text-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
                title={
                  <div className="flex items-center gap-2 text-purple-700">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CalendarOutlined className="text-purple-600" />
                    </div>
                    <span className="font-semibold">Tháng này</span>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-purple-700 font-medium mb-1">
                          Khách hàng mới
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {stats?.overview.customersThisMonth || 0}
                        </div>
                      </div>
                      <div className="p-3 bg-purple-500 rounded-lg">
                        <UserOutlined className="text-white text-xl" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-orange-700 font-medium mb-1">
                          Đơn thuốc
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                          {stats?.overview.prescriptionsThisMonth || 0}
                        </div>
                      </div>
                      <div className="p-3 bg-orange-500 rounded-lg">
                        <FileTextOutlined className="text-white text-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Prescription Trend Chart */}
        <Card
          className="border-0 shadow-md"
          title={
            <div className="flex items-center gap-2 text-indigo-700">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChartOutlined className="text-indigo-600" />
              </div>
              <span className="font-semibold">
                📈 Xu hướng đơn thuốc (30 ngày gần nhất)
              </span>
            </div>
          }
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendChartData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Số đơn"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 5 }}
                activeDot={{ r: 7, fill: "#2563eb" }}
                fill="url(#colorCount)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Customers */}
        <Card
          className="border-0 shadow-md"
          title={
            <div className="flex items-center gap-2 text-amber-700">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrophyOutlined className="text-amber-600 text-lg" />
              </div>
              <span className="font-semibold">🏆 Top 10 khách hàng VIP</span>
            </div>
          }
          loading={loading}
        >
          <Table
            columns={topCustomersColumns}
            dataSource={stats?.topCustomers || []}
            rowKey="id"
            pagination={false}
            size="middle"
            className="[&_.ant-table-thead>tr>th]:bg-gradient-to-r [&_.ant-table-thead>tr>th]:from-amber-50 [&_.ant-table-thead>tr>th]:to-yellow-50 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:text-amber-900"
          />
        </Card>
      </div>
    </MainLayout>
  );
}
