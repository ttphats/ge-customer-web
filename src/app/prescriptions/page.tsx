"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  DatePicker,
  Card,
  Statistic,
  Row,
  Col,
  Tag,
  Space,
  App,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  ClearOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

const { RangePicker } = DatePicker;

interface Prescription {
  id: number;
  ref_key: string;
  customer_id: number;
  examined_date: string | null;
  re_examinated_date: string | null;
  staff_name: string | null;
  created_at: string;
  customer: {
    id: number;
    fullname: string;
    phone_number: string | null;
    dateofbirth: Date | null;
    gender: number | null;
  };
}

interface Stats {
  today: number;
  week: number;
  month: number;
  total: number;
}

export default function PrescriptionsListPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [stats, setStats] = useState<Stats>({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
  });

  // Search filters
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [refKey, setRefKey] = useState("");
  const [staffName, setStaffName] = useState("");
  const [examinedDateRange, setExaminedDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(customerName && { customerName }),
        ...(phoneNumber && { phoneNumber }),
        ...(refKey && { refKey }),
        ...(staffName && { staffName }),
        ...(examinedDateRange?.[0] && {
          examinedDateFrom: examinedDateRange[0].format("YYYY-MM-DD"),
        }),
        ...(examinedDateRange?.[1] && {
          examinedDateTo: examinedDateRange[1].format("YYYY-MM-DD"),
        }),
      });

      const res = await fetch(`/api/prescriptions/list?${params}`);
      const data = await res.json();

      if (data.success) {
        setPrescriptions(data.data.items);
        setTotal(data.data.total);
      } else {
        message.error(data.message || "Lỗi tải danh sách đơn thuốc");
      }
    } catch {
      message.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    customerName,
    phoneNumber,
    refKey,
    staffName,
    examinedDateRange,
    message,
  ]);

  const fetchStats = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const [todayRes, weekRes, monthRes, totalRes] = await Promise.all([
        fetch(
          `/api/prescriptions/list?examinedDateFrom=${today.toISOString()}&pageSize=1`,
        ),
        fetch(
          `/api/prescriptions/list?examinedDateFrom=${weekStart.toISOString()}&pageSize=1`,
        ),
        fetch(
          `/api/prescriptions/list?examinedDateFrom=${monthStart.toISOString()}&pageSize=1`,
        ),
        fetch(`/api/prescriptions/list?pageSize=1`),
      ]);

      const [todayData, weekData, monthData, totalData] = await Promise.all([
        todayRes.json(),
        weekRes.json(),
        monthRes.json(),
        totalRes.json(),
      ]);

      setStats({
        today: todayData.success ? todayData.data.total : 0,
        week: weekData.success ? weekData.data.total : 0,
        month: monthData.success ? monthData.data.total : 0,
        total: totalData.success ? totalData.data.total : 0,
      });
    } catch {
      // Ignore stats errors
    }
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearch = () => {
    setPage(1);
    fetchPrescriptions();
  };

  const handleClearSearch = () => {
    setCustomerName("");
    setPhoneNumber("");
    setRefKey("");
    setStaffName("");
    setExaminedDateRange(null);
    setPage(1);
  };

  const handleViewPrescription = (id: number) => {
    router.push(`/prescriptions/${id}`);
  };

  const handleViewCustomer = (customerId: number) => {
    router.push(`/customers/${customerId}`);
  };

  const columns: ColumnsType<Prescription> = [
    {
      title: "Mã đơn",
      dataIndex: "ref_key",
      key: "ref_key",
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.customer.fullname}</div>
          {record.customer.phone_number && (
            <div className="text-xs text-gray-500">
              <PhoneOutlined className="mr-1" />
              {record.customer.phone_number}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Ngày khám",
      dataIndex: "examined_date",
      key: "examined_date",
      width: 120,
      render: (date) =>
        date ? (
          dayjs(date).format("DD/MM/YYYY")
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: "Ngày tái khám",
      dataIndex: "re_examinated_date",
      key: "re_examinated_date",
      width: 120,
      render: (date) =>
        date ? (
          <Tag color="orange">{dayjs(date).format("DD/MM/YYYY")}</Tag>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: "Nhân viên",
      dataIndex: "staff_name",
      key: "staff_name",
      width: 150,
      render: (text) => text || <span className="text-gray-400">-</span>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewPrescription(record.id)}
          >
            Xem đơn
          </Button>
          <Button
            type="link"
            icon={<UserOutlined />}
            onClick={() => handleViewCustomer(record.customer_id)}
          >
            Khách hàng
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <span className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <MedicineBoxOutlined />
              </span>
              Danh sách đơn thuốc
            </h1>
            <p className="text-slate-500 mt-2">
              Quản lý và tra cứu tất cả đơn thuốc trong hệ thống
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Hôm nay"
                value={stats.today}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tuần này"
                value={stats.week}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tháng này"
                value={stats.month}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng cộng"
                value={stats.total}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Search & Filters */}
        <Card>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="Tên khách hàng..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onPressEnter={handleSearch}
                prefix={<UserOutlined className="text-gray-400" />}
                allowClear
              />
              <Input
                placeholder="Số điện thoại..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onPressEnter={handleSearch}
                prefix={<PhoneOutlined className="text-gray-400" />}
                allowClear
              />
              <Input
                placeholder="Mã đơn..."
                value={refKey}
                onChange={(e) => setRefKey(e.target.value)}
                onPressEnter={handleSearch}
                prefix={<FileTextOutlined className="text-gray-400" />}
                allowClear
              />
              <Input
                placeholder="Nhân viên..."
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <RangePicker
                value={examinedDateRange}
                onChange={(dates) => setExaminedDateRange(dates)}
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
                className="w-64"
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
              >
                Tìm kiếm
              </Button>
              {(customerName ||
                phoneNumber ||
                refKey ||
                staffName ||
                examinedDateRange) && (
                <Button icon={<ClearOutlined />} onClick={handleClearSearch}>
                  Xóa bộ lọc
                </Button>
              )}
              <div className="flex-1" />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchPrescriptions}
                loading={loading}
              >
                Làm mới
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={prescriptions}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page,
              pageSize: pageSize,
              total,
              showSizeChanger: true,
              showTotal: (t, range) =>
                `Hiển thị ${range[0]}-${range[1]} trong tổng số ${t} đơn thuốc`,
              pageSizeOptions: ["10", "20", "50", "100"],
              showQuickJumper: true,
              onChange: (newPage, newPageSize) => {
                setPage(newPage);
                setPageSize(newPageSize);
              },
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>
    </MainLayout>
  );
}
